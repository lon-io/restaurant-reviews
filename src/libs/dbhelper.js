import config from '../config';
import { getBaseUrl, generateAlphaNumericString, } from './utils';
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
    static async fetchRestaurants(callback) {
        try {
            let restaurants = await idbHelper.get(keys.RESTAURANTS);

            // Cache miss - make request;
            if (!restaurants) {
                restaurants = await fetch(`${DBHelper.DATABASE_URL}/restaurants`)
                .then(res => res.json())

                // Cache the response
                idbHelper.set(keys.RESTAURANTS, restaurants);
            }

            callback(null, restaurants);
        } catch(error) {
            // Oops!. Got an error from server.
            callback(error, null);
        }
    }

    /**
     * Fetch a restaurant by its ID.
     */
    static fetchRestaurantById(id, callback) {
        // fetch all restaurants with proper error handling.
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                const restaurant = restaurants.find(r => r.id == id);
                if (restaurant) { // Got the restaurant
                    callback(null, restaurant);
                } else { // Restaurant does not exist in the database
                    callback('Restaurant does not exist', null);
                }
            }
        });
    }

    /**
     * Fetch a restaurant by its ID.
     */
    static async fetchRestaurantReviewsById(id, callback) {
        const cacheKey = `${keys.RESTAURANTS_REVIEWS}_${id}`;
        try {
            let reviews = await idbHelper.get(cacheKey);

            // Cache miss - make request;
            if (!reviews) {
                console.log('here too');
                reviews = await fetch(`${DBHelper.DATABASE_URL}/reviews?restaurant_id=${id}`)
                .then(res => res.json())

                // Cache the response
                idbHelper.set(cacheKey, reviews);
            }

            callback(null, reviews);
        } catch(error) {
            // Oops!. Got an error from server.
            callback(error, null);
        }
    }

    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */
    static fetchRestaurantByCuisine(cuisine, callback) {
        // Fetch all restaurants  with proper error handling
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given cuisine type
                const results = restaurants.filter(r => r.cuisine_type == cuisine);
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */
    static fetchRestaurantByNeighborhood(neighborhood, callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given neighborhood
                const results = restaurants.filter(r => r.neighborhood == neighborhood);
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */
    static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                let results = restaurants
                if (cuisine != 'all') { // filter by cuisine
                    results = results.filter(r => r.cuisine_type == cuisine);
                }
                if (neighborhood != 'all') { // filter by neighborhood
                    results = results.filter(r => r.neighborhood == neighborhood);
                }
                callback(null, results);
            }
        });
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
        /* static mapMarkerForRestaurant(restaurant, map) {
          const marker = new google.maps.Marker({
            position: restaurant.latlng,
            title: restaurant.name,
            url: DBHelper.urlForRestaurant(restaurant),
            map: map,
            animation: google.maps.Animation.DROP}
          );
          return marker;
        } */

    static async submitReview(data) {
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
                body: JSON.stringify(data), // body data type must match "Content-Type" header
            })
        } catch(error) {
            console.log('Failed to submit review:', JSON.stringify(data), error.message);

            // Stage the Review
            const hash = generateAlphaNumericString();
            return idbHelper.set(`${keys.STAGED_REVIEWS}_${hash}`, data, stores.STAGED_REVIEWS);
        }
    }
}
