import {getMainWindow, loadThumbnailButtons} from "../main";
import {isPlaying} from "../player/player";

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
    getMainWindow().webContents.reload();
}

export {
    togglePause,
    nextSong,
    previousSong,
    reload
}