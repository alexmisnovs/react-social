import React, { useEffect, Suspense } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import Axios from "axios";
import { useImmerReducer } from "use-immer";

Axios.defaults.baseURL = process.env.BACKENDURL || "https://rsbackendapi.herokuapp.com";
//Components
import Footer from "./components/Footer";
import Header from "./components/Header";
import HomeGuest from "./components/HomeGuest";
import Home from "./components/Home";
import About from "./components/About";
import Terms from "./components/Terms";
// import CreatePost from "./components/CreatePost";
const CreatePost = React.lazy(() => import("./components/CreatePost"));
const ViewSinglePost = React.lazy(() => import("./components/ViewSinglePost"));
// import ViewSinglePost from "./components/ViewSinglePost";
import FlashMessages from "./components/FlashMessages";
import Profile from "./components/Profile";
import EditPost from "./components/EditPost";
import NotFound from "./components/NotFound";
// import Search from "./components/Search";
const Search = React.lazy(() => import("./components/Search"));
const Chat = React.lazy(() => import("./components/Chat"));
// import Chat from "./components/Chat";
import Unauthorized from "./components/Unauthorized";
import LoadingIcon from "./components/LoadingIcon";

//State Contexts
import StateContext from "./StateContext";
import DispatchContext from "./DispatchContext";

function Main() {
  // reducer
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("SocialAppToken")),
    flashMessages: [],
    flashMessageStatus: "",
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
        draft.user = {
          token: "",
          username: "",
          avatar: ""
        };

        return;
      case "FLASH_MESSAGE":
        // using push instaed of concat because immer gives us a copy of the state
        draft.flashMessages.push(action.value);
        draft.flashMessageStatus = action.status;
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
      case "CLEAR_SEEN_FLASH_MESSAGES":
        draft.flashMessages = [];
        draft.flashMessageStatus = "";
        return;
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  React.useEffect(() => {
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

  //cleanup Displayed Flash Messages?
  useEffect(() => {
    if (state.flashMessages.length > 0) {
      const delay = setTimeout(() => {
        dispatch({ type: "CLEAR_SEEN_FLASH_MESSAGES" });
      }, 5000);
      // cleanup function will also run next time this useEffect will run again.
      return () => clearTimeout(delay);
    }
  }, [state.flashMessages.length]);

  // check if Token has expired or not on first render
  useEffect(() => {
    if (state.loggedIn) {
      const ourRequest = Axios.CancelToken.source();
      // searching only the posts.
      async function checkToken() {
        try {
          const response = await Axios.post(`/checkToken`, { token: state.user.token }, { cancelToken: ourRequest.token });
          // only if we get FALSE from the server
          if (!response.data) {
            dispatch({ type: "LOGOUT" });
            dispatch({ type: "FLASH_MESSAGE", value: "Your session expired, please login", status: "warning" });
          }
          // setIsLoading(false);
        } catch (e) {
          console.log("There was a problem, with check token Request");
        }
      }
      checkToken();
      // cleanup
      return () => {
        ourRequest.cancel();
      };
    }
  }, []);

  // Make some routes auth protected?
  function PrivateRoute({ children, ...rest }) {
    let user = state.user.username;
    return (
      <Route
        {...rest}
        render={({ location }) =>
          user ? (
            children
          ) : (
            <Redirect
              to={{
                pathname: "/unauthorized",
                state: { from: location }
              }}
            />
          )
        }
      />
    );
  }
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <Header />

          <FlashMessages messages={state.flashMessages} status={state.flashMessageStatus} />
          <Suspense fallback={<LoadingIcon />}>
            <Switch>
              <Route path="/" exact>
                {state.loggedIn ? <Home /> : <HomeGuest />}
              </Route>
              <PrivateRoute path="/create-post">
                <CreatePost />
              </PrivateRoute>
              <Route path="/profile/:username">
                <Profile />
              </Route>
              <Route path="/post/:id" exact>
                <ViewSinglePost />
              </Route>
              <PrivateRoute path="/post/:id/edit" exact>
                <EditPost />
              </PrivateRoute>
              <Route path="/about-us">
                <About />
              </Route>
              <Route path="/terms">
                <Terms />
              </Route>
              <Route path="/unauthorized">
                <Unauthorized />
              </Route>
              <Route>
                <NotFound />
              </Route>
            </Switch>
          </Suspense>
          <CSSTransition timeout={330} in={state.isSearchOpen} classNames="search-overlay" unmountOnExit>
            <div className="search-overlay">
              <Suspense fallback="">
                <Search />
              </Suspense>
            </div>
          </CSSTransition>
          <Suspense fallback="">{state.loggedIn && <Chat />}</Suspense>

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
