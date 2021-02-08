import React, { useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import ReactToolTip from "react-tooltip";
import DispatchContext from "../DispatchContext";
import StateContext from "../StateContext";

function HeaderLoggedIn(props) {
  // curly brackets are because we are destructuring an object what is being returned by context
  const appDispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);

  function handleSignout() {
    appDispatch({ type: "LOGOUT" });
  }
  function handleSearchIcon(e) {
    e.preventDefault();
    appDispatch({ type: "OPEN_SEARCH" });
  }
  function handleChatIcon() {
    appDispatch({ type: "TOGGLE_CHAT" });
  }

  return (
    <div className="flex-row my-3 my-md-0">
      <a data-tip="Search" data-for="searchButton" onClick={handleSearchIcon} href="#" className="text-white mr-2 header-search-icon">
        <i className="fas fa-search"></i>
      </a>
      <ReactToolTip place="bottom" id="searchButton" className="custom-tooltip" />{" "}
      <span onClick={handleChatIcon} data-tip="Chat" data-for="chatButton" className={"mr-2 header-chat-icon " + (appState.unreadChatCount ? "text-danger" : "text-white")}>
        <i className="fas fa-comment"></i>
        {appState.unreadChatCount ? <span className="chat-count-badge text-white">{appState.unreadChatCount < 10 ? appState.unreadChatCount : "9+"} </span> : ""}
      </span>
      <ReactToolTip place="bottom" id="chatButton" className="custom-tooltip" />{" "}
      <Link data-tip="My Profile" data-for="profileButton" to={`/profile/${appState.user.username}`} className="mr-2">
        <img className="small-header-avatar" src={appState.user.avatar} />
      </Link>
      <ReactToolTip place="bottom" id="profileButton" className="custom-tooltip" />{" "}
      <Link to="/create-post" className="btn btn-sm btn-success mr-2">
        Create Post
      </Link>{" "}
      <button onClick={handleSignout} className="btn btn-sm btn-secondary">
        Sign Out
      </button>
    </div>
  );
}

export default HeaderLoggedIn;
