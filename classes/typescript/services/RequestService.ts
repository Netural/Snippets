import { Promise } from 'es6-promise';
import { Service } from '../lib/Service';

/**
 * An options object containing any custom settings that you want to apply to the request.
 *
 * @interface IRequestOptions
 */
export interface IRequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS',
    headers?: any,
    body?: any,
    mode?: string, // not yet supported
    credentials?: {
        username: string;
        password?: string;
    },
    cache?: 'default' | 'no-store' | 'reload' | 'no-cache' | 'force-cache' | 'only-if-cached', // not yet supported
    redirect?: 'follow' | 'error' | 'manual', // not yet supported
    referrer?: string, // not yet supported
    integrity?: string // not yet supported
}

/**
 * Service for requesting/fetching data from an url
 *
 * @export
 * @class DataService
 * @extends {Service}
 */
export class RequestService extends Service {

    /**
     * Fetches a resource. Returns a Promise with a string as a result.
     * 
     * @param {string} url The url to fetch
     * @param {IRequestOptions} [options] Additional options for headers, credentials, ...
     * @returns {Promise<string>} Promise with resolved data or error
     */
    public fetch(url: string, options?: IRequestOptions): Promise<string> {
        return new Promise((resolve: (result: any) => void, reject: (reason: Error) => void) => {
            if (!options) {
                options = {};
            }

            let xhr = new XMLHttpRequest();
            let headers = options.headers;

            // Check if method is GET and body ias an object
            // If it is so, parse body object an append all properties as GET parameters to the url
            if (options.method === 'GET' && options.body) {
                if (typeof options.body === 'object') {
                    let separator = '';
                    let uri = '';
                    for (var key in options.body) {
                        if (options.body.hasOwnProperty(key)) {
                            uri += `${separator}${key}=${options.body[key]}`
                            separator = '&';
                        }
                    }

                    // append the parameters to the url
                    url = url + (url.indexOf('?') === - 1 ? '?' : '&')+ uri;    
                } else {
                    // Body is not an object => not allowed
                    reject(new TypeError('Non object like body not allowed for GET requests. The body has to be an object so the properties will be appended as a GET parameter to the url.'));
                    return;
                }
            } else if (typeof options.body !== 'string') {
                // if body is not a string, parse it to a json string
                options.body = JSON.stringify(options.body);
            } 
            
            // Body not allowed for HEAD requests
            if (options.method === 'HEAD' && options.body) {
                reject(new TypeError('Body not allowed for HEAD requests'));
                return;
            }

            // Add onload event listener            
            xhr.onload = (event: Event) => { 
                if (xhr.status >= 400 || xhr.status === 0) {
                    reject(new Error(xhr.responseText));
                } else {
                    resolve('response' in xhr ? xhr.response : xhr.responseText);
                }
            }

            // Add onerror event listener            
            xhr.onerror = (event: ErrorEvent) => {
                debugger;
                reject(event.error);
            }

            xhr.onabort = (event: ErrorEvent) => {
                reject(new TypeError('Network request aborted'));
            }

            // Add timeout event listener            
            xhr.ontimeout = (event: Event) => {
                reject(new TypeError('Network request timed out'));
            }

            if (options.credentials && options.credentials.username) {
                xhr.open(options.method ? options.method : 'GET', url, true, options.credentials.username, options.credentials.password);
            } else {
                xhr.open(options.method ? options.method : 'GET', url, true);
            }

            if (typeof headers === 'object') {
                for (var key in headers) {
                    if (headers.hasOwnProperty(key)) {
                        xhr.setRequestHeader(key, (<any>headers)[key]);
                    }
                }
            }

            xhr.send(typeof options.body === 'undefined' ? null : options.body);
        });
    }

    /**
     * Fetches a resource. Returns a Promise with a string as a result.
     * 
     * @param {string} url The url to fetch
     * @param {IRequestOptions} [options] Additional options for headers, credentials, ...
     * @returns {(Promise<Object | Array<any>>)} Promise with resolved data or error
     */
    public fetchJSON(url: string, options?: IRequestOptions): Promise<Object | Array<any>> {
        if (!options) {
            options = {};
        }
        if (!options.headers) {
            options.headers = {};
        }
        if (!options.headers['Content-Type']) {
            options.headers['Content-Type'] = 'application/json';
        }
        return this.fetch(url, options).then(result => {
            return JSON.parse(result);
        });
    }
}