import { Client } from 'discord-rpc';
import { BrowserWindow } from 'electron';
import ElectronStore from 'electron-store';

const PACKAGE = require('../../package.json');

// App
export const APP = {
    name: 'DeezerRPC',
    version: PACKAGE.version,
    homepage: PACKAGE.homepage,
    packageUrl: 'https://raw.githubusercontent.com/DorvakOff/DeezerRPC/master/package.json',
    appId: 'com.dorvak.deezerrpc',
    settings: {
        windowWidth: 1280,
        windowHeight: 720,
        deezerUrl: 'https://www.deezer.com/login',
        discordClientID: '1193973433986449458'
    },
    preferences: {
        closeToTray: 'closeToTray',
        checkUpdates: 'checkUpdates',
        startOnStartup: 'startOnStartup',
    },
};

export const APP_CONFIG = new ElectronStore({
    defaults: {
        closeToTray: true,
        checkUpdates: true,
        startOnStartup: true,
    }
});

// RPC
export let RPC = new Client({
    transport: 'ipc'
});

let firstTime = true;

export function resetRPC() {
    let newClient = new Client({
        transport: 'ipc'
    });

    if (firstTime) {
        firstTime = false;
        RPC = newClient;
        return;
    }

    RPC.destroy().then(() => {
        RPC = newClient;
    }).catch(() => {
        RPC = newClient;
    })
}
