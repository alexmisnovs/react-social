import React, { useState, useReducer } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Axios from "axios";
Axios.defaults.baseURL = "http://127.0.0.1:8080";
//Components
import Footer from "./components/Footer";
import Header from "./components/Header";
import HomeGuest from "./components/HomeGuest";
import Home from "./components/Home";
import About from "./components/About";
import Terms from "./components/Terms";
import CreatePost from "./components/CreatePost";
import ViewSinglePost from "./components/ViewSinglePost";
import FlashMessages from "./components/FlashMessages";

import StateContext from "./StateContext";
import DispatchContext from "./DispatchContext";

function Main() {
  // reducer
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("SocialAppToken")),
    flashMessages: []
  };

  function ourReducer(state, action) {
    switch (action.type) {
      case "login":
        return {
          loggedIn: true,
          flashMessages: state.flashMessages
        };
      case "logout":
        return {
          loggedIn: false,
          flashMessages: state.flashMessages
        };
      case "flashMessage":
        return {
          loggedIn: state.loggedIn,
          flashMessages: state.flashMessages.concat(action.value)
        };
    }
  }

  const [state, dispatch] = useReducer(ourReducer, initialState);

  function addFlashMessage(msg) {
    // push to the array, though without overriding state
    setFlashMessages(prev => prev.concat(msg));
  }

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <Header />

          <FlashMessages messages={state.flashMessages} />

          <Switch>
            <Route path="/" exact>
              {state.loggedIn ? <Home /> : <HomeGuest />}
            </Route>
            <Route path="/create-post">
              <CreatePost />
            </Route>
            <Route path="/post/:id">
              <ViewSinglePost />
            </Route>
            <Route path="/about-us">
              <About />
            </Route>
            <Route path="/terms">
              <Terms />
            </Route>
          </Switch>

          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

ReactDOM.render(<Main />, document.querySelector("#app"));

if (module.hot) {
  module.hot.accept();
}
