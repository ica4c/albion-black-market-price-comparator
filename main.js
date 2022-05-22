const { app, BrowserWindow } = require("electron");
const path = require("path");
const url = require("url");
const http = require("http");
const { WebSocketServer, WebSocket } = require('ws');
const Sniffer = require('./sniffer');
const log = require('electron-log');

let browserWindow,
    server,
    execPath = path.dirname(app.getPath('exe'));

log.transports.file.resolvePath = (v) => path.join(execPath, 'main.log');

async function initSnifferService() {
    server = http.createServer();

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
        log.info('Client connected');
    });

    wsServer.on('error', (e) => {
        log.error(e.message);
        log.error(e.stack);
    });

    server.listen(
        14800,
        () => {
            const sniffer = new Sniffer();

            sniffer.on(
                'auction_update',
                offers => wsServer.clients
                    .forEach(ws => {
                        if(ws.readyState === WebSocket.OPEN) {
                            log.info('Auction update triggered');
                            ws.send(JSON.stringify({type: 'UPDATE_OFFERS', data: offers}));
                        }
                    })
            );

            log.info('Server is ready to accept connections');
        }
    );

    server.on('error', (e) => {
        log.error(e.message);
        log.error(e.stack);
    });
}

async function initApp() {
    browserWindow = new BrowserWindow({
        width: 1200,
        maxWidth: 1200,
        minWidth: 600,
        height: 800,
        minHeight: 400,
        maxHeight: 2400,
        resizable: true,
        maximizable: false,
        autoHideMenuBar: true
    });

    browserWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, '/frontend/dist/albion-bm-prices-overview/index.html'),
            protocol: "file:",
            slashes: true
        })
    );

    browserWindow.on('ready-to-show', () => {
        browserWindow.show();
    });

    browserWindow.on("closed", () => {
        browserWindow = null;
    });
}

app.on("ready", async () => {
    try {
        await initSnifferService();
        await initApp();
    } catch (e) {
        log.error(e.message);
        log.error(e.stack);
    }
});

app.on("activate", () => {
    if (browserWindow === null) {
        initApp();
    }
});

app.on("window-all-closed", () => {
    if(server) {
        server.close();
    }

    if (process.platform !== "darwin") {
        app.quit();
    }
});