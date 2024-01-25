import {getMainWindow, loadThumbnailButtons} from "../main";
import {isPlaying} from "../player/player";
import {APP} from "../app/app";
import {userAgent} from "../utils/http-utils";

const togglePause = () => {
    getMainWindow().webContents.executeJavaScript('dzPlayer.control.togglePause();').then(() => loadThumbnailButtons(!isPlaying()))
}

const nextSong = () => {
    getMainWindow().webContents.executeJavaScript('dzPlayer.control.nextSong();').then(() => loadThumbnailButtons(true))
}

const previousSong = () => {
    getMainWindow().webContents.executeJavaScript('dzPlayer.control.prevSong();').then(() => loadThumbnailButtons(true))
}

const reload = () => {
    if (getMainWindow().isFocused() && !getMainWindow().webContents.isLoading()) {
        if (isPlaying()) {
            togglePause()
            setTimeout(reload, 100)
        } else {
            getMainWindow().webContents.loadURL(APP.settings.deezerUrl, {userAgent: userAgent()})
        }
    }
}

export {
    togglePause, nextSong, previousSong, reload
}