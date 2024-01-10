import path from 'path';
import { APP } from '../app/app';
import * as Update from '../utils/update';
import { app, Menu, shell, Tray } from 'electron';
import * as Preferences from '../utils/preferences';
import {getMainWindow} from "../main";

let tray: Tray;

export function register() {
    let mainWindow = getMainWindow();

    tray = new Tray(path.join(
        __dirname,
        process.platform == 'win32' ? '../assets/images/deezer.ico' : '../assets/images/deezer.png'
    ));

    tray.setContextMenu(
        Menu.buildFromTemplate([
            {
                type: 'normal',
                label: 'Toggle',
                click: () => mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
            },
            { type: 'separator' },
            {
                type: 'submenu',
                label: 'Settings',
                submenu: [
                    {
                        type: 'checkbox',
                        label: 'Close to tray',
                        checked: Preferences.getPreference<boolean>(APP.preferences.closeToTray),
                        click: (item) => Preferences.setPreference(APP.preferences.closeToTray, item.checked)
                    },
                    {
                        type: 'checkbox',
                        label: 'Check for updates on startup',
                        checked: Preferences.getPreference<boolean>(APP.preferences.checkUpdates),
                        click: (item) => Preferences.setPreference(APP.preferences.checkUpdates, item.checked)
                    },
                    {
                        type: 'checkbox',
                        label: 'Start on system startup',
                        checked: Preferences.getPreference<boolean>(APP.preferences.startOnStartup),
                        click: (item) => {
                            Preferences.setPreference(APP.preferences.startOnStartup, item.checked)
                            app.setLoginItemSettings({
                                openAtLogin: item.checked
                            })
                        }
                    }
                ]
            },
            {
                type: 'normal',
                label: 'Check for updates',
                click: () => Update.checkVersion(true)
            },
            { type: 'separator' },
            {
                type: 'normal',
                label: `${APP.name} ${APP.version}`,
                click: () => shell.openExternal(APP.homepage)
            },
            { type: 'separator' },
            {
                type: 'normal',
                label: 'Exit',
                click: () => app.exit()
            }
        ])
    );

    // Initial Message
    setMessage(APP.name);

    // Events
    tray.on('double-click', () => mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show());
}

export function setMessage(message: string) {
    tray.setToolTip(message);
}
