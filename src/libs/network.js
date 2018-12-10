import DBHelper from './dbhelper';

/**
 * Util to perform actions on network chanegs
 * @param {*} onlineCB [Function to call when online]
 * @param {*} offlineCB [Function to call when offline]
 */
export const listenForNetworkChanges = (onlineCB, offlineCB) => {
    if (!navigator.onLine) {
        setElementVisibility('#offline-warning', false);
    }

    window.addEventListener('online', () => {
        setElementVisibility('#offline-warning', true);

        DBHelper.syncStagedReviews();
        DBHelper.syncStagedFavouriteActions();
        if (typeof onlineCB === 'function') onlineCB();
    });

    window.addEventListener('offline', () => {
        setElementVisibility('#offline-warning', false);

        if (typeof offlineCB === 'function') offlineCB();
    });
}
