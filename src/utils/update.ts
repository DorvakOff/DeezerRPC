import {autoUpdater} from "electron-updater";
import {APP} from "../app/app";
import {getMainWindow} from "../main";
import * as electron from "electron";
import {dialog} from "electron";

export function checkVersion(isManual: boolean = false) {
    autoUpdater.autoDownload = true;
    autoUpdater.checkForUpdatesAndNotify({
        title: 'Deezer',
        body: 'Checking for updates...'
    }).then((result) => handleUpdateResult(result, isManual)).catch(handleUpdateError);
}

function handleUpdateResult(result: any, isManual: boolean) {
    if (result.updateInfo.version > APP.version) {
        autoUpdater.downloadUpdate().then(() => {
            dialog.showMessageBox(getMainWindow(), {
                type: 'info',
                title: 'Deezer',
                message: 'Update downloaded. Restart the app to install the update.'
            }).then(() => {
                try {
                    autoUpdater.quitAndInstall();
                    setTimeout(() => {
                        electron.app.relaunch();
                        electron.app.exit(0);
                    }, 6000)
                } catch (e) {
                    dialog.showMessageBox(getMainWindow(), {
                        type: 'error',
                        title: 'Deezer',
                        message: 'Error while installing update.'
                    })
                }
            })
        })
    } else {
        if (isManual) {
            dialog.showMessageBox(getMainWindow(), {
                type: 'info',
                title: 'Deezer',
                message: 'You are up to date.'
            })
        }
    }
}

function handleUpdateError(error: any) {
    console.error(error);
}