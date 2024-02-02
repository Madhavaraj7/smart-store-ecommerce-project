const mongoose = require('mongoose')

const dbConnect = async () => {
	try {
        const data = await mongoose.connect(process.env.DBHOST)
        console.log(`Mongodb connected with server`)
    } catch (error) {
        console.error('Error connecting to MongoDB:', error)
    }
}

module.exports = dbConnect
