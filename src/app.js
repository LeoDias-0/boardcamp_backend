import express from 'express'
import cors from 'cors'

import {
	getGames,
	getCustomers,
	getCustomerById,
	getRentals
} from '../queryHandlers.js'

import {
	handleCategoryCreation,
	handleGameCreation,
	handleCustomerCreation,
	handleCustomerUpdate,
	handleRentalCreation,
	handleRentalFinalization,
	handleDeleteRental
} from '../requisitionHandlers.js'

import * as categoryController from './controllers/categoryController.js'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/categories', categoryController.getCategories)

app.post('/categories', categoryController.createCategory)

app.get("/games", async (req, res) => {
	const games = await getGames(req.query.name)
	res.status(200).send(games)
})

app.post('/games', async (req, res) => {
	const { status, statusMessages } = await handleGameCreation(req.body)
	res.status(status).send(statusMessages)
})

app.get("/customers", async (req, res) => {
	const customers = await getCustomers(req.query.cpf)
	res.status(200).send(customers)
})

app.get("/customers/:id", async (req, res) => {
	const { status, data } = await getCustomerById(req.params.id)
	if (status == 200) res.status(status).send(data)
	else res.status(status).send('Cliente não existe!')
})

app.post('/customers', async (req, res) => {
	const { status, statusMessages } = await handleCustomerCreation(req.body)
	res.status(status).send(statusMessages)
})

app.put('/customers/:id', async (req, res) => {
	const { status, statusMessages } = await handleCustomerUpdate(req.body, req.params.id)
	res.status(status).send(statusMessages)
})

app.get("/rentals", async (req, res) => {
	const { status, data } = await getRentals()
	res.status(status).send(data)
})

app.post("/rentals", async (req, res) => {
	const { status, data } = await handleRentalCreation(req.body)
	res.status(status).send(data)
})

app.post("/rentals/:id/return", async (req, res) => {
	const { status, data } = await handleRentalFinalization(req.params.id)
	res.status(status).send(data)
})

app.delete("/rentals/:id", async (req, res) => {
	const { status, data } = await handleDeleteRental(req.params.id)
	res.status(status).send(data)
})

export default app