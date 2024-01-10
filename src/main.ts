import {APP, initializeRPC} from './app/app';
import * as Tray from './manager/tray';
import * as Update from './utils/update';
import * as Player from './player/player';
import * as Window from './utils/http-utils';
import * as TitleBar from './manager/title-bar';
import * as Preferences from './utils/preferences';
import {app, BrowserWindow, nativeImage} from 'electron';
import path from "path";
import windowStateKeeper from "electron-window-state";
import {setIntervalAsync} from "set-interval-async/dynamic";
import {getPreference} from "./utils/preferences";

// Entry
function main() {
    createMainWindow();
}

let mainWindow: BrowserWindow

// Create MainWindow
function createMainWindow() {
    let mainWindowStateKeeper = windowStateKeeper({
        defaultHeight: APP.settings.windowHeight, defaultWidth: APP.settings.windowWidth
    });
    mainWindow = new BrowserWindow({
        width: mainWindowStateKeeper.width,
        height: mainWindowStateKeeper.height,
        x: mainWindowStateKeeper.x,
        y: mainWindowStateKeeper.y,
        show: false,
        title: APP.name,
        titleBarStyle: 'hidden',
        icon: path.join(__dirname, 'assets/images/deezer.ico'),
    });
    // Save state
    mainWindowStateKeeper.manage(mainWindow);

    // Load URL
    mainWindow.loadURL(APP.settings.deezerUrl, {userAgent: Window.userAgent()}).then(() => {
        let css = `
            .page-topbar, .css-efpag6, .tempo-topbar, #dzr-app {
                margin-top: 30px !important;
            }
        `;

        let javascript = `
            if (document.head.querySelector('#deezer-rpc-css') == null) {
                let css = document.createElement('style');
                css.type = 'text/css';
                css.innerHTML = \`${css}\`;
                css.id = 'deezer-rpc-css';
                document.head.appendChild(css);
            }
        `

        setIntervalAsync(async () => {
            try {
                if (mainWindow.isVisible()) {
                    await mainWindow.webContents.executeJavaScript(javascript);
                }
            } catch (e: any) {
                console.error(e);
            }
        }, 1000);
    });

    // Events
    mainWindow.webContents.once('did-finish-load', () => handleLoadComplete());
    mainWindow.on('show', () => {
        mainWindow.setPosition(mainWindowStateKeeper.x, mainWindowStateKeeper.y)
        mainWindow.setSize(mainWindowStateKeeper.width, mainWindowStateKeeper.height)
        TitleBar.register()
    });
    mainWindow.on('hide', () => {
        mainWindowStateKeeper.saveState(mainWindow);
        TitleBar.unregister()
    })

    mainWindow.on('minimize', () => {
        mainWindow.hide();
    });

    mainWindow.on('close', (event) => {
        event.preventDefault();
        if (Preferences.getPreference<boolean>(APP.preferences.closeToTray)) {
            mainWindow.hide();
        } else {
            app.exit();
        }
        mainWindowStateKeeper.saveState(mainWindow);
    });
}

function handleLoadComplete() {
    mainWindow.show();

    Tray.register();
    Player.registerShortcuts();
    loadThumbnailButtons()

    if (Preferences.getPreference<boolean>(APP.preferences.checkUpdates)) Update.checkVersion(false);

    // Initialize RPC
    initializeRPC();
}

export function loadThumbnailButtons(playing: boolean = false) {
    mainWindow.setThumbarButtons([{
        tooltip: 'Previous',
        icon: nativeImage.createFromPath(path.join(__dirname, 'assets/images/previous.png')),
        click: () => Player.previousSong()
    }, {
        tooltip: 'Play/Pause',
        icon: nativeImage.createFromPath(path.join(__dirname, `assets/images/${playing ? 'pause' : 'play'}.png`)),
        click: () => Player.togglePause()
    }, {
        tooltip: 'Next',
        icon: nativeImage.createFromPath(path.join(__dirname, 'assets/images/next.png')),
        click: () => Player.nextSong()
    }])
}

export function getMainWindow() {
    return mainWindow;
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
    app.quit()
} else {
    app.setLoginItemSettings({
        openAtLogin: getPreference<boolean>(APP.preferences.startOnStartup),
    })

    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.show();
            mainWindow.focus();
        }
    })

    app.on('ready', main);
}