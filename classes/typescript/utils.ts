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

/**
 * get current window width
 * 
 * @export
 * @returns {number} current window width
 */
export function getWindowWidth():number {
    return window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth;
}

/**
 * get current window height
 * 
 * @export
 * @returns {number} current window height
 */
export function getWindowHeight():number {
    return window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight;
}

/**
 * Serialize Function which returns all the
 * inputs of the HTMLFormElement passed
 * as parameter as URL String
 * 
 * @param {HTMLFormElement} form
 * @returns {string} Serialized Form
 */
export function serialize(form:HTMLFormElement): string {
	if (!form || form.nodeName !== "FORM") {
		return;
	}
    let i:number;
    let j:number;
    let q:string[] = [];
	for (i = form.elements.length - 1; i >= 0; i = i - 1) {
		if ((<HTMLInputElement>form.elements[i]).name === "") {
			continue;
		}
		switch ((<HTMLInputElement>form.elements[i]).nodeName) {
		case 'INPUT':
			switch ((<HTMLInputElement>form.elements[i]).type) {
			case 'text':
			case 'hidden':
			case 'password':
			case 'button':
			case 'reset':
			case 'submit':
				q.push((<HTMLInputElement>form.elements[i]).name + "=" + encodeURIComponent((<HTMLInputElement>form.elements[i]).value));
				break;
			case 'checkbox':
			case 'radio':
				if ((<HTMLInputElement>form.elements[i]).checked) {
					q.push((<HTMLInputElement>form.elements[i]).name + "=" + encodeURIComponent((<HTMLInputElement>form.elements[i]).value));
				}						
				break;
			case 'file':
				break;
			}
			break;			 
		case 'TEXTAREA':
			q.push((<HTMLInputElement>form.elements[i]).name + "=" + encodeURIComponent((<HTMLInputElement>form.elements[i]).value));
			break;
		case 'SELECT':
			switch ((<HTMLInputElement>form.elements[i]).type) {
			case 'select-one':
				q.push((<HTMLInputElement>form.elements[i]).name + "=" + encodeURIComponent((<HTMLInputElement>form.elements[i]).value));
				break;
			case 'select-multiple':
				for (j = (<HTMLSelectElement>form.elements[i]).options.length - 1; j >= 0; j = j - 1) {
					if ((<HTMLOptionElement>(<HTMLSelectElement>form.elements[i]).options[j]).selected) {
						q.push((<HTMLSelectElement>form.elements[i]).name + "=" + encodeURIComponent((<HTMLOptionElement>(<HTMLSelectElement>form.elements[i]).options[j]).value));
					}
				}
				break;
			}
			break;
		case 'BUTTON':
			switch ((<HTMLInputElement>form.elements[i]).type) {
			case 'reset':
			case 'submit':
			case 'button':
				q.push((<HTMLInputElement>form.elements[i]).name + "=" + encodeURIComponent((<HTMLInputElement>form.elements[i]).value));
				break;
			}
			break;
		}
	}
	return q.join("&");
}

/**
 * Serialize URL Encoded Key:value Pair String to JS Object 
 * 
 * @export
 * @param {string} serializedString
 * @returns {*} JavaSript Object
 */
export function serializedStringToJSON(serializedString: string): any {            
    let pairs = serializedString.split('&');
    
    let result: any = {};
	for (let i = 0, len = pairs.length; i < len; i++) {
		let pair = pairs[i].split('=');
        result[pair[0]] = decodeURIComponent(pair[1] || '');
	}

    return JSON.parse(JSON.stringify(result));
}

/**
 * Combines serialize + serializedStringToJSON
 * and directly returnes the JS Object.
 * 
 * @export
 * @param {HTMLFormElement} form
 * @returns {*}
 */
export function serializeArray(form: HTMLFormElement): any {
	return serializedStringToJSON(serialize(form));
}


/**
 * get param by name from url
 * 
 * @export
 * @param {string} name
 * @param {string} url
 * @returns {string}
 */
export function getParameterByName(name: string, url: string): string {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/**
 * Cut text on a specific length but only if the word is already seperated by a ' ', otherwise
 * make the text even smaller.
 * 
 * @export
 * @param {string} text
 * @param {number} maxCharacters
 * @param {string} [append='...']
 * @returns {string}
 */
export function intelligentCutText(text: string, maxCharacters: number, append: string = '...'): string {
	if (text.length > maxCharacters) {
		return text.substr(0, text.substr(0, maxCharacters).lastIndexOf(' ')) + append;
	}
	return text;
}

/**
 * Add's a query param and link to the history of the browser
 * 
 * @export
 * @param {string} url
 * @param {string} param
 * @param {string} value
 * @param {string} title
 */
export function addQueryParamToHistory(url: string, param: string, value: string, title:string) {
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
	window.history.pushState({}, title , link.href);
}
