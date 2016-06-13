import { Service } from '../lib/Service'; // import service from your local core folder

/**
 * Describes a validator
 * 
 * @interface IValidator
 */
interface IValidator {
    validate: (element: Element) => boolean;
    name: string;
    defaultError: string;
    selectors?: string | Array<string>;
}



/**
 * Service for validating forms
 * Call `validateForm` with the form element as a parameter for validating.
 * `validateForm(formElement);`
 * 
 * @export
 * @class FormValidationService
 * @extends {Service}
 */
export class FormValidationService extends Service {
    
    static FORM_ELEMENTS = ['input', 'select', 'textarea'];
    static SELECTOR_ATTRIBUTE = 'data-selector'
    static ERROR_REF_ATTRIBUTE = 'data-error-ref';
    static ERROR_CLASS = 'error';
    static ERROR_WRAPPER_TEMPLATE = '<ul class="error_list">{{errors}}</ul>';
    static ERROR_TEMPLATE = '<li class="error_list__item">{{msg}}</li>';

    private _validators: { [name: string]: IValidator } = {};

    /**
     * Validates a whole form, calls validateField for every input, select or textarea
     * 
     * @param {HTMLFormElement} formElement The form element
     * @returns {boolean} true if form is valid, false if not
     */
    validateForm(formElement: HTMLFormElement): boolean {
        let fields = formElement.querySelectorAll(FormValidationService.FORM_ELEMENTS.join(', '));
        let isValid = true;
        for (let i = 0, max = fields.length; i < max; i++) {
            if (!this.validateField(fields[i])) {
                isValid = false;
            }
        }
        return isValid;
    }

    /**
     * Validates an Input, Select or Textarea Element
     * 
     * @param {Element} element The Input, Select or Textarea Element
     * @returns {boolean} true if value is valid, false if not
     */
    validateField(element: Element): boolean {
        let validators = this._validators;
        let isValid = true;
        let errors: Array<string> = [];
        for (let key in validators) {
            if (validators.hasOwnProperty(key)) {
                let validator = validators[key];

                // generate selectors string
                let selectors = '';
                if (typeof validator.selectors === 'string') {
                    selectors = <string>validator.selectors;
                } else if (Array.isArray(validator.selectors)) {
                    selectors = (<Array<string>>validator.selectors).join(', ');
                }

                // check if element does match selector, if so, validate element
                if (this.doesElementMatchSelector(element, selectors) && !validator.validate(element)) {
                    isValid = false;
                    // read custom error message from data attribute
                    let errorMsg = element.getAttribute('data-error-' + validator.name);
                    // push custom or default error message to errors array 
                    errors.push(errorMsg ? errorMsg : validator.defaultError);
                }
                let selectorAttr = element.getAttribute(FormValidationService.SELECTOR_ATTRIBUTE)
                if (selectorAttr && selectorAttr.split(' ').indexOf(validator.name) && !validator.validate(element)) {
                    isValid = false;
                    if (!errors.indexOf(validator.defaultError)) {
                        errors.push(validator.defaultError);
                    }
                }
            }
        }
        if (isValid) {
            element.classList.remove(FormValidationService.ERROR_CLASS);
        } else {
            element.classList.add(FormValidationService.ERROR_CLASS);
        }
        let errorRef = element.getAttribute(FormValidationService.ERROR_REF_ATTRIBUTE);
        if (errorRef) {
            let errorElement = document.getElementById(errorRef);
            if (errorElement) {
                errorElement.parentElement.removeChild(errorElement);
            }
        } else {
            errorRef = Math.floor(Math.random() * 10 + 1) * Date.now() + '';
            element.setAttribute(FormValidationService.ERROR_REF_ATTRIBUTE, errorRef);
        }
        if (errors.length) {
            let fragment = this.generateErrorsElement(errors);
            (<HTMLElement>fragment.firstChild).id = errorRef;
            this.insertAfter(fragment, element);
        }
        return isValid;
    }

    /**
     * Registers a new validator.
     * 
     * @param {string} name Name of the Validator
     * @param {(element: Element) => boolean} validateFn Function which will be called to validate a value
     * @param {string} defaultError Default error message
     * @param {(string | Array<string>)} [selectors] Selector for elements where the validate function will be applied
     */
    registerValidator(name: string, validateFn: (element: Element) => boolean, defaultError: string, selectors?: string | Array<string>) {
        if (typeof this._validators[name] === 'function') {
            throw new Error(`Validator "${name}" already exists`);
        }
        this._validators[name] = {
            validate: validateFn,
            name: name,
            defaultError: defaultError,
            selectors: selectors
        };
    }

    /**
     * Registers a new validator.
     * 
     * @static
     * @param {string} name Name of the Validator
     * @param {(element: Element) => boolean} validateFn Function which will be called to validate a value
     * @param {string} defaultError Default error message
     * @param {(string | Array<string>)} [selectors] Selector for elements where the validate function will be applied
     */
    static registerValidator(name: string, validateFn: (element: Element) => boolean, defaultError: string, selectors?: string | Array<string>) {
        let instance = <FormValidationService>FormValidationService.getInstance();
        instance.registerValidator.apply(instance, arguments);
    }

    /**
     * Checks if element matches the selector
     * 
     * @private
     * @param {Element} element
     * @param {string} selector
     * @returns {boolean} true if element matches, false if not
     */
    private doesElementMatchSelector(element: Element, selector: string): boolean {
        if (!element.parentElement) {
            throw new Error(`Elements needs to have a parent to test if selector "${selector}" matches`);
        }
        let foundElements = element.parentElement.querySelectorAll(selector);
        for (let i = 0, max = foundElements.length; i < max; i++) {
            if (element === foundElements[i]) {
                return true;
            }
        }
        return false;
    }

    /**
     * Generate Error element with error messages in it
     * 
     * @private
     * @param {Array<string>} errors Array with error strings
     * @returns {DocumentFragment} Generated error elements in a document fragment
     */
    private generateErrorsElement(errors: Array<string>): DocumentFragment {
        if (!errors || !errors.length) {
            return null;
        }
        let html = '';
        for (let i = 0, max = errors.length; i < max; i++) {
            html += FormValidationService.ERROR_TEMPLATE.replace('{{msg}}', errors[i]);
        }
        html = FormValidationService.ERROR_WRAPPER_TEMPLATE.replace('{{errors}}', html);
        return this.compileHTML(html);
    }

    /**
     * Compiles a html string to elements
     * 
     * @private
     * @param {string} html HTML string
     * @returns {DocumentFragment} DocumentFragment with generated elements
     */
    private compileHTML(html: string): DocumentFragment {
        let fragment = document.createDocumentFragment();
        let tmpElement = document.createElement('div');
        tmpElement.innerHTML = html;
        let children = tmpElement.children;
        for (let i = 0, max = children.length; i < max; i++) {
            fragment.appendChild(children[i]);
        }
        return fragment;
    }

    /**
     * Inserts element after a reference element
     * 
     * @private
     * @param {Node} element Element to be inserted
     * @param {Element} refElement reference element
     */
    private insertAfter(element: Node, refElement: Element): void {
        if (refElement.nextElementSibling) {
            refElement.parentElement.insertBefore(element, refElement.nextElementSibling);
        } else {
            refElement.parentElement.appendChild(element);
        }
    }
}
/**
 * Default validator for required inputs
 */
FormValidationService.registerValidator('required', function (element: HTMLInputElement) {
    return !!(!element.required || (element.required && element.value.length) || (element.required && element.checked));
}, 'This value is required.', ['input', 'textarea', 'select']);

/**
 * Default validator for number inputs
 */
FormValidationService.registerValidator('number', function (element: HTMLInputElement) {
    let result = element.value.match(/^-?(\d*\.)?\d+(e[-+]?\d+)?$/i);
    return !!(result && result.length);
}, 'This value should be a valid number.', ['input[type="number"]']);

/**
 * Default validator for email inputs
 */
FormValidationService.registerValidator('email', function (element: HTMLInputElement) {
    let result = element.value.match(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i);
    return !!(result && result.length);
}, 'This value should be a valid email.', ['input[type="email"]']);