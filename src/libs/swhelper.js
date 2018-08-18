/**
 * Helper to register the service worker
 */
export const registerServiceWorker = () => {
    if (navigator && 'serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').then((registration) => {
            // Registration was successful
            console.log('{{App.registerServiceWorker}} ServiceWorker registration successful with scope: ',
                registration.scope);
        }, (err) => {
            // registration failed :(
            console.log('{{App.registerServiceWorker}} ServiceWorker registration failed: ', err);
        });
    }
}