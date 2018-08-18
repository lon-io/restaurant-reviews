/**
 * Helper to get the url for responsive formats of images according
 * to the names the grunt task gives to the compiled responsive images
 * @param {*} url
 * @param {*} suffix
 */
export const getResponsiveImageUrl = (url, suffix) => {
    return url.replace('.jpg', `-${suffix}.jpg`)
}