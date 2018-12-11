import config from '../config';
import { getBaseUrl, isOnline, } from './utils';
import IDBHelper from './idb-helper';

const {
    db: {
        stores,
        keys,
    },
} = config;
const idbHelper = new IDBHelper();

/**
 * Common database helper functions.
 */
export default class DBHelper {

    /**
     * Database URL.
     * Change this to restaurants.json file location on your server.
     */
    static get DATABASE_URL() {
        return `http://localhost:1337`;
    }

    /**
     * Fetch all restaurants.
     */
    static async fetchRestaurants(callback, networkCB) {
        try {
            let restaurants = await idbHelper.get(keys.RESTAURANTS);
            let cacheResolved = false;

            // Present cached data early
            if (restaurants) {
                cacheResolved = true;
                callback(null, restaurants);
            }

            console.log('nada 5!!');
            const hitServer = !cacheResolved || typeof networkCB === 'function'
            if (hitServer) {
                console.log('nada 6!!');
                // Fetch (potentially) updated data
                restaurants = await fetch(`${DBHelper.DATABASE_URL}/restaurants`)
                .then(res => res.json())

                // Cache the response
                idbHelper.set(keys.RESTAURANTS, restaurants);

                console.log('nada!! 7');
                if (!cacheResolved) callback(null, restaurants);
                else if (typeof networkCB === 'function') networkCB(null, restaurants)
            }
        } catch(error) {
            // Oops!. Got an error from server.
            callback(error, null);
        }
    }

    /**
     * Fetch a restaurant by its ID.
     */
    static fetchRestaurantById(id, callback, networkCB) {
        console.log('nada2 !!');
        const handler = (error, restaurants, _callback) => {
            console.log('nada 3!!');
            if (typeof _callback === 'function') {
                console.log('nada 4!!');
                if (error) {
                    console.log('nada 9!!');
                    _callback(error, null);
                } else {
                    const restaurant = restaurants.find(r => r.id == id);
                    if (restaurant) { // Got the restaurant
                        console.log('nada 10!!');
                        _callback(null, restaurant);
                    } else { // Restaurant does not exist in the database
                        console.log('nada 11!!');
                        _callback('Restaurant does not exist', null);
                    }
                }
            }
        };

        // Fetch all restaurants  with proper error handling
        DBHelper.fetchRestaurants(
            (error, restaurants) => handler(error, restaurants, callback),
            (error, restaurants) => handler(error, restaurants, networkCB)
        );
    }

    /**
     * Fetch a restaurant by its ID.
     */
    static async fetchRestaurantReviewsById(id, callback) {
        const cacheKey = `${keys.RESTAURANTS_REVIEWS}_${id}`;
        const stagedCacheKey = `${keys.STAGED_REVIEWS}_${id}`;
        try {
            let reviews = await idbHelper.get(cacheKey);
            let stagedReviews = [];

            // Present cached content
            // If we're offline, Get staged reviews
            if (!isOnline) {
                stagedReviews = await idbHelper.get(stagedCacheKey, stores.STAGED_REVIEWS);
            }

            if (Array.isArray(stagedReviews) && stagedReviews.length > 0) {
                reviews = [ ...(Array.isArray(reviews) ? reviews : []), ...stagedReviews, ];
            }

            if (reviews && reviews.length > 0) {
                callback(null, reviews);
            }

            // Fetch (potentially) updated content;
            reviews = await fetch(`${DBHelper.DATABASE_URL}/reviews?restaurant_id=${id}`)
            .then(res => res.json())

            // Update the cache
            idbHelper.set(cacheKey, reviews);

            callback(null, reviews);
        } catch(error) {
            // Oops!. Got an error from server.
            callback(error, null);
        }
    }

    static async submitReview(review, skipCache) {
        try {
            await fetch(`${DBHelper.DATABASE_URL}/reviews`, {
                method: "POST", // *GET, POST, PUT, DELETE, etc.
                mode: "cors", // no-cors, cors, *same-origin
                cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
                credentials: "same-origin", // include, *same-origin, omit
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
                redirect: "follow", // manual, *follow, error
                referrer: "no-referrer", // no-referrer, *client
                body: JSON.stringify(review), // body data type must match "Content-Type" header
            })
        } catch(error) {
            console.log('Failed to submit review:', JSON.stringify(review), error.message);

            if (!skipCache) {
                const cacheKey = `${keys.STAGED_REVIEWS}_${review.restaurant_id}`;

                review.createdAt = Date.now();
                review.updatedAt = Date.now();

                // Stage the Review
                return idbHelper.get(cacheKey, stores.STAGED_REVIEWS).then((stagedReviews) => {
                    stagedReviews = [ ...(Array.isArray(stagedReviews) ? stagedReviews : []), review, ];

                    idbHelper.set(cacheKey, stagedReviews, stores.STAGED_REVIEWS);
                })
            }
        }
    }

    static syncStagedReviews() {
        // Get all keys
        idbHelper.keys(stores.STAGED_REVIEWS).then(keys => {
            if (Array.isArray(keys) && keys.length > 0) {
                keys.forEach(key => {
                    // Get reviews for each key
                    idbHelper.get(key, stores.STAGED_REVIEWS).then(reviews => {
                        // Sync each review
                        return Array.isArray(reviews) && reviews.length > 0
                            ? Promise.all(reviews.filter(r => !!r).map(review => this.submitReview(review, true)))
                            : Promise.resolve(false);
                    }).then(done => {
                        // Clear the key when sync is done
                        if (done) idbHelper.delete(key, stores.STAGED_REVIEWS);
                    });
                })
            }
        })
    }

    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */
    static fetchRestaurantByCuisine(cuisine, callback, networkCB) {
        const handler = (error, restaurants, _callback) => {
            if (typeof _callback === 'function') {
                if (error) {
                    _callback(error, null);
                } else {
                    // Filter restaurants to have only given cuisine type
                    const results = restaurants.filter(r => r.cuisine_type == cuisine);
                    _callback(null, results);
                }
            }
        };

        // Fetch all restaurants  with proper error handling
        DBHelper.fetchRestaurants(
            (error, restaurants) => handler(error, restaurants, callback),
            (error, restaurants) => handler(error, restaurants, networkCB)
        );
    }

    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */
    static fetchRestaurantByNeighborhood(neighborhood, callback, networkCB) {
        const handler = (error, restaurants, _callback) => {
            if (typeof _callback === 'function') {
                if (error) {
                    _callback(error, null);
                } else {
                    // Filter restaurants to have only given neighborhood
                    const results = restaurants.filter(r => r.neighborhood == neighborhood);
                    _callback(null, results);
                }
            }
        };

        // Fetch all restaurants
        DBHelper.fetchRestaurants(
            (error, restaurants) => handler(error, restaurants, callback),
            (error, restaurants) => handler(error, restaurants, networkCB)
        );
    }

    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */
    static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback, networkCB) {
        const handler = (error, restaurants, _callback) => {
            if (typeof _callback === 'function') {
                if (error) {
                    _callback(error, null);
                } else {
                    let results = restaurants
                    if (cuisine != 'all') { // filter by cuisine
                        results = results.filter(r => r.cuisine_type == cuisine);
                    }
                    if (neighborhood != 'all') { // filter by neighborhood
                        results = results.filter(r => r.neighborhood == neighborhood);
                    }
                    _callback(null, results);
                }
            }
        }

        // Fetch all restaurants
        DBHelper.fetchRestaurants(
            (error, restaurants) => handler(error, restaurants, callback),
            (error, restaurants) => handler(error, restaurants, networkCB)
        );
    }

    /**
     * Fetch all neighborhoods with proper error handling.
     */
    static fetchNeighborhoods(callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all neighborhoods from all restaurants
                const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
                    // Remove duplicates from neighborhoods
                const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
                callback(null, uniqueNeighborhoods);
            }
        });
    }

    /**
     * Fetch all cuisines with proper error handling.
     */
    static fetchCuisines(callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all cuisines from all restaurants
                const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
                    // Remove duplicates from cuisines
                const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
                callback(null, uniqueCuisines);
            }
        });
    }

    static async setRestaurantFavouriteStatus(restaurantID, status, skipCache) {
        try {
            await fetch(
                `${DBHelper.DATABASE_URL}/restaurants/${restaurantID}?is_favorite=${Boolean(status)}`, {
                    method: "PUT", // *GET, POST, PUT, DELETE, etc.
                    mode: "cors", // no-cors, cors, *same-origin
                    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
                    credentials: "same-origin", // include, *same-origin, omit
                    headers: {
                        "Content-Type": "application/json; charset=utf-8",
                    },
                    redirect: "follow", // manual, *follow, error
                    referrer: "no-referrer", // no-referrer, *client
                })
        } catch(error) {
            console.log('Failed to set favourite status for:', restaurantID, status, error.message);

            if (!skipCache) {
                const cacheKey = keys.STAGED_FAVOURITE_ACTIONS;

                // Stage the Review
                return idbHelper.get(cacheKey).then((stagedFavActions) => {
                    stagedFavActions = [...(Array.isArray(stagedFavActions) ? stagedFavActions : []), {
                        id: restaurantID,
                        status: Boolean(status),
                    }, ];

                    idbHelper.set(cacheKey, stagedFavActions);
                })
            }
        }
    }

    static syncStagedFavouriteActions() {
        const cacheKey = keys.STAGED_FAVOURITE_ACTIONS;

        // Get cached actions
        idbHelper.get(cacheKey).then(stagedFavActions => {
            if (Array.isArray(stagedFavActions) && stagedFavActions.length > 0) {
                const resultPromise = Promise.all(
                    stagedFavActions
                    .filter(a => !!a)
                    .map(action => this.setRestaurantFavouriteStatus(action.id, action.status, true))
                )

                resultPromise.then(done => {
                    // Clear the key when sync is done
                    if (done) idbHelper.delete(key);
                });
            }
        })
    }

    static fetchStagedFavouriteActions (callback) {
        const cacheKey = keys.STAGED_FAVOURITE_ACTIONS;

        // Get cached actions
        return idbHelper.get(cacheKey).then(stagedFavActions => {
            if (Array.isArray(stagedFavActions) && stagedFavActions.length > 0) {
                callback(stagedFavActions);
            }
        })
    }

    /**
     * Restaurant page URL.
     */
    static urlForRestaurant(restaurant) {
        return (`${getBaseUrl()}/restaurant.html?id=${restaurant.id}`);
    }

    /**
     * Restaurant image URL.
     */
    static imageUrlForRestaurant(restaurant) {
        return (`${getBaseUrl()}/img/${restaurant.photograph}.webp`);
    }

    /**
     * Map marker for a restaurant.
     */
    static mapMarkerForRestaurant(restaurant, map) {
            // https://leafletjs.com/reference-1.3.0.html#marker
            const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng], {
                title: restaurant.name,
                alt: restaurant.name,
                url: DBHelper.urlForRestaurant(restaurant)
            })
            marker.addTo(newMap);
            return marker;
        }
}
