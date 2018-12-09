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
export const scrollToElement = (element) => {
    if (element && element.offsetTop) {
        window.scroll({
            top: element.offsetTop,
            behavior: 'smooth',
        });
    }
};

/*
 * Generates an alpha numeric string
 * @link http://bit.ly/1AEPJuH
 * @param {number} length The length of the string
 * @returns {string} The generated string
 */
export const generateAlphaNumericString = (length = 5) => (
    Math.round(
        (Math.pow(36, length + 1) - Math.random() * Math.pow(36, length)
        )).toString(36).slice(1)
);
