import mongoose from 'mongoose';

export async function connectDB(uri) {
  if (!uri) throw new Error('MongoDB connection URI is required');

  // modern mongoose / mongodb driver don't require old parser/topology flags
  // leave options empty or include only supported runtime tuning options if needed
  const opts = {};

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri);
    // eslint-disable-next-line no-console
    console.log('MongoDB connected');

    mongoose.connection.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      // eslint-disable-next-line no-console
      console.warn('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await disconnectDB();
      // eslint-disable-next-line no-console
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to connect to MongoDB:', err);
    throw err;
  }
}

export async function disconnectDB() {
  try {
    await mongoose.disconnect();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error disconnecting MongoDB:', err);
  }
}

export default connectDB;
