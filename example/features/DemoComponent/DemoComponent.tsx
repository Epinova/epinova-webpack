import { useState } from 'react';

interface IDemoComponent {
    heading: string;
}

const DemoComponent = (props: IDemoComponent) => {
    const [active, setActive] = useState(false);

    return (
        <div>
            <h1>{props.heading}</h1>
            <p>{active ? 'active' : 'not active'}</p>
            <button onClick={() => setActive(!active)} type="button">
                toggle active
            </button>
        </div>
    );
};

export default DemoComponent;
