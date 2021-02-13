import React from "react";
import { Link } from "react-router-dom";
import Page from "./Page";

function Unauthorized(props) {

    return (
      <Page title="Not Found.. ">
        <div className="text-center">
          <h2>Unauthorized..</h2>
          <p className="lead text-muted">Please use the form above login and view this page</p>
        </div>
      </Page>
    );
  
}

export default Unauthorized;
