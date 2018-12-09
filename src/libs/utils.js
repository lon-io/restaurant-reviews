import config from '../config';

/**
 * Helper to get the url for responsive formats of images according
 * to the names the grunt task gives to the compiled responsive images
 * @param {*} url
 * @param {*} suffix
 */
export const getResponsiveImageUrl = (url, suffix) => {
    return url.replace('.webp', `-${suffix}.webp`);
}

/**
 * Helper to get the base url for routes and assets
 */
export const getBaseUrl = () => {
    let baseUrl = window.location.origin;
    if (window.location.pathname.includes(config.ghPagesName)) baseUrl += config.ghPagesName;

    return baseUrl;
}

export const formatDate = (dateObject) => {
    if (!(dateObject instanceof Date)) return "";
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    return dateObject.toLocaleDateString("en-US", options);
}

/**
 * Smooth scroll to an element
 * @param {*} selector [The element's selector. E.g. '#id', '.class']
 * @returns {undefined}
 */
export const scrollToElementBottom = (element) => {
    if (element && element.offsetBottom) {
        window.scroll({
            top: element.offsetBottom,
            behavior: 'smooth',
        });
    }
};

/**
 * Sets the visibility of a DOM element
 * @param {*} selector [The selector to match the element]
 * @param {*} hide [Whether to hide the element]
 */
export const setElementVisibility = (selector, hide) => {
    const offlineLabel = document.querySelector(selector);

    if (offlineLabel) {
        offlineLabel.classList.toggle('hide', Boolean(hide));
    }
}
