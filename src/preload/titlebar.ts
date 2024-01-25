import { ipcRenderer } from 'electron';
import { Color, Titlebar } from 'custom-electron-titlebar';
import path from "path";

window.addEventListener('DOMContentLoaded', () => {
    createTitlebar();
});

const createTitlebar = () => {
    const titlebar = new Titlebar({
        backgroundColor: Color.fromHex("#23232d"),
        onMinimize: () => ipcRenderer.send('window-minimize'),
        onMaximize: () => ipcRenderer.send('window-maximize'),
        onClose: () => ipcRenderer.send('window-close'),
        isMaximized: () => ipcRenderer.sendSync('window-is-maximized'),
        icon: path.join(__dirname, '../assets/images/deezer.png'),
    });

    titlebar.updateTitle('Deezer');
    titlebar.updateIcon('../assets/images/deezer.png')
}
