import * as categoryService from '../services/categoryService.js'

import * as categoryRepository from '../repositories/categoryRepository.js'

const getCategories = async (req, res) => {

	try {
		const categories = await categoryRepository.listCategories()

		return res.status(200).send(categories)
	} catch (error) {
		return res.sendStatus(500)
	}
}

const createCategory = async (req, res) => {
	const { name } = req.body

	if (!name) return res.sendStatus(400)

	try {
		const categoryCreated = await categoryService.handleCategoryCreation(name)

		if (!categoryCreated) return res.sendStatus(409)

		return res.sendStatus(201)
	} catch (error) {
		return res.sendStatus(500)
	}


}

export {
	getCategories,
	createCategory
}