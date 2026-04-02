import mongoose from 'mongoose';

export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/app';

  await mongoose.connect(uri);

  console.log('Connected to MongoDB');

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });
}
