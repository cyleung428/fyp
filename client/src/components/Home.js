import React, { } from "react";
import { mergeStyles } from '@fluentui/react'


const pageStyle = mergeStyles({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
});


function Home(props) {
  const { account } = props;
  return (
    <div className={pageStyle}>
          Welcome to Election Panel, {account}
    </div>
  );
}

export default Home;
