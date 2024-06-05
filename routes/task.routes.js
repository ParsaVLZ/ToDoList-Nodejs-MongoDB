const { insertTask, updateTask, deleteTask, findTasks } = require('../models/task.model');
const handleError = require('../handleError');

const VALID_STATUSES = ["in-progress", "canceled", "done"];

async function taskRoutes(req, res) {
    try {
        if (req.method === 'GET' && req.url === '/tasks') {
            try {
                const tasks = await findTasks();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(tasks));
            } catch (err) {
                handleError(err, res);
            }
        } else if (req.method === 'POST' && req.url === '/tasks') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', async () => {
                try {
                    const task = JSON.parse(body);
                    console.log('Received task:', task);
                    if (!VALID_STATUSES.includes(task.status)) {
                        if (!res.headersSent) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Invalid status value' }));
                        }
                        return;
                    }
                    try {
                        const result = await insertTask(task);
                        console.log('Inserted task:', result);
                        if (result && result.acknowledged) {
                            if (!res.headersSent) {
                                res.writeHead(201, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ ...task, _id: result.insertedId }));
                            }
                        } else {
                            throw new Error('Failed to create new task');
                        }
                    } catch (err) {
                        console.error('Error inserting task:', err);
                        handleError(err, res);
                    }
                } catch (error) {
                    console.error('Error parsing task or validation:', error);
                    handleError(error, res);
                }
            });
        } else if (req.method === 'PUT' && req.url.startsWith('/tasks/')) {
            const id = req.url.split('/')[2];
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', async () => {
                try {
                    const taskUpdate = JSON.parse(body);
                    console.log('Received task update:', taskUpdate);
                    if (taskUpdate.status && !VALID_STATUSES.includes(taskUpdate.status)) {
                        if (!res.headersSent) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Invalid status value' }));
                        }
                        return;
                    }
                    try {
                        const updatedTask = await updateTask(id, taskUpdate);
                        console.log('Updated task:', updatedTask);
                        if (!res.headersSent) {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify(updatedTask));
                        }
                    } catch (err) {
                        console.error('Error updating task:', err);
                        handleError(err, res);
                    }
                } catch (error) {
                    console.error('Error parsing task update or validation:', error);
                    handleError(error, res);
                }
            });
        } else if (req.method === 'DELETE' && req.url.startsWith('/tasks/')) {
            const id = req.url.split('/')[2];
            try {
                await deleteTask(id);
                console.log('Deleted task with ID:', id);
                if (!res.headersSent) {
                    res.writeHead(204);
                    res.end();
                }
            } catch (err) {
                console.error('Error deleting task:', err);
                handleError(err, res);
            }
        } else {
            if (!res.headersSent) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Not found' }));
            }
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        handleError(error, res);
    }
}

module.exports = taskRoutes;
