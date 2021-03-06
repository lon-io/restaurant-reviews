import config from './config';
import DBHelper from './libs/dbhelper';
import {
    isOnline,
    getResponsiveImageUrl,
} from './libs/utils';
import {
    listenForNetworkChanges,
    listenForFavouriteAction,
} from './libs/listeners';
import { loveSVGFactory, } from './libs/icons';
import {
    registerServiceWorker,
} from './libs/swhelper';

let restaurants,
    neighborhoods,
    cuisines
var newMap
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
    registerServiceWorker();
    initMap(); // added
    fetchNeighborhoods();
    fetchCuisines();
    listenForNetworkChanges();
    listenForFavouriteAction();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
const fetchNeighborhoods = () => {
    DBHelper.fetchNeighborhoods((error, neighborhoods) => {
        if (error) { // Got an error
            console.error(error);
        } else {
            self.neighborhoods = neighborhoods;
            fillNeighborhoodsHTML();
        }
    });
}

/**
 * Set neighborhoods HTML.
 */
const fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
    const select = document.getElementById('neighborhoods-select');
    neighborhoods.forEach(neighborhood => {
        const option = document.createElement('option');
        option.innerHTML = neighborhood;
        option.value = neighborhood;
        select.append(option);
    });
}

/**
 * Fetch all cuisines and set their HTML.
 */
const fetchCuisines = () => {
    DBHelper.fetchCuisines((error, cuisines) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.cuisines = cuisines;
            fillCuisinesHTML();
        }
    });
}

/**
 * Set cuisines HTML.
 */
const fillCuisinesHTML = (cuisines = self.cuisines) => {
    const select = document.getElementById('cuisines-select');

    cuisines.forEach(cuisine => {
        const option = document.createElement('option');
        option.innerHTML = cuisine;
        option.value = cuisine;
        select.append(option);
    });
}

/**
 * Initialize leaflet map, called from HTML.
 */
const initMap = () => {
    self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
        scrollWheelZoom: false
    });
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: config.mapBoxApiKey,
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
    }).addTo(self.newMap);

    updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
const updateRestaurants = () => {
    const cSelect = document.getElementById('cuisines-select');
    const nSelect = document.getElementById('neighborhoods-select');

    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;

    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;

    DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood,
        (error, restaurants) => {
            if (error) { // Got an error!
                console.error(error);
            } else {
                resetRestaurants(restaurants);
                fillRestaurantsHTML();

                if (!isOnline()) {
                    DBHelper.fetchStagedFavouriteActions((stagedActions) => {
                        console.log('Lon', stagedActions);
                        fillRestaurantFavourites(restaurants, stagedActions);
                    })
                }
            }
        }, (error, restaurants) => {
            if (error) { // Got an error!
                console.error(error);
            } else {
                fillRestaurantFavourites(restaurants);
            }
        })
}

window.updateRestaurants = updateRestaurants;

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
const resetRestaurants = (restaurants) => {
    // Remove all restaurants
    self.restaurants = [];
    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';

    // Remove all map markers
    if (self.markers) {
        self.markers.forEach(marker => marker.remove());
    }
    self.markers = [];
    self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
const fillRestaurantsHTML = (restaurants = self.restaurants) => {
    const ul = document.getElementById('restaurants-list');
    restaurants.forEach(restaurant => {
        ul.append(createRestaurantHTML(restaurant));
    });
    addMarkersToMap();
}

const fillRestaurantFavourites = (restaurants = self.restaurants, stagedActions) => {
    const ul = document.getElementById('restaurants-list');
    restaurants.forEach(restaurant => {
        const favourite = ul.querySelector(`#restaurant_${restaurant.id} .restaurant-favourite`);

        if (favourite) {
            let addClass = Boolean(restaurant.is_favorite === 'true');
            const stagedAction = Array.isArray(stagedActions) && stagedActions.find(
                (ac) => ac.id === `${restaurant.id}`
            );

            if (stagedAction) addClass = stagedAction && stagedAction.status;

            favourite.classList.toggle('checked', addClass);
        }
    });
}

/**
 * Create restaurant HTML.
 */
const createRestaurantHTML = (restaurant) => {
    const li = document.createElement('li');
    li.className = "card";
    li.id = `restaurant_${restaurant.id}`;

    const imageUrl = DBHelper.imageUrlForRestaurant(restaurant);

    const picture = document.createElement('picture');

    const mediumSource = document.createElement('source');
    mediumSource.srcset = getResponsiveImageUrl(imageUrl, 'md');
    mediumSource.media = "(min-width: 400px)";
    picture.append(mediumSource);

    const largeSource = document.createElement('source')
    largeSource.srcset = getResponsiveImageUrl(imageUrl, 'lg');
    largeSource.media = "(min-width: 700px)";
    picture.append(largeSource);

    const image = document.createElement('img');
    image.className = 'restaurant-img';
    image.src = getResponsiveImageUrl(imageUrl, 'sm');
    image.alt =  `An image of ${restaurant.name}`;
    picture.append(image);

    li.append(picture);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'restaurant-content';
    li.append(contentDiv);

    const name = document.createElement('h2');
    name.innerHTML = restaurant.name;
    contentDiv.append(name);

    const neighborhood = document.createElement('p');
    neighborhood.innerHTML = restaurant.neighborhood;
    contentDiv.append(neighborhood);

    const address = document.createElement('p');
    address.innerHTML = restaurant.address;
    contentDiv.append(address);

    const more = document.createElement('a');
    more.innerHTML = 'View Details';
    more.href = DBHelper.urlForRestaurant(restaurant);
    contentDiv.append(more)

    const favourite = document.createElement('div');
    favourite.innerHTML = loveSVGFactory();
    favourite.className = 'restaurant-favourite';
    favourite.dataset.key = restaurant.id;
    contentDiv.append(favourite)

    if (restaurant.is_favorite === 'true') favourite.classList.add('checked');

    return li
}

/**
 * Add markers for current restaurants to the map.
 */
const addMarkersToMap = (restaurants = self.restaurants) => {
    restaurants.forEach(restaurant => {
        // Add marker to the map
        const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
        marker.on("click", onClick);

        function onClick() {
            window.location.href = marker.options.url;
        }
        self.markers.push(marker);
    });

}
