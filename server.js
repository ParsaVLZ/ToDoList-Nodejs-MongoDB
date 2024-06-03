const http = require('http');
const { connectToMongoDB } = require('./db/mongo-connection');
const taskRoutes = require('./routes/task.routes');

const server = http.createServer((req, res) => {
    taskRoutes(req, res, (error) => {
        if (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    });
});

const runServer = async () => {
    try {
        await connectToMongoDB();
        console.log('Connected to MongoDB successfully...');
        const PORT = 3000;
        server.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to MongoDB or start server:', error);
    }
};

runServer();