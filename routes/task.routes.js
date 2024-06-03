const { insertTask, updateTask, deleteTask, findTasks } = require('../models/task.model');

const VALID_STATUSES = ["in-progress", "canceled", "done"];

function taskRoutes(req, res, next) {
    try {
        if (req.method === 'GET' && req.url === '/tasks') {
            findTasks().then(tasks => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(tasks));
            }).catch(next);
        } else if (req.method === 'POST' && req.url === '/tasks') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
                try {
                    const task = JSON.parse(body);
                    if (!VALID_STATUSES.includes(task.status)) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Invalid status value' }));
                        return;
                    }
                    insertTask(task).then(newTask => {
                        res.writeHead(201, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(newTask.ops[0]));
                    }).catch(next);
                } catch (error) {
                    next(error);
                }
            });
        } else if (req.method === 'PUT' && req.url.startsWith('/tasks/')) {
            const id = req.url.split('/')[2];
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
                try {
                    const taskUpdate = JSON.parse(body);
                    if (taskUpdate.status && !VALID_STATUSES.includes(taskUpdate.status)) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Invalid status value' }));
                        return;
                    }
                    updateTask(id, taskUpdate).then(updatedTask => {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(updatedTask));
                    }).catch(next);
                } catch (error) {
                    next(error);
                }
            });
        } else if (req.method === 'DELETE' && req.url.startsWith('/tasks/')) {
            const id = req.url.split('/')[2];
            deleteTask(id).then(() => {
                res.writeHead(204);
                res.end();
            }).catch(next);
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not found' }));
        }
    } catch (error) {
        next(error);
    }
}

module.exports = taskRoutes;
