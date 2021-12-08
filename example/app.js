const logo = require('./assets/logo.png');
const image = require('./assets/image2.jpg');

const { createSomething } = require('./typescript');

console.log({ logo, image }, createSomething('Hello World'));
