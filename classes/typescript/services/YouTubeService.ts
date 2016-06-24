import { Service } from '../core/Service';

/**
 * Service for wrapping and loading the youtube api
 *
 * @export
 * @class YouTubeService
 * @extends {Service}
 */
export class YouTubeService extends Service {

    private _isLoadingAPI = false;
    private _API: any;
    private _callbacks: Array<Function> = [];

    /**
     * Gets you the youtube api instance or null
     * 
     * @type {*}
     */
    get API(): any {
        if (!this._API) {
            this._loadAPI();
            return null;
        }
        return this._API;
    }
    set API(value: any) {
        throw new Error('Setting the API is not allowed');
    }

    /**
     * Takes a youtube url and parses the id 
     * 
     * @param {string} youtubeURL The youtube video url
     * @returns {string} Parse id or null
     */
    parseYouTubeId(youtubeURL: string): string {
        let regex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        let match = youtubeURL.match(regex);

        if (match && match[2].length === 11) {
            return match[2];
        }
        return null;
    }

    /**
     * Triggers the loading of the youtube iframe api.
     * Optional: registers a callback which will be called once the api is loaded
     * 
     * @param {Function} [callback] Callback which will be called once the api is loaded
     */
    loadAPI(callback?: Function) {
        if (typeof callback === 'function') {
            this._callbacks.push(callback);
        }
        if (this._API) {
            this._resolveCallbacks();
        } else {
            this._loadAPI();
        }
    }

    /**
     * Loads the youtube iframe api async
     * Calls all the callbacks when api is loaded
     * 
     * @private
     */
    private _loadAPI(): void {
        if (this._isLoadingAPI) {
            return;
        }

        this._isLoadingAPI = true;
        (<any>window).onYouTubeIframeAPIReady = () => {
            this._isLoadingAPI = false;
            this._API = (<any>window).YT;
            this._resolveCallbacks();
        }
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
    }

    /**
     * Calls all the registered callback and clears them after that.
     * 
     * @private
     */
    private _resolveCallbacks(): void {
        for (let i = 0, max = this._callbacks.length; i < max; i++) {
            this._callbacks[i]();
        }
        this._callbacks = [];
    }
}