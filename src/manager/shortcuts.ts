import {globalShortcut} from "electron";
import {nextSong, previousSong, reload, togglePause} from "./functions";

const shortcuts = [
    {
        key: 'MediaNextTrack',
        function: nextSong
    },
    {
        key: 'MediaPreviousTrack',
        function: previousSong
    },
    {
        key: 'MediaPlayPause',
        function: togglePause
    },
    {
        key: 'ctrl+r',
        function: reload
    }
]

export function registerShortcuts() {
    shortcuts.forEach(shortcut => {
        globalShortcut.register(shortcut.key, shortcut.function)
    })
}