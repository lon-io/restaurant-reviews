export const ratingSVGFactory = (rating) => `
    <svg
        height="25"
        width="23"
        class="star rating"
        data-rating="${rating}"
    >
        <polygon points="9.9, 1.1, 3.3, 21.78, 19.8, 8.58, 0, 8.58, 16.5, 21.78" style="fill-rule:nonzero;"/>
    </svg>
`;

export const loadingSVGFactory = () => `
    <svg
        x="0px"
        y="0px"
        viewBox="0 0 100 100" enable-background="new 0 0 0 0" xml:space="preserve"
    >
        <path fill="#fff" d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50">
            <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            dur="1s"
            from="0 50 50"
            to="360 50 50"
            repeatCount="indefinite" />
        </path>
    </svg>
`;

export const loveSVGFactory = () => `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 510 510">
        <path fill="#444" d="M255 489.6l-35.7-35.7C86.7 336.6 0 257.55 0 160.65 0 81.6 61.2 20.4 140.25 20.4c43.35 0 86.7 20.4 114.75 53.55C283.05 40.8 326.4 20.4 369.75 20.4 448.8 20.4 510 81.6 510 160.65c0 96.9-86.7 175.95-219.3 293.25L255 489.6z"/>
    </svg>
`;


// B23A48
// 8C2F39
