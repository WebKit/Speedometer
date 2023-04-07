/* eslint no-unused-vars: 0 */
/* eslint no-undef: 0 */
/* eslint prefer-template: 0 */
const uuid = function () {
    let uuid = "";
    for (let i = 0; i < 32; i++) {
        const random = (Math.random() * 16) | 0;
        if (i === 8 || i === 12 || i === 16 || i === 20)
            uuid += "-";
        uuid += (i === 12 ? 4 : i === 16 ? (random & 3) | 8 : random).toString(16);
    }
    return uuid;
};

const pluralize = function (count, word) {
    return count === 1 ? word : word + "s";
};
