import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './db/connection.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

async function start() {
	try {
		if (!MONGODB_URI) throw new Error('MONGODB_URI is not set in environment');
		await connectDB(MONGODB_URI);
		app.listen(PORT, () => {
			// eslint-disable-next-line no-console
			console.log(`Server listening on port ${PORT}`);
		});
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('Failed to start server:', err);
		process.exit(1);
	}
}

start();
