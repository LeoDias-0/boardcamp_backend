import dayjs from 'dayjs'
import connection from './src/database/database.js'

export const getCategories = async () => {
	const categories = await connection.query(`SELECT * FROM categories`)
	return categories.rows
}

export const createCategory = async (requisitionBody) => {
	const { categoryName } = requisitionBody

	const existsQuery = 'SELECT EXISTS (SELECT * FROM categories WHERE name = $1)'
	let categoryAlreadyExists = await connection.query(existsQuery, [categoryName])
	categoryAlreadyExists = categoryAlreadyExists.rows[0].exists

	if (categoryAlreadyExists) return 409

	const query = 'INSERT INTO categories (name) VALUES ($1);'
	connection.query(query, [categoryName])
	return 201
}

export const getGames = async (nameQuery = null) => {
	let query
	if (!nameQuery) query = [`SELECT * FROM games;`]
	else query = [`SELECT * FROM games WHERE LOWER(name) LIKE $1;`, [`${nameQuery}%`]]

	const promise = connection.query(...query)
	return await promise.then(res => res.rows)
}

export const createGame = async (requisitionBody) => {
	const { name, image, stockTotal, categoryId, pricePerDay } = requisitionBody

	const existsCategoryIdQuery = 'SELECT * FROM categories WHERE id = $1;'
	let existsCategoryId = await connection.query(existsCategoryIdQuery, [categoryId])
	existsCategoryId = existsCategoryId.rowCount > 0

	if (!existsCategoryId) return 400

	const existsQuery = 'SELECT * FROM games WHERE name = $1'
	let gameAlreadyExists = await connection.query(existsQuery, [name])
	gameAlreadyExists = gameAlreadyExists.rows.length != 0

	if (gameAlreadyExists) return 409

	const keys = `name, image, "stockTotal", "categoryId", "pricePerDay"`
	const values = Object.values(requisitionBody)

	const query = `INSERT INTO games (${keys}) VALUES ($1, $2, $3, $4, $5);`

	await connection.query(query, [...values])
	return 201
}

export const getCustomers = async (cpfQuery = null) => {
	let query
	if (!cpfQuery) query = [`SELECT * FROM customers;`]
	else query = [`SELECT * FROM customers WHERE cpf LIKE $1;`, [`${cpfQuery}%`]]

	const promise = connection.query(...query)
	return await promise.then(res => res.rows)
}

export const getCustomerById = async (id) => {
	const query = `SELECT * FROM customers WHERE id = $1;`

	const customer = await connection.query(query, [id]).then(res => res.rows)
	if (customer.length == 0) return { status: 404, data: null }
	return { status: 200, data: customer[0] }
}

export const createCustomer = async requisitionBody => {
	const { name, phone, cpf, birthday } = requisitionBody

	if (!name || cpf.length !== 11 || phone.length < 10 || phone.length > 11) {
		return 400
	}

	if (dayjs() <= dayjs(birthday)) return 400

	const queryCustomers = `SELECT * FROM customers WHERE cpf = $1;`
	const customers = await connection.query(queryCustomers, [cpf])
	const isThereACustomer = customers.rowCount > 0

	if (isThereACustomer) return 409

	const keys = Object.keys(requisitionBody)
	const values = Object.values(requisitionBody)

	const query = `INSERT INTO customers (${keys.join(', ')}) VALUES ($1, $2, $3, $4);`

	await connection.query(query, [...values])
	return 201
}

export const updateCustomer = async (requisitionBody, id) => {
	const { name, phone, cpf, birthday } = requisitionBody

	if (!name || cpf.length !== 11 || phone.length < 10 || phone.length > 11) {
		return 400
	}

	if (dayjs() <= dayjs(birthday)) return 400

	const queryCustomers = `SELECT * FROM customers WHERE cpf = $1;`
	const customers = await connection.query(queryCustomers, [cpf])
	const isThereACustomer = customers.rowCount > 0

	if (isThereACustomer) return 409

	const values = Object.values(requisitionBody)

	const query = `
    UPDATE customers
        SET
            name = $1,
            phone = $2,
            cpf = $3,
            birthday = $4
    WHERE id = $5
    `

	await connection.query(query, [...values, id])
	return 200
}

export const getRentals = async () => {

	const query = `SELECT * FROM rentals;`

	let rentals = await connection.query(query).then(res => res.rows)

	rentals = await Promise.all(rentals.map(async rental => {
		const { customerId, gameId } = rental

		const queryCustomer = `SELECT * FROM customers WHERE id = $1;`
		const customer = await connection.query(queryCustomer, [customerId]).then(res => res.rows[0])

		const queryGame = `SELECT * FROM games WHERE id = $1;`
		const game = await connection.query(queryGame, [gameId]).then(res => res.rows[0])

		return { ...rental, customer, game }
	}))

	return { status: 200, data: rentals }
}

export const createRental = async requisitionBody => {
	const rental = requisitionBody
	const { customerId, gameId, daysRented } = rental

	if (daysRented <= 0) return 400

	const formatDate = d => {
		return `${d.getFullYear()}-${`0${d.getMonth() + 1}`.slice(-2)}-${`0${d.getDate()}`.slice(-2)}`
	}

	const queryGameId = `SELECT * FROM games WHERE id = $1;`
	const game = await connection.query(queryGameId, [gameId])
	const gameExists = game.rowCount > 0


	if (!gameExists) return 400

	const queryCustomerId = `SELECT * FROM customers WHERE id = $1;`
	const customer = await connection.query(queryCustomerId, [customerId])
	const customerExists = customer.rowCount > 0

	if (!customerExists) return 400

	const rentalsCountQuery = `SELECT * FROM rentals WHERE "gameId" = $1;`
	let rentedGames = await connection.query(rentalsCountQuery, [gameId])

	rentedGames = rentedGames.rowCount

	if (!gameExists || !customerExists || game.rows[0].stockTotal <= rentedGames) return 400

	rental.rentDate = dayjs().format('YYYY/MM/DD') //formatDate(new Date())
	rental.originalPrice = game.rows[0].pricePerDay * daysRented
	rental.returnDate = null
	rental.delayFee = null

	const {
		rentDate,
		returnDate,
		originalPrice,
		delayFee
	} = rental


	const values = [
		customerId,
		gameId,
		rentDate,
		daysRented,
		returnDate,
		originalPrice,
		delayFee
	]

	try {
		const query = `INSERT INTO rentals
		(
			"customerId",
			"gameId",
			"rentDate",
			"daysRented",
			"returnDate",
			"originalPrice",
			"delayFee"
		) VALUES ($1, $2, $3, $4, $5, $6, $7);`

		await connection.query(query, values)
	} catch (error) {
		console.log(error)
	}

	return 201
}

export const finalizeRental = async id => {

	const formatDate = d => {
		return `${d.getFullYear()}-${`0${d.getMonth() + 1}`.slice(-2)}-${`0${d.getDate()}`.slice(-2)}`
	}

	const queryRental = `SELECT * FROM rentals WHERE id = $1;`

	let rental = await connection.query(queryRental, [id])
	const rentalExists = rental.rowCount > 0

	if (!rentalExists) return 404

	rental = rental.rows[0]

	if (rental.returnDate) return 400

	const returnDate = dayjs()

	const { rentDate, daysRented, originalPrice } = rental

	const diffDays = dayjs(returnDate).diff(rentDate, 'day') - daysRented

	let delayFee = diffDays * originalPrice / daysRented
	delayFee = delayFee > 0 ? Number(delayFee) : 0


	const query = `
    UPDATE rentals
        SET
            "returnDate" = $1,
            "delayFee" = $2
    WHERE id = $3;
    `

	await connection.query(query, [returnDate, delayFee, id])
	return 200
}

export const deleteRentalById = async id => {
	const queryRentalId = `SELECT * FROM rentals WHERE id = $1;`
	const rental = await connection.query(queryRentalId, [id])
	const rentalExists = rental.rowCount > 0

	if (!rentalExists) return 404

	if (rental.rows[0].returnDate !== null) return 400

	const query = `DELETE FROM rentals WHERE id = $1;`

	await connection.query(query, [id])

	return 200
}