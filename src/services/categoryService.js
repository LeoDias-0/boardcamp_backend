import * as categoryRepository from '../repositories/categoryRepository.js'


const handleCategoryCreation = async (categoryName) => {
	const categoriesWithThatName = await categoryRepository.findCategoryByName(categoryName)

	if (categoriesWithThatName.length > 0) return null

	await categoryRepository.insertCategory(categoryName)
	return true
}

export {
	handleCategoryCreation
}