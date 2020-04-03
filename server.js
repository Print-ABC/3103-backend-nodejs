const http = require('http');
const app = require('./app');
const config = require('./config/config');

const port = process.env.PORT || parseInt(config.port);

const server = http.createServer(app);

server.listen(port);
