import {APP, getRPC, handleRPCError, isConnected} from '../app/app';
import Song from '../model/song';
import Radio from '../model/radio';
import Unknown from '../model/unknown';
import Episode from '../model/episode';
import * as Tray from '../manager/tray';
import PlayerModel from '../model/player';
import {getMainWindow, loadThumbnailButtons} from "../main";

let last = '';
let song: PlayerModel;
let radio_timestamp: number;
let playing = false;

export function isPlaying(): boolean {
    return playing;
}

export async function updateRPC() {
    let [current, listening, remaining] = await getMainWindow().webContents.executeJavaScript(`[ dzPlayer.getCurrentSong(),dzPlayer.isPlaying(), dzPlayer.getRemainingTime() ]`);

    playing = listening;

    song = getSong(current, listening, remaining);

    loadThumbnailButtons(listening);

    if (!isConnected()) {
        return;
    }

    try {
        if (!song.listening) {
            getRPC().clearActivity().catch(handleRPCError)
        } else {
            getRPC().setActivity({
                details: song.title,
                state: song.getState(),
                startTimestamp: song.getStartTimestamp(),
                endTimestamp: song.getEndTimestamp(),
                largeImageKey: song.getImageKey(),
                largeImageText: song.getImageText(),
                smallImageKey: 'logo',
                smallImageText: 'DeezerRPC v' + APP.version,
                buttons: song.getButtons(),
                instance: false
            }).catch(handleRPCError);

            if (last !== song.getId()) {
                Tray.setMessage(song.trayMessage);
                last = song.getId();
            }
        }
    } catch (e) {
        handleRPCError(e)
    }
}

function getSong(current: any, listening: boolean, remaining: number): PlayerModel {
    if (current?.LIVE_ID) {
        if (`RADIO_${current.LIVE_ID}` != last) {
            radio_timestamp = Math.floor(Date.now() / 1000);
        }

        return new Radio(current.LIVE_ID, current.LIVESTREAM_TITLE, listening, current.LIVESTREAM_IMAGE_MD5, radio_timestamp);
    }

    if (current?.EPISODE_ID) {
        return new Episode(current.EPISODE_ID, current.EPISODE_TITLE, listening, current.SHOW_ART_MD5, timestamp(listening, remaining), current.SHOW_NAME, current.EPISODE_DESCRIPTION);
    }

    if (current?.SNG_ID) {
        return new Song(current.SNG_ID, current.SNG_TITLE, listening, current.ALB_PICTURE, timestamp(listening, remaining), current.ALB_TITLE, artists(current.ART_NAME, current.ARTISTS));
    }

    return new Unknown(0, 'Unknown Title', false, undefined, undefined);
}

function timestamp(listening: boolean, remaining: number): number | undefined {
    if (listening) {
        return Date.now() + (remaining * 1000);
    }

    return undefined;
}

function artists(artist: string, list: any[]): string {
    let names = list?.map(o => o.ART_NAME).join(", ") || artist;

    return names.length <= 128 ? names : artist;
}
