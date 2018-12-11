
# Udacity Mobile Web Specialist NanoDegree Certification Project

## Getting Started
The app is served by a Sails server which can be found here:
https://github.com/udacity/mws-restaurant-stage-3

### Prerequisites

#### NodeJS
The application requires that NodeJS is installed

#### Leaflet.js and Mapbox:

This repository uses [leafletjs](https://leafletjs.com/) with [Mapbox](https://www.mapbox.com/). You need to replace `<your MAPBOX API KEY HERE>` with a token from [Mapbox](https://www.mapbox.com/). Mapbox is free to use, and does not require any payment information.

#### Note about ES6
Most of the code in this project has been written to the ES6 JavaScript specification for compatibility with modern web browsers and future proofing JavaScript code. As much as possible, try to maintain use of ES6 in any additional JavaScript you write.


### Installing

Clone the project and from the project directory, run:

```
npm install
```

The to start the project, run:

```
npm start
```

The app should be available at:
```
localhost:8080
```

Note that the app expects the server to be running at http://localhost:1337, you can change this in the *DATABASE_URL* function of the `dbhelper.js` file

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
