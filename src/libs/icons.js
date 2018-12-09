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