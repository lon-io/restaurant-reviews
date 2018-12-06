// Configuration object
export default {
    mapBoxApiKey: 'pk.eyJ1IjoibG9uaWxlc2FubWkiLCJhIjoiY2praWlsNjQxMHNpYzNxcGtiN25jZGw4ZiJ9.jOhoTyWS5qqPPFp2XbWpiw',
    ghPagesName: '/restaurant-reviews',
    db: {
        name: 'restaurant-reviews-db',
        stores: {
            GENERAL: {
                key: 'restaurant-reviews-store',
                indices: {},
            },
            // CONVERSION_FACTORS: {
            //     key: 'currency-converter-factors-store',
            //     indices: {
            //         by_created_date: {
            //             name: 'by-created-date',
            //             field: 'timestamp',
            //         },
            //     },
            // },
        },
        keys: {
            RESTAURANTS: 'RESTAURANTS',
            RESTAURANTS_REVIEWS: 'RESTAURANTS_REVIEWS',
            // LAST_CURRENCY_FROM_ID: 'LAST_CURRENCY_FROM_ID',
            // LAST_CURRENCY_TO_ID: 'LAST_CURRENCY_TO_ID',
        },
        version: 1,
    },
}
