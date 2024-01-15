import {Client} from 'discord-rpc';
import ElectronStore from 'electron-store';
import {SetIntervalAsyncTimer} from "set-interval-async";
import {setIntervalAsync} from "set-interval-async/dynamic";
import {updateRPC} from "../player/player";

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
        closeToTray: 'closeToTray', checkUpdates: 'checkUpdates', startOnStartup: 'startOnStartup',
    },
};

export const APP_CONFIG = new ElectronStore({
    defaults: {
        closeToTray: true, checkUpdates: true, startOnStartup: true,
    }
});

let rpc: Client;

export function getRPC() {
    if (rpc == null) {
        resetRPC();
    }
    return rpc;
}

let connected = false;
let timer: SetIntervalAsyncTimer

export function isConnected() {
    return connected;
}

function resetRPC() {
    connected = false;
    newClient()
}

function newClient() {
    rpc = new Client({
        transport: 'ipc'
    });
}

export function handleRPCError(reason: any) {
    console.error('Failed to initialize RPC, retrying in 10 seconds... Reason: ' + reason.message);
    resetRPC()
    setTimeout(() => {
        console.log('Retrying RPC initialization...');
        initializeRPC();
    }, 10_000);
}

export function initializeRPC() {
    if (timer == null) {
        timer = setIntervalAsync(updateRPC, 1_000);
    }
    try {
        getRPC().login({clientId: APP.settings.discordClientID}).then(() => {
            if (connected) return;
            connected = true;
            console.log('RPC initialized successfully');
        }).catch(handleRPCError);
    } catch (e) {
        handleRPCError(e)
    }
}