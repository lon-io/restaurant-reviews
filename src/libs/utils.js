import config from '../config';

/**
 * Helper to get the url for responsive formats of images according
 * to the names the grunt task gives to the compiled responsive images
 * @param {*} url
 * @param {*} suffix
 */
export const getResponsiveImageUrl = (url, suffix) => {
    return url.replace('.jpg', `-${suffix}.jpg`);
}

/**
 * Helper to get the base url for routes and assets
 */
export const getBaseUrl = () => {
    let baseUrl = window.location.origin;
    if (window.location.pathname.includes(config.ghPagesName)) baseUrl += config.ghPagesName;

    return baseUrl;
}