import {
	createCategory,
	createGame,
	createCustomer,
	updateCustomer,
	createRental,
	finalizeRental,
	deleteRentalById
} from './queryHandlers.js'


export const handleCategoryCreation = async requisitionBody => {
	let status = null

	const statusMessages = {
		201: 'Categoria criada com sucesso!',
		400: 'O nome da categoria não pode estar vazio!',
		409: 'Categoria já existente!'
	}

	const { name } = requisitionBody

	if (!name) status = 400
	else status = await createCategory(requisitionBody)

	return { status, statusMessages: statusMessages[status] }
}

export const handleGameCreation = async requisitionBody => {

	let status = null

	const statusMessages = {
		201: 'Jogo criado com sucesso!',
		400: 'Os dados do jogo não estão preenchidos corretamente',
		409: 'Jogo já existente!'
	}

	const { name, stockTotal, pricePerDay } = requisitionBody

	if (!name || stockTotal <= 0 || pricePerDay <= 0) {
		status = 400
	} else status = await createGame(requisitionBody)

	return { status, statusMessages: statusMessages[status] }
}

export const handleCustomerCreation = async requisitionBody => {

	let status = null

	const statusMessages = {
		201: 'Cliente adicionado com sucesso!',
		400: 'Os dados do cliente não estão preenchidos corretamente',
		409: 'Cliente já cadastrado!'
	}

	const { name, phone, cpf, birthday } = requisitionBody

	const isValidCpf = /[0-9]{11}/.test(cpf)
	const isValidPhone = /[0-9]{10,11}/.test(phone)
	let isValidBirthDay = /[0-9]{1,}-[0-9]{1,2}-[0-9]{1,2}/.test(birthday)
	if (Number.isNaN(Date.parse(birthday))) isValidBirthDay = false

	if (!isValidCpf || !isValidPhone || !isValidBirthDay || !name) status = 400
	else status = await createCustomer(requisitionBody)

	return { status, statusMessages: statusMessages[status] }
}

export const handleCustomerUpdate = async (requisitionBody, id) => {

	let status = null

	const statusMessages = {
		20: 'Cliente atualizado com sucesso!',
		400: 'Os dados do cliente não estão preenchidos corretamente',
		409: 'CPF já cadastrado!'
	}

	const { name, phone, cpf, birthday } = requisitionBody

	const isValidCpf = /[0-9]{11}/.test(cpf)
	const isValidPhone = /[0-9]{10,11}/.test(phone)
	let isValidBirthDay = /[0-9]{1,}-[0-9]{1,2}-[0-9]{1,2}/.test(birthday)
	if (Number.isNaN(Date.parse(birthday))) isValidBirthDay = false

	if (!isValidCpf || !isValidPhone || !isValidBirthDay || !name) status = 400
	else status = await updateCustomer(requisitionBody, id)

	return { status, statusMessages: statusMessages[status] }
}

export const handleRentalCreation = async requisitionBody => {

	let status = null

	const statusMessages = {
		200: 'Jogo alugado com sucesso!',
		400: 'Os dados não estão preenchidos corretamente',
		409: 'Cliente já cadastrado!'
	}

	const { daysRented } = requisitionBody

	if (daysRented <= 0) {
		return status = 400
	} else status = await createRental(requisitionBody)

	return { status, statusMessages: statusMessages[status] }
}

export const handleRentalFinalization = async id => {

	let status = null

	const statusMessages = {
		200: 'Aluguel do jogo finalizado com sucesso!',
		400: 'Os dados não estão preenchidos corretamente',
		409: 'Cliente já cadastrado!'
	}

	status = await finalizeRental(id)

	return { status, statusMessages: statusMessages[status] }
}

export const handleDeleteRental = async id => {
	let status = null

	const statusMessages = {
		200: 'Aluguel do jogo finalizado com sucesso!',
		400: 'Os dados não estão preenchidos corretamente',
		409: 'Cliente já cadastrado!'
	}

	status = await deleteRentalById(id)

	return { status, statusMessages: statusMessages[status] }
}