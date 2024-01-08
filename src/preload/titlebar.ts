import { ipcRenderer } from 'electron';
import { Color, Titlebar } from 'custom-electron-titlebar';

window.addEventListener('DOMContentLoaded', () => {
    createTitlebar();
});

function createTitlebar() {
    const titlebar = new Titlebar({
        backgroundColor: Color.fromHex("#23232d"),
        onMinimize: () => ipcRenderer.send('window-minimize'),
        onMaximize: () => ipcRenderer.send('window-maximize'),
        onClose: () => ipcRenderer.send('window-close'),
        isMaximized: () => ipcRenderer.sendSync('window-is-maximized')
    });

    titlebar.updateTitle('Deezer');
}
