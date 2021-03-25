import * as React from 'react';
import { mergeStyles } from '@fluentui/react';
import { NavLink } from 'react-router-dom';

const sideBarStyles = mergeStyles({
    width: "250px",
    height: "calc( 100vh - 80px )",
    position: "sticky",
    paddingTop: "80px",
    boxShadow: "0px 4px 25px 0px rgba(0, 0, 0, 0.15)",
})
const sideBarItemStyles = mergeStyles({
    textDecoration: 'none',
    fontWeight: "bold",
})

const textStyles = mergeStyles({
    padding: "16px 24px",
    margin: "4px 12px"
})

export const SideBar = () => {
    return (
        <div className={sideBarStyles}>
            <NavLink to="/" className={sideBarItemStyles} >
                <div className={textStyles}>Home</div>
            </NavLink>
            <NavLink to="/vote" className={sideBarItemStyles} >
                <div className={textStyles}>Vote</div>
            </NavLink>
            <NavLink to="/result" className={sideBarItemStyles} >
                <div className={textStyles}>Result</div>
            </NavLink>
        </div>
    );
};
