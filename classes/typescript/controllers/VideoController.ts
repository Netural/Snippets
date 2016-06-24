import { Controller } from '../core/Controller';
import generate_video_player from '../templates/video';
import { YouTubeService } from '../services/YouTubeService';
import { firstParentByClass } from '../utils';

/**
 * Definition of a video source object
 * 
 * @interface IVideoSource
 */
export interface IVideoSource {
    src: string,
    type: string
}

/**
 * Represents the different states a player can have
 * 
 * @export
 * @enum {number}
 */
export enum PlayerState {
    ENDED,
    PLAYING,
    PAUSED,
    BUFFERING,
    CUED
}

/**
 * Contains all the logic for a video component.
 * Supports:
 * - Native video tag
 * - YouTube (needs YouTubeService)
 * 
 * @export
 * @class VideoController
 * @extends {Controller}
 */
export class VideoController extends Controller {

    private videoElement: HTMLVideoElement;
    private progressBarElement: HTMLElement;
    private progressBarContainer: HTMLElement;
    private currentTimeElement: HTMLElement;
    private lengthElement: HTMLElement;
    private bufferBarElement: HTMLElement;
    private youtubePlayer: any = null;
    private youTubeService = <YouTubeService>YouTubeService.inject();
    private youTubeTimer: number;

    private muted = false;

    constructor(element: HTMLElement) {
        super(element);
        this.initControls();
        let external = this.$().getAttribute('data-external');
        if (external) {
            if (external.match(/youtu/)) {
                // load youtube api first (async)
                // then build and setup the player
                this.youTubeService.loadAPI(() => {
                    this.initYouTubePlayer(external);
                });
            } else {
                throw new Error('Unsupportet third partie video');
            }
        } else {
            let srcElements = element.querySelectorAll('[data-src]');
            for (let i = 0, max = srcElements.length; i < max; i++) {
                let element = srcElements[i];
                element.setAttribute('src', element.getAttribute('data-src'));
                element.removeAttribute('data-src');
            }
            this.initVideoPlayer();
            this.videoElement.load();
        }
        if (firstParentByClass(this.$(), 'modal')) {
            this.play();
        }
    }

    /**
     * Initialize native video element
     */
    initVideoPlayer() {
        if (!(this.$('video').length)) {
            throw new Error('No video element found!');
        }

        let videoElement: HTMLVideoElement = this.videoElement = <HTMLVideoElement>this.$('video')[0];

        videoElement.addEventListener('progress', (event: Event) => {
            event.preventDefault();
            this.bufferUpdate();
        });

        videoElement.addEventListener('timeupdate', (event: Event) => {
            event.preventDefault();
            this.timeUpdate();
        });

        videoElement.addEventListener('loadedmetadata', () => {
            this.lengthElement.innerText = this.generateTimeIndicator(this.videoElement.duration);
        });
    }

    /**
     * Initialize Controls & Events
     */
    initControls() {
        this.progressBarContainer = <HTMLElement>this.$().querySelector('.video__progress');
        this.bufferBarElement = <HTMLElement>this.$().querySelector('.video__progress_buffer');
        this.progressBarElement = <HTMLElement>this.$('.video__progress_bar')[0];
        this.currentTimeElement = this.$('.video__progress_time')[0];
        this.lengthElement = this.$('.video__length')[0];

        // apply play/pause event to button
        const playPauseButton: HTMLButtonElement = <HTMLButtonElement>this.$('.video__play_pause')[0];
        playPauseButton.addEventListener('click', (event: Event) => {
            event.preventDefault();
            this.togglePlayPause();
        });

        // apply mute/volumeUp event to button
        const muteVolumeButton: HTMLButtonElement = <HTMLButtonElement>this.$('.video__volume')[0];
        muteVolumeButton.addEventListener('click', (event: Event) => {
            event.preventDefault();
            this.toggleVolume();
        });

        // apply fullscreen event to button
        const fullscreenButton: HTMLButtonElement = <HTMLButtonElement>this.$('.video__fullscreen')[0];
        if (window.parent === window) {
            fullscreenButton.addEventListener('click', (event: Event) => {
                event.preventDefault();
                this.fullscreen();
            });
        } else {
            fullscreenButton.disabled = true;
            fullscreenButton.title = 'Fullscreen mode is not allowed in an iframe!';
        }

        // apply event for clicking the progess bar        
        this.progressBarContainer.addEventListener('click', (event: MouseEvent) => {
            let percentage = event.layerX / this.progressBarContainer.clientWidth * 100;
            let time = Math.round(percentage * this.getDuration() / 100);
            if (this.videoElement) {
                this.videoElement.currentTime = time;
            }
            if (this.youtubePlayer) {
                this.youtubePlayer.seekTo(time);
            }
        });
    }

    /**
     * Builds and sets up the YouTube Player.
     * Need the YouTubeService and the loaded API
     * 
     * @param {string} youTubeURL The YouTube URL of the video
     */
    initYouTubePlayer(youTubeURL: string) {
        if (!this.youTubeService.API) {
            throw new Error('No YouTube API available');
        }
        let tmpElement = document.createElement('span');
        this.$('.video__wrapper')[0].appendChild(tmpElement);
        this.youtubePlayer = new this.youTubeService.API.Player(tmpElement, {
            videoId: this.youTubeService.parseYouTubeId(youTubeURL),
            playerVars: { 'autoplay': firstParentByClass(this.$(), 'modal') ? 1 : 0, 'controls': 0, 'showinfo': 0, 'modestbranding': 0, 'suggestedQuality': 'large' },
            events: {
                // 'onReady': onPlayerReady,
                'onStateChange': (event: { target: any; data: number; }) => {
                    switch (event.data) {
                        case PlayerState.ENDED:
                            this.$().classList.remove('video--is-playing');
                            clearInterval(this.youTubeTimer);
                            break;
                        case PlayerState.PLAYING:
                            this.$().classList.add('video--is-playing');
                            clearInterval(this.youTubeTimer);
                            this.youTubeTimer = setInterval(() => { this.timeUpdate(); }, 300);
                            break;
                        case PlayerState.BUFFERING:
                            this.timeUpdate();
                            break;
                        case PlayerState.PAUSED:
                            this.$().classList.remove('video--is-playing');
                            clearInterval(this.youTubeTimer);
                            break;
                        case PlayerState.CUED:
                            this.timeUpdate();
                            break;
                    }
                    this.timeUpdate();
                }
            }
        })
    }

    /**
     * Toggle the play or pause
     */
    togglePlayPause(): void {
        if (this.isPlaying()) {
            this.pause();
        } else {
            this.play();
        }
    }

    /**
     * Play the video
     */
    play(): void {
        if (this.videoElement) {
            this.videoElement.play();
        }
        if (this.youtubePlayer) {
            this.youtubePlayer.playVideo();
        }
        this.$().classList.add('video--is-playing');
    }

    /**
     * Pause the running video
     */
    pause(): void {
        if (this.videoElement) {
            this.videoElement.pause();
        }
        if (this.youtubePlayer) {
            this.youtubePlayer.pauseVideo();
        }
        this.$().classList.remove('video--is-playing');
    }

    /**
     * Toggle the Volume (unmute or mute)
     */
    toggleVolume(): void {
        if (this.muted) {
            this.volumeOn();
        } else {
            this.mute();
        }
    }

    /**
     * Mute the video
     */
    mute(): void {
        this.muted = true;
        if (this.videoElement) {
            this.videoElement.muted = true;
        }
        if (this.youtubePlayer) {
            console.log('mute');
            this.youtubePlayer.mute();
        }
        this.$().classList.add('video--is-muted');
    }

    /**
     * Unmute the video
     */
    volumeOn(): void {
        this.muted = false;
        if (this.videoElement) {
            this.videoElement.muted = false;
        }
        if (this.youtubePlayer) {
            console.log('unmute');
            this.youtubePlayer.unMute();
        }
        this.$().classList.remove('video--is-muted');
    }

    /**
     * Opens the video in fullscreen.
     * Only works if the site does not run in an iframe
     */
    fullscreen(): void {
        let videoElement: any = this.videoElement;
        if (videoElement) {
            if (videoElement.requestFullscreen) {
                videoElement.requestFullscreen();
            } else if (videoElement['msRequestFullscreen']) {
                videoElement['msRequestFullscreen']();
            } else if (videoElement['mozRequestFullScreen']) {
                videoElement['mozRequestFullScreen']();
            } else if (videoElement.webkitRequestFullscreen) {
                videoElement.webkitRequestFullscreen();
            }
        }

        if (this.youtubePlayer) {
            let iframe: any = this.$('iframe')[0];
            let requestFullScreen = iframe.requestFullScreen || iframe.mozRequestFullScreen || iframe.webkitRequestFullScreen || iframe.msRequestFullscreen;
            if (requestFullScreen) {
                requestFullScreen.bind(iframe)();
            }
        }
    }

    /**
     * This method will get called every time the buffered fraction changes.
     * Only works with native video element, not youtube
     */
    bufferUpdate(): void {
        try {
            var buffer = this.videoElement.buffered;
            var range = 0;
            var time = this.videoElement.currentTime;

            while (!(buffer.start(range) <= time && time <= buffer.end(range))) {
                range += 1;
            }
            var loadStartPercentage = buffer.start(range) / this.videoElement.duration * 100;
            var loadEndPercentage = buffer.end(range) / this.videoElement.duration * 100;
            var loadPercentage = loadEndPercentage - loadStartPercentage;
            this.bufferBarElement.style.width = Math.round(loadPercentage) + '%';
            this.bufferBarElement.style.left = Math.round(loadStartPercentage) + '%';
        } catch (ex) {
            //nothing
        }
    }

    /**
     * This method will get called every time
     * the state of the player changes or the time updates
     */
    timeUpdate(): void {
        let currentTime = this.getCurrentTime();
        let currentPos = currentTime; //Get currenttime
        let maxduration = this.getDuration();
        let percentage = 100 * currentPos / maxduration; //in %

        if (percentage < 99.99) {
            this.currentTimeElement.classList.remove('is-hidden');
        } else {
            this.currentTimeElement.classList.add('is-hidden');
            this.$().classList.remove('video--is-playing');
        }
        //this.progressBarElement.style.transform = `translate3d(${(100 - percentage) * -1}%, 0, 0)`;
        this.progressBarElement.style.width = percentage + '%';
        this.currentTimeElement.innerText = this.generateTimeIndicator(currentTime);
        this.lengthElement.innerText = this.generateTimeIndicator(this.getDuration());
    }

    /**
     * Generates a time indicator from seconds to 00:00
     * 
     * @private
     * @param {number} seconds Time in seconds
     * @returns {string} The generated indicator
     */
    private generateTimeIndicator(seconds: number): string {
        let minutes = Math.floor(seconds / 60);
        seconds = Math.round(seconds - minutes * 60);
        return (minutes < 10 ? '0' + minutes : minutes + '') + ':' + (seconds < 10 ? '0' + seconds : seconds + '');
    }

    willDestroy() {
        this.pause();
    }

    /**
     * Returns the duration of the loaded video
     * 
     * @private
     * @returns {number} Duration
     */
    private getDuration(): number {
        if (this.videoElement) {
            return this.videoElement.duration; //Get video duration
        }
        if (this.youtubePlayer) {
            return this.youtubePlayer.getDuration();
        }
    }

    /**
     * Returns the current time played
     * 
     * @private
     * @returns {number} Current time
     */
    private getCurrentTime(): number {
        if (this.videoElement) {
            return this.videoElement.currentTime;
        }
        if (this.youtubePlayer) {
            return this.youtubePlayer.getCurrentTime();
        }
    }

    /**
     * Return if the player is playing right now
     * 
     * @private
     * @returns {boolean} (description)
     */
    private isPlaying(): boolean {
        if (this.videoElement) {
            return !this.videoElement.paused;
        }
        if (this.youtubePlayer) {
            return this.youtubePlayer.getPlayerState() === PlayerState.PLAYING;
        }
    }

    static render(options: string): DocumentFragment {
        options = options.split('\'').join('"');
        let params: any = JSON.parse(options);
        let args: Array<IVideoSource> = [];
        let poster: string = params.poster;
        let external: string = params.external;
        let fragment: DocumentFragment;

        if (!external) {
            for (let i = 0, max = params.sources.length; i < max; i++) {
                let source: IVideoSource = params.sources[i];
                args.push({
                    src: source.src,
                    type: source.type
                })
            }
            fragment = generate_video_player(args, poster);
        } else {
            fragment = generate_video_player(external, poster);
        }


        return fragment;
    }
}