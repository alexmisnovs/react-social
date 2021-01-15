import React, { useState } from "react";
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

function Main() {
  //STATE
  const [loggedIn, setLoggedIn] = useState(Boolean(localStorage.getItem("SocialAppToken")));
  const [flashMessages, setFlashMessages] = useState([]);

  function addFlashMessage(msg) {
    // push to the array, though without overriding state
    setFlashMessages(prev => prev.concat(msg));
  }

  return (
    <BrowserRouter>
      <Header loggedIn={loggedIn} setLoggedIn={setLoggedIn} />

      <FlashMessages messages={flashMessages} />

      <Switch>
        <Route path="/" exact>
          {loggedIn ? <Home /> : <HomeGuest />}
        </Route>
        <Route path="/create-post">
          <CreatePost addFlashMessages={addFlashMessage} />
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
  );
}

ReactDOM.render(<Main />, document.querySelector("#app"));

if (module.hot) {
  module.hot.accept();
}
