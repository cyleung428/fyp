import * as React from 'react';
import { Nav } from 'office-ui-fabric-react/lib/Nav';

const navStyles = { root: { width: 300 } };

const navLinkGroups = [
    {
        links: [
            {
                key: 'Home',
                name: 'Home',
                url: '/',
            },
            {
                key: 'Register voter',
                name: 'Register voter',
                url: '/register',
            },
            {
                key: 'Button',
                name: 'Button',
                url: '#/examples/button',
            },
        ],
    },
];

export const NavBar = () => {
    return (
        <Nav styles={navStyles} ariaLabel="Nav example similiar to one found in this demo page" groups={navLinkGroups} />
    );
};
