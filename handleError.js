function handleError(error, res) {
    if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    } else {
        console.error('Headers already sent:', error);
    }
}

module.exports = handleError;
