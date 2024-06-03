const { MongoClient } = require('mongodb');
const { url, dbName } = require('./config');

let db = null;

async function connectToMongoDB() {
    const client = new MongoClient(url);
    try {
        await client.connect();
        db = client.db(dbName);
        console.log('Successfully connected to MongoDB:', dbName);
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw error; 
    }
}

function getDB() {
    if (!db) {
        throw new Error("Database not initialized because of an unexpected error!");
    }
    return db;
}

module.exports = { connectToMongoDB, getDB };