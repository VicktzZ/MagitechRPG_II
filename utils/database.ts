import mongoose from 'mongoose'

let isConnected = false

export const connectToDb = async (): Promise<void> => {
    mongoose.set('strictQuery', true)

    if (isConnected) {
        console.log('MongoDB is already connected')
        return
    } 

    try {
        const dbName = process.env.NODE_ENV === 'development' ? 'magitech_dev' : 'magitech';
        
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'magitech'
        })

        isConnected = true

        console.log(`MongoDB connected to database: ${dbName}`)
    } catch (error) {
        console.log(error)
    }
}