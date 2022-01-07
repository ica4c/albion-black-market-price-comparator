const http = require("http");
const { WebSocketServer, WebSocket } = require('ws');
const winston = require('winston');
const Sniffer = require('./sniffer');

const server = http.createServer();
const logger = winston.createLogger({
    level: 'info',
    defaultMeta: {
        service: 'albion-bm-price-backend'
    },
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: 'trace.log',
            level: 'error',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.prettyPrint()
            )
        }),
    ],
});

const wsServer = new WebSocketServer({
    server,
    perMessageDeflate: {
        zlibDeflateOptions: {
            chunkSize: 1024,
            memLevel: 7,
            level: 3
        },
        zlibInflateOptions: {
            chunkSize: 10 * 1024
        },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
        threshold: 1024
    }
});

wsServer.on('connection', () => {
    logger.log('info', 'Client connected');
});

server.listen(
    4444,
    '0.0.0.0',
    () => {
        const sniffer = new Sniffer(logger);

        sniffer.on(
            'auction_update',
            offers => wsServer.clients
                .forEach(ws => {
                    if(ws.readyState === WebSocket.OPEN) {
                        logger.log('info', 'Auction update triggered');
                        ws.send(JSON.stringify({type: 'UPDATE_OFFERS', data: offers}));
                    }
                })
        );

        logger.log('info', 'Server is ready to accept connections');
    }
)