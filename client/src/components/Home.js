import React, { } from "react";

function Home(props) {
  const { account, isAdmin } = props;
  return (
    <div>
      <div>
        Home
      <div>
          Your address is {account}
        </div>
      </div>

    </div>
  );
}

export default Home;
