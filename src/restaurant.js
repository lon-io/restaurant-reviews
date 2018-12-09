import config from './config';
import DBHelper from './libs/dbhelper';
import {
    formatDate,
    getResponsiveImageUrl,
    scrollToElementBottom,
    setElementVisibility,
} from './libs/utils';
import {
    ratingSVGFactory,
    loadingSVGFactory,
} from './libs/icons';
import {
    registerServiceWorker,
} from './libs/swhelper';

let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
    registerServiceWorker();
    initMap();
});

/**
 * Initialize leaflet map
 */
const initMap = () => {
    fetchRestaurantFromURL((error, restaurant) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.newMap = L.map('map', {
                center: [restaurant.latlng.lat, restaurant.latlng.lng],
                zoom: 16,
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
            fillBreadcrumb();
            DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
        }
    });
}

/**
 * Get current restaurant from page URL.
 */
const fetchRestaurantFromURL = (callback) => {
    if (self.restaurant) { // restaurant already fetched!
        callback(null, self.restaurant)
        return;
    }
    const id = getParameterByName('id');
    if (!id) { // no id found in URL
        error = 'No restaurant id in URL'
        callback(error, null);
    } else {
        DBHelper.fetchRestaurantById(id, (error, restaurant) => {
            self.restaurant = restaurant;
            if (!restaurant) {
                console.error(error);
                return;
            }
            fillRestaurantHTML();
            callback(null, restaurant)
        });
    }
}

const fetchReviewsFromURL = () => {
    const id = getParameterByName('id');
    if (!id) { // no id found in URL
        error = 'No restaurant id in URL'
    } else {
        DBHelper.fetchRestaurantReviewsById(id, (error, reviews) => {
            self.reviews = reviews;
            if (!reviews) {
                console.error(error);
                return;
            }

            fillReviewsContentHTML();
        });
    }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
const fillRestaurantHTML = (restaurant = self.restaurant) => {
    const name = document.getElementById('restaurant-name');
    name.innerHTML = restaurant.name;

    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;

    const imageUrl = DBHelper.imageUrlForRestaurant(restaurant);

    const picture = document.getElementById('restaurant-picture');

    const mediumSource = document.createElement('source');
    mediumSource.srcset = getResponsiveImageUrl(imageUrl, 'md');
    mediumSource.media = "(min-width: 400px)";
    picture.append(mediumSource);

    const largeSource = document.createElement('source');
    largeSource.srcset = getResponsiveImageUrl(imageUrl, 'lg');
    largeSource.media = "(min-width: 700px)";
    picture.append(largeSource);

    const image = document.createElement('img');
    image.className = 'restaurant-img';
    image.src = getResponsiveImageUrl(imageUrl, 'sm');
    image.alt = restaurant.name;
    picture.append(image);

    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;

    // fill operating hours
    if (restaurant.operating_hours) {
        fillRestaurantHoursHTML();
    }

    // fill reviews
    fillReviewsHeaderHTML();
    fetchReviewsFromURL();
    fillReviewFormLoader();
    fillReviewFormRatingBar();
    addFormSubmissionHandler();
    listenForNetworkChanges();
}

const fillReviewFormLoader = () => {
    const reviewLoaderWrapper = document.getElementById('review-loader-container');
    reviewLoaderWrapper.innerHTML = loadingSVGFactory();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
const fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
    const hours = document.getElementById('restaurant-hours');
    for (let key in operatingHours) {
        const row = document.createElement('tr');

        const day = document.createElement('td');
        day.innerHTML = key;
        row.appendChild(day);

        const time = document.createElement('td');
        time.innerHTML = operatingHours[key];
        row.appendChild(time);

        hours.appendChild(row);
    }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
const fillReviewsHeaderHTML = () => {
    const container = document.getElementById('reviews-container');

    const title = document.createElement('h2');
    title.innerHTML = 'Reviews';
    container.appendChild(title);
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
const fillReviewsContentHTML = () => {
    const reviews = self.reviews;
    const container = document.getElementById('reviews-container');

    if (!reviews) {
        const noReviews = document.createElement('p');
        noReviews.innerHTML = 'No reviews yet!';
        container.appendChild(noReviews);
        return;
    }
    const ul = document.getElementById('reviews-list');

    // Clear reviews
    ul.innerHTML = '';
    console.log('3', reviews);
    reviews.forEach(review => {
        ul.appendChild(createReviewHTML(review));
    });
    container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
const createReviewHTML = (review) => {
    const li = document.createElement('li');
    const name = document.createElement('h3');
    name.innerHTML = review.name;
    li.appendChild(name);

    const date = document.createElement('p');
    date.innerHTML = formatDate(new Date(review.updatedAt))
    li.appendChild(date);

    const rating = document.createElement('div');
    const ratingBar = document.createElement('div');
    const ratingSpan = document.createElement('span');
    const stars = new Array(5).fill('').map((_, i) => ratingSVGFactory(i + 1));

    ratingBar.classList.add('review-rating-bar');
    ratingBar.classList.add('stars');
    ratingBar.dataset.stars = review.rating;

    ratingSpan.innerHTML = 'Rating: ';
    ratingBar.innerHTML = stars.join('\n');
    rating.appendChild(ratingBar);
    li.appendChild(rating);

    const comments = document.createElement('p');
    comments.innerHTML = review.comments;
    li.appendChild(comments);

    return li;
}

const clearReviewForm = () => {
    const reviewFormWrapper = document.getElementById('review-form');

    if (reviewFormWrapper) {
        const inputs = reviewFormWrapper.querySelectorAll('input');
        Array.from(inputs).forEach((el) => {
            if (el) el.value = '';
        });

        const commentBox = reviewFormWrapper.querySelector('textarea');
        if (commentBox) commentBox.value = '';

        const reviewRatingWrapper = document.getElementById('review-stars');
        if (reviewRatingWrapper) {
            delete reviewRatingWrapper.dataset.stars;
        }
    }
}

const fillReviewFormRatingBar = () => {
    const reviewRatingWrapper = document.getElementById('review-stars');
    reviewRatingWrapper.innerHTML = '';

    const stars = new Array(5).fill('').map((_, i) => ratingSVGFactory(i + 1));
    reviewRatingWrapper.innerHTML = stars.join('\n');

    addRatingBarClickHandler();
}

const addRatingBarClickHandler = () => {
    window.addEventListener('click', (event) => {
        const target = event.target;
        const star = target.closest('.star.rating');

        if (star) {
            const parent = star.parentNode;
            parent.dataset.stars = star.dataset.rating;
            document.getElementById('ratingBar').value=star.dataset.rating;
        }
    });
}

const addFormSubmissionHandler = () => {
    window.addEventListener('submit', (event) => {
        event.preventDefault();
        const target = event.target;

        if (target.matches("#review-form")) {
            const form = target;
            const formData = new FormData(form);

            const id = getParameterByName('id');
            const name = formData.get('name');
            const rating = formData.get('rating');
            const comments = formData.get('review');

            const postData = {
                restaurant_id: id,
                name,
                rating,
                comments,
            };

            setElementVisibility('#review-loader-container', false);
            DBHelper.submitReview(postData).then(() => {
                fetchReviewsFromURL();
                scrollToElementBottom(document.getElementById('reviews-container'));
                setElementVisibility('#review-loader-container', true);
                clearReviewForm();
            });
        }
    });
}

const listenForNetworkChanges = () => {
    window.addEventListener('online', () => {
        DBHelper.syncStagedReviews();
        setElementVisibility('#offline-warning', true);
    });

    window.addEventListener('offline', () => {
        setElementVisibility('#offline-warning', false);
    });
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
const fillBreadcrumb = (restaurant = self.restaurant) => {
    const breadcrumb = document.getElementById('breadcrumb');
    const li = document.createElement('li');
    li.innerHTML = restaurant.name;
    breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
const getParameterByName = (name, url) => {
    if (!url)
        url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
        results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
