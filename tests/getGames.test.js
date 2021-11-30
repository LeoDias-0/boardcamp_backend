import '../src/setup.js'
import app from '../src/app.js'
import supertest from 'supertest'
import connection from '../src/database/database.js'
import faker from 'faker'


let categories = []
let games = []

const populateCategories = async () => {
	const qtyItems = Math.floor(Math.random() * 9 + 2)
	categories = [...Array(qtyItems)].map(() => faker.commerce.department())

	const fakerCategories = categories.map(a => `('${a}')`).join(', ')

	await connection.query(`
		INSERT INTO categories (name) VALUES ${fakerCategories};
	`)
}

const populateGames = async () => {

	const categoriesResponse = await connection.query(`
		SELECT id FROM categories;
	`)

	categories = categoriesResponse.rows

	games = [
		['Banco Imobiliário', 'http://', 3, categories[0].id, 1500],
		['Detetive', 'http://', 1, categories[1].id, 2500]
	]

	const gamesString = games.map(game => game.map(a => {
		if (typeof (a) === typeof ('')) return `'${a}'`
		return a
	}).join(', '))

	await connection.query(`
		INSERT INTO games (
			name,
			image,
			"stockTotal",
			"categoryId",
			"pricePerDay"
			) VALUES (${gamesString[0]}), (${gamesString[1]});
	`)
}


beforeEach(async () => {
	await connection.query(`DELETE FROM categories;`)
	await connection.query(`DELETE FROM games;`)
	await populateCategories()
	await populateGames(categories)
})

afterAll(() => {
	connection.end()
})

describe('GET /categories', () => {
	it('returns a list with all categories', async () => {
		expect(200).toEqual(200)
	})
})