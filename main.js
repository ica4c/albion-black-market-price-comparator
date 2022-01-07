const { app, BrowserWindow } = require("electron");
const path = require("path");
const url = require("url");
const cp = require('child_process');
const { dialog } = require('electron')

let browserWindow,
    backend;

function respawnBackendServer() {
    if(backend) {
        backend.kill();
    }

    backend = cp.spawn('node', [path.join(__dirname, '/backend/index.js')]);

    backend.stderr.on('data', (stream) => {
        const error = stream.toString();

        if(error.includes('(cannot open BPF device)')) {
            dialog.showErrorBox('Elevation required', 'Admin privileges required. Restart in sudo mode.');
            app.exit();
        } else {
            setTimeout(respawnBackendServer, 1500);
        }
    });

    backend.stdout.on('data', (stream) => {
        console.log(stream.toString());
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
        if(backend) {
            backend.kill();
        }

        browserWindow = null;
    });
}

app.on("ready", () => {
    respawnBackendServer();
    initApp();
});

app.on("activate", () => {
    if (browserWindow === null) {
        initApp();
    }
});

app.on("window-all-closed", () => {
    if(backend) {
        backend.kill();
    }

    if (process.platform !== "darwin") {
        app.quit();
    }
});