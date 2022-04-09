import React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';

import DemoComponent from '../DemoComponent/DemoComponent';

declare global {
    var Components: { [key: string]: React.ElementType };
}

global.React = React;
global.ReactDOM = ReactDOM;
global.ReactDOMServer = ReactDOMServer;

global.Components = {
    DemoComponent,
};
