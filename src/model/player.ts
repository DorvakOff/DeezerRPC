export default abstract class PlayerModel {
    id: number;
    title: string;
    listening: boolean;
    image: string | undefined;
    time: number | undefined;
    statusKey: string | undefined;
    statusText: string | undefined;

    trayMessage: string = '';
    notification: string = '';

    protected constructor(
        id: number,
        title: string,
        listening: boolean,
        image: string | undefined,
        time: number | undefined
    ) {
        this.id = id;
        this.title = !title ? 'Unknown Title' : title;
        this.listening = listening;
        this.image = image;
        this.time = time;
        this.statusKey = this.listening ? 'listening' : 'paused';
        this.statusText = this.listening ? 'Listening' : 'Paused';
    }

    abstract getId(): string
    abstract getState(): string;
    abstract getStartTimestamp(): number | undefined;
    abstract getEndTimestamp(): number | undefined;
    abstract getImageText(): string;
    abstract getButtons(): any[] | undefined;

    getImageKey(): string {
        return `https://e-cdns-images.dzcdn.net/images/cover/${this.image}/256x256.png`
    }
}
