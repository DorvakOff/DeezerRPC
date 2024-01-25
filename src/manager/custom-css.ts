import {BrowserWindow} from "electron";
import {setIntervalAsync} from "set-interval-async/dynamic";

const applyCustomCSS = (mainWindow: BrowserWindow) => {
    let selectors = [
        '.page-topbar',
        '.css-efpag6',
        '.tempo-topbar',
        '#dzr-app',
        '.mtZhp'
    ];

    let css = ''

    css += selectors.join(', ') + ' { margin-top: 30px !important; }';

    css += '[data-testid="chromecast_button"] { display: none !important; }';

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
}

export {applyCustomCSS}