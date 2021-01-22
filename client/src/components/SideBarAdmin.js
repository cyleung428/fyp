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

export const SideBarAdmin = () => {
    return (
        <div className={sideBarStyles}>
            <NavLink to="/" className={sideBarItemStyles} >
                <div className={textStyles}>Home</div>
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
