import React, { useState, useReducer, useEffect } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
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
import EditPost from "./components/EditPost";
import NotFound from "./components/NotFound";
import Search from "./components/Search";
import Chat from "./components/Chat";
//State Contexts
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
    },
    isSearchOpen: false,
    isChatOpen: false,
    unreadChatCount: 0
  };

  function ourReducer(draft, action) {
    switch (action.type) {
      case "LOGIN":
        draft.loggedIn = true;
        draft.user = action.data;
        return;
      case "LOGOUT":
        draft.loggedIn = false;
        return;
      case "FLASH_MESSAGE":
        // using push instaed of concat because immer gives us a copy of the state
        draft.flashMessages.push(action.value);
        return;
      case "OPEN_SEARCH":
        draft.isSearchOpen = true;
        return;
      case "CLOSE_SEARCH":
        draft.isSearchOpen = false;
        return;
      case "CLOSE_CHAT":
        draft.isChatOpen = false;
        return;
      case "TOGGLE_CHAT":
        draft.isChatOpen = !draft.isChatOpen;
        return;
      case "INCREMENT_UNREAD_MESSAGE_COUNT":
        draft.unreadChatCount++;
        return;
      case "CLEAR_UNREAD_CHAT_COUNT":
        draft.unreadChatCount = 0;
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
      // need to refresh the page otherwise can still access stuff after logout
      dispatch({ type: "LOGOUT" });
    }
  }, [state.loggedIn]);

  // custom added to be able to use cmd + F functionality on the site.
  function searchKeyPressHandler(e) {
    if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) && e.keyCode == 70) {
      e.preventDefault();
      // Process the event here
      dispatch({ type: "OPEN_SEARCH" });
    }
  }
  useEffect(() => {
    document.addEventListener("keydown", searchKeyPressHandler);
    return () => {
      document.removeEventListener("keydown", searchKeyPressHandler);
    };
  }, []);

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
            <Route path="/post/:id" exact>
              <ViewSinglePost />
            </Route>
            <Route path="/post/:id/edit" exact>
              <EditPost />
            </Route>
            <Route path="/about-us">
              <About />
            </Route>
            <Route path="/terms">
              <Terms />
            </Route>
            <Route>
              <NotFound />
            </Route>
          </Switch>
          <CSSTransition timeout={330} in={state.isSearchOpen} classNames="search-overlay" unmountOnExit>
            <Search />
          </CSSTransition>
          <Chat />
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
