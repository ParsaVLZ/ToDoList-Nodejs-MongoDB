const { getDB } = require('../db/mongo-connection');
const { ObjectId } = require('mongodb')

async function insertTask(task) {
    const db = getDB();
    return await db.collection('tasks').insertOne(task);
}

async function updateTask(id, taskUpdate) {
    const db = getDB();
    return await db.collection('tasks').updateOne({ _id: new ObjectId(id) }, { $set: taskUpdate });
}

async function deleteTask(id) {
    const db = getDB();
    return await db.collection('tasks').deleteOne({ _id: new ObjectId(id) });
}

async function findTasks() {
    const db = getDB();
    return await db.collection('tasks').find({}).toArray();
}

module.exports = { insertTask, updateTask, deleteTask, findTasks };
