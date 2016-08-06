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