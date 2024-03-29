import {APP, initializeRPC} from './app/app';
import * as Tray from './manager/tray';
import * as TitleBar from './manager/title-bar';
import * as Preferences from './utils/preferences';
import {getPreference} from './utils/preferences';
import {app, BrowserWindow, dialog, nativeImage} from 'electron';
import path from "path";
import windowStateKeeper from "electron-window-state";
import {registerShortcuts} from "./manager/shortcuts";
import {nextSong, previousSong, togglePause} from "./manager/functions";
import {applyCustomCSS} from "./manager/custom-css";
import {userAgent} from "./utils/http-utils";
import {autoUpdater, UpdateDownloadedEvent} from "electron-updater";

let mainWindow: BrowserWindow

// Create MainWindow
const createMainWindow = () => {
    let mainWindowStateKeeper = windowStateKeeper({
        defaultHeight: APP.settings.windowHeight, defaultWidth: APP.settings.windowWidth
    });
    mainWindow = new BrowserWindow({
        width: mainWindowStateKeeper.width,
        height: mainWindowStateKeeper.height,
        x: mainWindowStateKeeper.x,
        y: mainWindowStateKeeper.y,
        show: true,
        title: APP.name,
        titleBarStyle: 'hidden',
        icon: path.join(__dirname, 'assets/images/deezer.ico'),
    });
    // Save state
    mainWindowStateKeeper.manage(mainWindow);

    // Load URL
    mainWindow.loadURL(APP.settings.deezerUrl, {userAgent: userAgent()}).then(() => applyCustomCSS(mainWindow));

    // Events
    mainWindow.webContents.once('did-finish-load', handleLoadComplete);

    mainWindow.on('show', () => {
        mainWindow.setPosition(mainWindowStateKeeper.x, mainWindowStateKeeper.y)
        mainWindow.setSize(mainWindowStateKeeper.width, mainWindowStateKeeper.height)
        loadThumbnailButtons()
    });

    mainWindow.on('hide', () => {
        mainWindowStateKeeper.saveState(mainWindow);
    })

    mainWindow.on('minimize', () => {
        mainWindow.minimize();
    });

    mainWindow.on('close', () => {
        if (Preferences.getPreference<boolean>(APP.preferences.closeToTray)) {
            mainWindow.hide();
        } else {
            app.exit();
        }
        mainWindowStateKeeper.saveState(mainWindow);
    });
}

const handleLoadComplete = () => {
    Tray.register();
    registerShortcuts();
    TitleBar.register()

    if (Preferences.getPreference<boolean>(APP.preferences.checkUpdates)) {
        autoUpdater.checkForUpdates();
        setInterval(() => autoUpdater.checkForUpdates(), 1000 * 60, [autoUpdater]);
    }

    // Initialize RPC
    initializeRPC();
}

autoUpdater.on('update-downloaded', (event: UpdateDownloadedEvent) => {
    const dialogOpts = {
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: 'Application Update',
        message: `${APP.name} will be updated to version ${event.version} after restart.`,
        detail: 'A new version has been downloaded. Restart the application to apply the updates.'
    }

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0) {
            autoUpdater.quitAndInstall()
        }
    })
})

autoUpdater.on('error', error => {
    console.error('There was a problem updating the application')
    console.error(error)
    dialog.showErrorBox('Error: ', error == null ? "unknown" : (error.stack || error).toString())
})

const loadThumbnailButtons = (playing: boolean = false) => {
    if (!mainWindow.isVisible()) {
        return;
    }
    mainWindow.setThumbarButtons([{
        tooltip: 'Previous',
        icon: nativeImage.createFromPath(path.join(__dirname, 'assets/images/previous.png')),
        click: () => previousSong()
    }, {
        tooltip: 'Play/Pause',
        icon: nativeImage.createFromPath(path.join(__dirname, `assets/images/${playing ? 'pause' : 'play'}.png`)),
        click: () => togglePause()
    }, {
        tooltip: 'Next',
        icon: nativeImage.createFromPath(path.join(__dirname, 'assets/images/next.png')),
        click: () => nextSong()
    }])
}

const getMainWindow = () => {
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

    app.on('ready', createMainWindow);
}

export {
    getMainWindow, loadThumbnailButtons
}