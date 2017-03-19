import { isString, doLater } from './types';

export function scrollToElement(selectorOrElement: any): void {
    let element = isString(selectorOrElement) ? document.querySelector(selectorOrElement) : selectorOrElement;
    if (element) {
        let docRect = document.documentElement.getBoundingClientRect(),
            elRect = element.getBoundingClientRect();
        let x = elRect.left - docRect.left;
        let y = elRect.top - docRect.top;
        doLater(() => window.scrollTo(x, y));
    }
}
