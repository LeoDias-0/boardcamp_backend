import '../src/setup.js'
import app from '../src/app.js'
import supertest from 'supertest'
import connection from '../src/database/database.js'
import faker from 'faker'


const createRandomCategory = async () => {

	const name = faker.commerce.department()

	await connection.query(`
		INSERT INTO categories (name) VALUES ('${name}');
	`)

	return name
}

beforeEach(async () => {
	await connection.query(`DELETE FROM categories;`)
})

afterAll(() => {
	connection.end()
})

describe('POST /categories', () => {
	it('should return 200 when creating a new category', async () => {

		const categoryName = faker.commerce.department()

		const body = { name: categoryName }

		const result = await supertest(app).post('/categories').send(body)

		const { status } = result

		expect(status).toEqual(201)

	})

	it('should return 400 when name atribute is empty', async () => {

		const body = { name: '' }

		const result = await supertest(app).post('/categories').send(body)

		const { status } = result

		expect(status).toEqual(400)

	})

	it('should return 400 when body does not have name atribute', async () => {

		const body = {}

		const result = await supertest(app).post('/categories').send(body)

		const { status } = result

		expect(status).toEqual(400)

	})

	it('should return 409 when try to create a category that already exists', async () => {

		const name = await createRandomCategory()

		const body = { name }

		const result = await supertest(app).post('/categories').send(body)

		const { status } = result

		expect(status).toEqual(409)

	})
})