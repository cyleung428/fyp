import * as React from 'react';
import { mergeStyles } from '@fluentui/react';
import { NavLink } from 'react-router-dom';

const sideBarStyles = mergeStyles({
    background: "#c34a36",
    width: "250px",
    height: "100vh",
    position: "sticky",
    top: "0"
})
const sideBarItemStyles = mergeStyles({
    textDecoration: 'none',
    color: "white",
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
            <NavLink to="/register" className={sideBarItemStyles} >
                <div className={textStyles}>Register</div>
            </NavLink>
            <NavLink to="/verify" className={sideBarItemStyles} >
                <div className={textStyles}>Verify voters</div>
            </NavLink>
            <NavLink to="/admin" className={sideBarItemStyles} >
                <div className={textStyles}>manage election</div>
            </NavLink>
            <NavLink to="/addCandidate" className={sideBarItemStyles} >
                <div className={textStyles}>Add candidate</div>
            </NavLink>
        </div>
    );
};
