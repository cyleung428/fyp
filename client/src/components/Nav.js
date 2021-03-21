import React from 'react'
import { mergeStyles } from "@fluentui/react";

const menuStyles = mergeStyles({
    width: '100%',
    height: '80px',
    position: 'fixed',
    paddingLeft: '40px',
    zIndex: 99999,
    background: 'white',
    boxShadow: "0px 4px 25px 0px rgba(0, 0, 0, 0.15)",
    display: 'flex'
});

const titleStyle = mergeStyles({
    marginTop: "20px",
    marginLeft: "0px",
    fontSize: '1.7em',
    fontWeight: '300',
    color: "#9f00e9"
});

export const Nav = () => {
    return (
        <header className={menuStyles}>
            <span className={titleStyle}>Election Page</span>
        </header>
    )
}
