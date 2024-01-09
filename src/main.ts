import {APP, RPC} from './app/app';
import * as Tray from './manager/tray';
import * as Update from './utils/update';
import * as Player from './player/player';
import * as Window from './utils/http-utils';
import * as TitleBar from './manager/title-bar';
import * as Preferences from './utils/preferences';
import {app, BrowserWindow, dialog} from 'electron';
import path from "path";
import {nativeImage} from "electron";

// Entry
function main() {
    createMainWindow();
}

function createMainWindow() {
    // Create MainWindow
    global.__mainWindow = new BrowserWindow({
        width: APP.settings.windowWidth,
        height: APP.settings.windowHeight,
        show: false,
        title: APP.name,
        titleBarStyle: 'hidden',
        icon: path.join(__dirname, 'assets/images/deezer.ico'),
    });

    // Load URL
    __mainWindow.loadURL(APP.settings.deezerUrl, {userAgent: Window.userAgent()});

    // Events
    __mainWindow.webContents.once('did-finish-load', () => handleLoadComplete());
    __mainWindow.on('show', () => TitleBar.register());
    __mainWindow.on('hide', () => TitleBar.unregister())

    __mainWindow.on('minimize', () => {
        if (Preferences.getPreference<boolean>(APP.preferences.minimizeToTray)) {
            __mainWindow.hide();
        }
    });
    __mainWindow.on('close', (event) => {
        event.preventDefault();
        if (Preferences.getPreference<boolean>(APP.preferences.closeToTray)) {
            __mainWindow.hide();
        } else {
            app.exit();
        }
    });
}

function handleLoadComplete() {
    __mainWindow.show();

    let css = `
            .page-topbar, .css-efpag6, .tempo-topbar, #dzr-app {
                margin-top: 30px !important;
            }
        `;

    __mainWindow.webContents.insertCSS(css);

    setInterval(() => {
        __mainWindow.webContents.insertCSS(css);
    }, 1000);

    Tray.register();
    Player.registerShortcuts();
    loadThumbnailButtons()

    if (Preferences.getPreference<boolean>(APP.preferences.checkUpdates)) Update.checkVersion(false);

    // Initialize RPC
    initializeRPC();
}

export function loadThumbnailButtons(playing: boolean = false) {
    __mainWindow.setThumbarButtons([
        {
            tooltip: 'Previous',
            icon: nativeImage.createFromPath(path.join(__dirname, 'assets/images/previous.png')),
            click: () => Player.previousSong()
        },
        {
            tooltip: 'Play/Pause',
            icon: nativeImage.createFromPath(path.join(__dirname, `assets/images/${playing ? 'pause' : 'play'}.png`)),
            click: () => Player.togglePause()
        },
        {
            tooltip: 'Next',
            icon: nativeImage.createFromPath(path.join(__dirname, 'assets/images/next.png')),
            click: () => Player.nextSong()
        }
    ])
}

function initializeRPC() {
    RPC.login({clientId: APP.settings.discordClientID}).then(() => {
        setTimeout(Player.registerRPC, 3000);
    }).catch(() => {
        dialog.showErrorBox("Rich Presence Login Failed", "Please, verify if your discord app is opened/working and relaunch this application.");
    });
}

// App
app.on('ready', main);
