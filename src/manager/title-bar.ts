import * as path from 'path';
import {BrowserView, BrowserWindow, dialog, ipcMain} from 'electron';
import {getMainWindow} from "../main";

let titleBar: BrowserView | null = null;

export function register() {
    let mainWindow = getMainWindow()

    if (titleBar == null) {
        titleBar = new BrowserView({
            webPreferences: {
                preload: path.join(__dirname, '../preload/titleBar.js')
            }
        });

        titleBar.setAutoResize({
            width: true
        });

        titleBar.setBounds({
            x: 0,
            y: 0,
            width: mainWindow.getBounds().width,
            height: 30
        });

        titleBar.webContents.loadFile(path.join(__dirname, '../assets/titleBar.html')).catch((error) => {
            dialog.showErrorBox('Error', error.message);
        })

        mainWindow.setBrowserView(titleBar);
    }
}

export function unregister() {
    if (titleBar != null) {
        getMainWindow().removeBrowserView(titleBar);

        titleBar = null;
    }
}


// IPC
ipcMain.on('window-minimize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);

    window?.minimize();
});

ipcMain.on('window-maximize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);

    if (window) {
        window.isMaximized() ? window.unmaximize() : window.maximize();
    }
});

ipcMain.on('window-close', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);

    window?.close();
});

ipcMain.on('window-is-maximized', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);

    event.returnValue = window?.isMaximized();
});
