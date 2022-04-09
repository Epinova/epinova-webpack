import React from 'react';
import ReactDOM from 'react-dom';

import DemoComponent from './features/DemoComponent/DemoComponent';

interface MyInterface {
    name: string;
    valid: boolean;
}

export function createSomething(name: string) {
    const something: MyInterface = {
        name,
        valid: true,
    };

    return something;
}

const container = document.createElement('div');

document.body.appendChild(container);

ReactDOM.render(
    React.createElement(DemoComponent, { heading: 'TypeScript' }),
    container
);
