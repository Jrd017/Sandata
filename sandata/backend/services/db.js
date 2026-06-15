const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let memoryServer;

async function connectDatabase() {
  const uri = process.env.MONGO_URI;

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    const canFallback = process.env.NODE_ENV !== 'production';
    if (!canFallback) throw err;

    console.warn(`MongoDB at ${uri} is unavailable; starting in-memory MongoDB for local dev.`);
    memoryServer = await MongoMemoryServer.create({ instance: { dbName: 'sandata' } });
    await mongoose.connect(memoryServer.getUri());
    console.log('In-memory MongoDB connected');
  }
}

async function disconnectDatabase() {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}

module.exports = { connectDatabase, disconnectDatabase };
