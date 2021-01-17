import React, { useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import DispatchContext from "../DispatchContext";

function HeaderLoggedIn(props) {
  // curly brackets are because we are destructuring an object what is being returned by context
  const appDispatch = useContext(DispatchContext);

  function handleSignout() {
    appDispatch({ type: "logout" });
    localStorage.removeItem("SocialAppToken");
    localStorage.removeItem("SocialAppUsername");
    localStorage.removeItem("SocialAppAvatar");
  }

  return (
    <div className="flex-row my-3 my-md-0">
      <a href="#" className="text-white mr-2 header-search-icon">
        <i className="fas fa-search"></i>
      </a>
      <span className="mr-2 header-chat-icon text-white">
        <i className="fas fa-comment"></i>
        <span className="chat-count-badge text-white"> </span>
      </span>
      <a href="#" className="mr-2">
        <img className="small-header-avatar" src={localStorage.getItem("SocialAppAvatar")} />
      </a>
      <Link to="/create-post" className="btn btn-sm btn-success mr-2">
        Create Post
      </Link>

      <button onClick={handleSignout} className="btn btn-sm btn-secondary">
        Sign Out
      </button>
    </div>
  );
}

export default HeaderLoggedIn;
