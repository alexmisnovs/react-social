import React, { useContext } from "react";
import { Link } from "react-router-dom";
import HeaderLoggedOut from "./HeaderLoggedOut";
import HeaderLoggedIn from "./HeaderLoggedIn";
import StateContext from "../StateContext";
import dotenv from "dotenv";
dotenv.config();

function Header(props) {
  // in use state we can provide initial value
  const appState = useContext(StateContext);
  const headerContent = appState.loggedIn ? <HeaderLoggedIn /> : <HeaderLoggedOut />;
  return (
    <header className="header-bar bg-primary mb-3">
      <div className="container d-flex flex-column flex-md-row align-items-center p-3">
        <h4 className="my-0 mr-md-auto font-weight-normal">
          <Link to="/" className="text-white">
            {process.env.APP_LOGO_TEXT ? process.env.APP_LOGO_TEXT : "Social App!"}
          </Link>
        </h4>
        {!props.staticEmpty ? headerContent : ""}
      </div>
    </header>
  );
}

export default Header;
