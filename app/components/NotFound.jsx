import React from "react";
import { Link } from "react-router-dom";
import Page from "./Page";

function NotFound(props) {
  if (props.type == "post") {
    return (
      <Page title="Post Not Found.. ">
        <div className="text-center">
          <h2>Whoops, we cannot find this Post</h2>
          <p className="lead text-muted">
            You can always visit our <Link to="/">homepage</Link>
          </p>
        </div>
      </Page>
    );
  }
  if (props.type == "profile") {
    return (
      <Page title="Profile Not Found.. ">
        <div className="text-center">
          <h2>Whoops, we cannot find this profile</h2>
          <p className="lead text-muted">
            You can always visit our <Link to="/">homepage</Link>
          </p>
        </div>
      </Page>
    );
  } 
else {
    return (
      <Page title="Not Found.. ">
        <div className="text-center">
          <h2>Whoops..</h2>
          <p className="lead text-muted">Sorry, we cannot find what you are looking for..</p>
          <p className="lead text-muted">
            You can always visit our <Link to="/">Homepage</Link>!
          </p>
        </div>
      </Page>
    );
  }
}

export default NotFound;
