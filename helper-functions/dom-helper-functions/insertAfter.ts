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