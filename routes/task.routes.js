const { insertTask, updateTask, deleteTask, findTasks } = require('../models/task.model');

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
                    if (!VALID_STATUSES.includes(task.status)) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Invalid status value' }));
                        return;
                    }
                    try {
                        const newTask = await insertTask(task);
                        res.writeHead(201, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(newTask.ops[0]));
                    } catch (err) {
                        handleError(err, res);
                    }
                } catch (error) {
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
                    if (taskUpdate.status && !VALID_STATUSES.includes(taskUpdate.status)) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Invalid status value' }));
                        return;
                    }
                    try {
                        const updatedTask = await updateTask(id, taskUpdate);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(updatedTask));
                    } catch (err) {
                        handleError(err, res);
                    }
                } catch (error) {
                    handleError(error, res);
                }
            });
        } else if (req.method === 'DELETE' && req.url.startsWith('/tasks/')) {
            const id = req.url.split('/')[2];
            try {
                await deleteTask(id);
                res.writeHead(204);
                res.end();
            } catch (err) {
                handleError(err, res);
            }
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not found' }));
        }
    } catch (error) {
        handleError(error, res);
    }
}

function handleError(error, res) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
}

module.exports = taskRoutes;
