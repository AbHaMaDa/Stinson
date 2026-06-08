import mongoose from 'mongoose'

export async function connectDB(uri) {
  if (!uri) throw new Error('MONGODB_URI is not set')
  mongoose.set('strictQuery', true)
  mongoose.set('bufferCommands', false)
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 20000,
    maxPoolSize: 5,
  })
  console.log('[db] connected to mongo')
}
