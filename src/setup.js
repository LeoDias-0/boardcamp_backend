import dotenv from 'dotenv'


const { NODE_ENV } = process.env

let path

if (NODE_ENV === 'dev') {
	path = '.env.dev'
} else if (NODE_ENV === 'test') {
	path = '.env.test'
} else {
	path = '.env'
}


dotenv.config({
	path
})