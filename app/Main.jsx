import React, { useState, useReducer, useEffect } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Axios from "axios";
import { useImmerReducer } from "use-immer";

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
import Profile from "./components/Profile";

import StateContext from "./StateContext";
import DispatchContext from "./DispatchContext";

function Main() {
  // reducer
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("SocialAppToken")),
    flashMessages: [],
    user: {
      token: localStorage.getItem("SocialAppToken"),
      username: localStorage.getItem("SocialAppUsername"),
      avatar: localStorage.getItem("SocialAppAvatar")
    }
  };

  function ourReducer(draft, action) {
    switch (action.type) {
      case "login":
        draft.loggedIn = true;
        draft.user = action.data;
        return;
      case "logout":
        draft.loggedIn = false;
        return;
      case "flashMessage":
        // using push instaed of concat because immer gives us a copy of the state
        draft.flashMessages.push(action.value);
        return;
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("SocialAppToken", state.user.token);
      localStorage.setItem("SocialAppUsername", state.user.username);
      localStorage.setItem("SocialAppAvatar", state.user.avatar);
    } else {
      localStorage.removeItem("SocialAppToken");
      localStorage.removeItem("SocialAppUsername");
      localStorage.removeItem("SocialAppAvatar");
    }
  }, [state.loggedIn]);

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
            <Route path="/profile/:username">
              <Profile />
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
