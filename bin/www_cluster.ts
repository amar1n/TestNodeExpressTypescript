/**
 * Created by skurt on 4/2/17.
 */
'use strict';

/**
 * Module dependencies.
 */

// our modules can use import
import * as app from '../app';

// node_modules must use require
let debug = require('debug')('efimerum:server');

// core modules can use import
import * as http from 'http';
import * as cluster from 'cluster';
const numCPUs = require('os').cpus().length;
let server;

/**
 * Get port from environment and store in Express.
 */

let port = normalizePort(process.env['PORT'] || '3000');
app.set('port', port);


/**
 * Create HTTP server with Cluster.
 */
if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
} else {
    /**
     * Create HTTP server.
     */

    server = http.createServer(app);

    /**
     * Listen on provided port, on all network interfaces.
     */

    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);
    console.log(`Worker ${process.pid} started`);
}

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    let port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    let bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    let address = server.address();
    let bind = typeof address === 'string'
        ? 'pipe ' + address
        : 'port ' + address.port;
    debug('Listening on ' + bind);
}
