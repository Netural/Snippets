/**
 * Returns you the current Viewport Position
 * 
 * @export
 * @returns {number} current viewport position
 */
export function getViewportPosition():number {
    return window.pageYOffset !== undefined ? window.pageYOffset : document.body.scrollTop;
}

/**
 * This appends an Parameter to an URL string or updates them.
 * 
 * @param {string} url URL string you want to modify
 * @param {string} param QueryParam Name
 * @param {string} value QueryParam Value
 * @returns {string} modified URL
 */
export function addQueryParameterToUrlString(url: string, param: string, value: string): string {
    let link: HTMLAnchorElement = document.createElement('a')
    let regex = /(?:\?|&amp;|&)+([^=]+)(?:=([^&]*))*/g;
    let match: any;
    let str: any = [];
    link.href = url;
    param = encodeURIComponent(param);
    while (match = regex.exec(link.search)) {
        if (param != match[1]) {
            str.push(match[1] + (match[2] ? '=' + match[2] : ''));
        }
    }
    str.push(param + (value ? '=' + encodeURIComponent(value) : ''));
    link.search = str.join('&');
    return link.href;
}
