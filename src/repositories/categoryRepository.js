import connection from '../database/database.js'


const listCategories = async () => {
	const categories = await connection.query(`
		SELECT * FROM categories;
	`)

	return categories.rows
}

const findCategoryByName = async (categoryName) => {
	const categoriesWithThatName = await connection.query(`
		SELECT * FROM categories WHERE name = $1;
	`, [categoryName])

	return categoriesWithThatName.rows
}

const insertCategory = async (categoryName) => {
	await connection.query(`
		INSERT INTO categories (name) VALUES ($1);
	`, [categoryName])
}

export {
	listCategories,
	findCategoryByName,
	insertCategory
}