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

/**
 * Loads multiple Images using the loadImage function.
 * 
 * @export
 * @param {HTMLElement} root HTML Element which should contain the images
 * @param {Function} onSuccess Success Function which should be called
 * @param {Function} [onError] Error Function which should be called
 */
export function loadImages(root: HTMLElement, onSuccess: Function, onError?: Function):void;
/**
 * Loads multiple Images using the loadImage function.
 * 
 * @export
 * @param {Array<string>} imageSources Array of Image Sources as String
 * @param {Function} onSuccess Success Function which should be called
 * @param {Function} [onError] Error Function which should be called
 */
export function loadImages(imageSources: Array<string>, onSuccess: Function, onError?: Function):void;

/**
 * Loads multiple Images using the loadImage function.
 * 
 * @export
 * @param {(HTMLElement | Array<string>)} rootOrImageSources HTML Element which should contain the images OR Array of Image Sources as String
 * @param {Function} onSuccess Success Function which should be called
 * @param {Function} [onError=function(){}] Error Function which should be called
 */
export function loadImages(rootOrImageSources: HTMLElement | Array<string>, onSuccess: Function, onError: Function = function(){}):void {
    let images = rootOrImageSources instanceof HTMLElement ? rootOrImageSources.querySelectorAll('img') : rootOrImageSources;
    let currentIndex = 0;
    let max = images.length;
    let hasErrors = false;
    function updateIndex() {
        if(currentIndex == max) {
            hasErrors ? onError() : onSuccess();
        }
    }
    for (let index = 0; index < max; index++) {
        let imageElement:any = images[index];
        loadImage(!!imageElement.src && (imageElement.src.length > 3) ? imageElement.src : imageElement.srcset, 
                  () => {
                    currentIndex++;
                    updateIndex.call(this);
                  }, 
                  () => {
                      currentIndex++;
                      hasErrors = true;
                      updateIndex.call(this);
                  });
    }
}


/**
 * Load Image and executes the onSuccess function after 
 * the image was loaded - if an error occures we will call the
 * error function.
 * 
 * @export
 * @param {string} src Source of the image
 * @param {Function} onSuccess Success Function which should be called
 * @param {Function} [onError=function(){}] Error Function which should be called
 * @param {number} [timeout=2000] Timeout ms amount
 */
export function loadImage(src: string, onSuccess: Function, onError: Function = function(){}, timeout:number = 2000):void {
    let image = new Image();
    let isTimedOut = false;
    let timer = setTimeout(() => {
        isTimedOut = true;
        onError();
    }, 2000);
    image.onload = () => {
        clearTimeout(timer);
        if(isTimedOut) {
            return;
        }
        onSuccess();
    }
    image.onerror = () => {
        clearTimeout(timer);
        if(isTimedOut) {
            return;
        }
        onError();
    }
    image.src = src;
}

/**
 * Prepends an element as a first child to the parent element
 * 
 * @export
 * @param {HTMLElement} parentElement Parent Element where the new element will prepended 
 * @param {HTMLElement} element The element which will be prepended
 */
export function prepend(parentElement: HTMLElement, element: HTMLElement): void {
    if (parentElement.firstChild) {
        parentElement.insertBefore(element, parentElement.firstChild);
    } else {
        parentElement.appendChild(element);
    }
}

/**
 * Inserts an element before a reference element
 * 
 * @export
 * @param {HTMLElement} element The element which will be inserted
 * @param {HTMLElement} refElement The reference element
 */
export function insertBefore(element: HTMLElement, refElement: HTMLElement): void {
    refElement.parentElement.insertBefore(element, refElement);
}

/**
 * Inserts an element right after a reference element
 * 
 * @export
 * @param {HTMLElement} element The element which will be inserted
 * @param {HTMLElement} refElement The reference element
 */
export function insertAfter(element: HTMLElement, refElement: HTMLElement): void {
    if (refElement.nextElementSibling) {
        refElement.parentElement.insertBefore(element, refElement.nextElementSibling);
    } else {
        refElement.parentElement.appendChild(element);
    }
}

export function firstParentByClass(element: HTMLElement, klass: string): HTMLElement {
    if (element === document.body || !element.parentElement) {
        return null;
    }
    if (element.classList.contains(klass)) {
        return element;
    }
    return firstParentByClass(element.parentElement, klass);
}
