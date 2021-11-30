import '../src/setup.js'
import app from '../src/app.js'
import supertest from 'supertest'
import connection from '../src/database/database.js'
import faker from 'faker'

let categories = []

const populateCategories = async () => {
	const qtyItems = Math.floor(Math.random() * 9 + 1)
	categories = [...Array(qtyItems)].map(() => faker.commerce.department())

	const fakerCategories = categories.map(a => `('${a}')`).join(', ')

	await connection.query(`
		INSERT INTO categories (name) VALUES ${fakerCategories};
	`)
}

beforeEach(async () => {
	await connection.query(`DELETE FROM categories;`)
	await populateCategories()
})

afterAll(() => {
	connection.end()
})

describe('GET /categories', () => {
	it('returns a list with all categories', async () => {

		const result = await supertest(app).get('/categories').send()

		const { body: resultCategories, status } = result

		expect(status).toEqual(200)

		expect(resultCategories.map(item => item.name)).toEqual(categories)

	})
})