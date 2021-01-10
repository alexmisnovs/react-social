import React, { useEffect } from "react";

function Container(props) {
  return (
    <div className={"container py-md-5 " + (props.wide ? "" : "container--narrow")}>
      {/* "container container--narrow py-md-5" */}
      {/* Children will pass all of the html tags to Component */}
      {props.children}
    </div>
  );
}

export default Container;
