import DBHelper from './dbhelper';
import {
    debounce,
    setElementVisibility,
} from './utils';

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

export const listenForFavouriteAction = () => {
    const debouncedHandler = debounce(self, (favButton) => {
            const restaurantID = favButton.dataset.key;
            favButton.classList.toggle('checked');

            console.log(restaurantID);

            const checked = favButton.classList.contains('checked');
            DBHelper.setRestaurantFavouriteStatus(restaurantID, checked)
    }, 300);

    window.addEventListener('click', (evt) => {
        const favButton = evt.target && evt.target.closest('.restaurant-favourite');
        if (favButton) {
            debouncedHandler(favButton);
        }
    })
}
