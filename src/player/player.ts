import {APP, getRPC, handleRPCError, isConnected} from '../app/app';
import Song from '../model/song';
import Radio from '../model/radio';
import Unknown from '../model/unknown';
import Episode from '../model/episode';
import * as Tray from '../manager/tray';
import PlayerModel from '../model/player';
import {getMainWindow, loadThumbnailButtons} from "../main";
import {DeezerData} from "../model/deezer-data";

let last = '';
let song: PlayerModel;
let radio_timestamp: number;
let playing = false;

const isPlaying = (): boolean => {
    return playing;
}

const updateRPC = async () => {
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

                // Set os specific media controls (play/pause, next, previous, current song, icon)

            }
        }
    } catch (e) {
        handleRPCError(e)
    }
}

const getSong = (current: DeezerData, listening: boolean, remaining: number): PlayerModel => {
    if (!current) {
        return new Unknown(0, 'Unknown Title', false, undefined, undefined);
    }

    let type = current.LIVE_ID ? 'radio' : current.EPISODE_ID ? 'episode' : current.SNG_ID ? 'song' : 'unknown';

    switch (type) {
        case 'radio':
            return getRadio(current, listening);
        case 'episode':
            return getEpisode(current, listening, remaining);
        case 'song':
            return getSongModel(current, listening, remaining);
        default:
            return new Unknown(0, 'Unknown Title', false, undefined, undefined);
    }
}

const getRadio = (data: DeezerData, listening: boolean): Radio => {
    if (`RADIO_${data.LIVE_ID}` != last) {
        radio_timestamp = Math.floor(Date.now() / 1000);
    }

    return new Radio(data.LIVE_ID!, data.LIVESTREAM_TITLE, listening, data.LIVESTREAM_IMAGE_MD5, radio_timestamp);
}

const getEpisode = (data: DeezerData, listening: boolean, remaining: number): Episode => {
    return new Episode(data.EPISODE_ID!, data.EPISODE_TITLE, listening, data.SHOW_ART_MD5, timestamp(listening, remaining), data.SHOW_NAME, data.EPISODE_DESCRIPTION);
}

const getSongModel = (data: DeezerData, listening: boolean, remaining: number): Song => {
    let names = data.ARTISTS.map((o: any) => o.ART_NAME).join(", ") || data.ART_NAME;

    if (names.length > 128) {
        names = data.ART_NAME;
    }

    return new Song(data.SNG_ID!, data.SNG_TITLE, listening, data.ALB_PICTURE, timestamp(listening, remaining), data.ALB_TITLE, names);
}

const timestamp = (listening: boolean, remaining: number): number | undefined => {
    if (listening) {
        return Date.now() + (remaining * 1000);
    }

    return undefined;
}

export {updateRPC, isPlaying};