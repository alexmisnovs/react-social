import React, { useRef, useEffect, useState, useContext } from "react";
import Axios from "axios";
import { useImmerReducer } from "use-immer";
import { CSSTransition } from "react-transition-group";
import DispatchContext from "../DispatchContext";

function HeaderLoggedOut(props) {
  const appDispatch = useContext(DispatchContext);

  const [username, setUsername] = useState();
  const [password, setPassword] = useState();

  async function handleSubmit(e) {
    e.preventDefault();

    dispatch({ type: "USERNAME_IMMEDIATELY", value: state.username.value });
    dispatch({ type: "USERNAME_AFTER_DELAY", value: state.username.value, noRequest: true });
    dispatch({ type: "PASSWORD_IMMEDIATELY", value: state.password.value });
    dispatch({ type: "PASSWORD_AFTER_DELAY", value: state.password.value });
    dispatch({ type: "SUBMIT_FORM" });
  }
  const usernameInput = useRef(null);
  const passwordInput = useRef(null);

  const initialState = {
    username: {
      value: "",
      hasErrors: false,
      message: "",
      isUnique: false,
      checkCount: 0
    },
    email: {
      value: "",
      hasErrors: false,
      message: "",
      isUnique: false,
      checkCount: 0
    },
    password: {
      value: "",
      hasErrors: false,
      message: ""
    },
    submitCount: 0
  };

  function ourReducer(draft, action) {
    switch (action.type) {
      case "USERNAME_IMMEDIATELY":
        draft.username.hasErrors = false;
        draft.username.value = action.value;
        if (draft.username.value.length > 11) {
          draft.username.hasErrors = true;
          draft.username.message = "Username can't be longer then 10 chars";

          // document.getElementById('username-register').setAttribute('maxlength',11);
          usernameInput.current.setAttribute("maxlength", 11);
          usernameInput.current.classList.add("is-invalid");
        }
        if (draft.username.value && !/^([a-zA-Z0-9]+)$/.test(draft.username.value)) {
          draft.username.hasErrors = true;
          draft.username.message = "Username can contain only letters and numbers";

          usernameInput.current.classList.add("is-invalid");
        }
        if (draft.username.isUnique && draft.username.value != "" && draft.username.value.length < 10 && draft.username.value.length > 2 && /^([a-zA-Z0-9]+)$/.test(draft.username.value)) {
          usernameInput.current.classList.remove("is-invalid");
          usernameInput.current.classList.add("is-valid");
        }
        return;
      case "USERNAME_AFTER_DELAY":
        // min chars..
        if (draft.username.value.length < 3) {
          draft.username.hasErrors = true;
          draft.username.message = "Username must be at least 3 chars";
          usernameInput.current.classList.add("is-invalid");
        }
        if (!draft.username.hasErrors && !action.noRequest) {
          usernameInput.current.classList.add("is-valid");
          draft.username.checkCount++;
        }
        return;

      case "PASSWORD_IMMEDIATELY":
        draft.password.hasErrors = false;
        draft.password.value = action.value;

        if (draft.password.value.length > 50) {
          draft.password.hasErrors = true;
          draft.password.message = "Password cannot exceed 50 characters";
          passwordInput.current.setAttribute("maxlength", 50);
          passwordInput.current.classList.add("is-invalid");
        }
        if (!draft.password.hasErrors) {
          passwordInput.current.classList.add("is-valid");
          draft.password.checkCount++;
        }

        return;
      case "PASSWORD_AFTER_DELAY":
        if (draft.password.value.length < 5) {
          draft.password.hasErrors = true;
          draft.password.message = "Password must be at least 5 characters";
          passwordInput.current.classList.add("is-invalid");
        }
        if (draft.password.value.length > 50) {
          draft.password.message = "Password cannot exceed 50 characters";
          passwordInput.current.classList.add("is-invalid");
        }
        if (!draft.password.hasErrors) {
          passwordInput.current.classList.remove("is-invalid");
          passwordInput.current.classList.add("is-valid");
          draft.password.checkCount++;
        }
        return;
      case "SUBMIT_FORM":
        if (!draft.username.hasErrors && !draft.password.hasErrors) {
          draft.submitCount++;
        }
        return;
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  // watch for changes username
  useEffect(() => {
    if (state.username.value) {
      const delay = setTimeout(() => {
        dispatch({ type: "USERNAME_AFTER_DELAY" });
      }, 800);
      // cleanup function will also run next time this useEffect will run again.
      return () => clearTimeout(delay);
    }
  }, [state.username.value]);
  // watch for changes password
  useEffect(() => {
    if (state.password.value) {
      const delay = setTimeout(() => {
        dispatch({ type: "PASSWORD_AFTER_DELAY" });
      }, 800);
      // cleanup function will also run next time this useEffect will run again.
      return () => clearTimeout(delay);
    }
  }, [state.password.value]);

  useEffect(() => {
    if (state.submitCount) {
      const ourRequest = Axios.CancelToken.source();
      // searching only the posts.
      async function login() {
        try {
          const response = await Axios.post(`/login`, { username: state.username.value, password: state.password.value }, { cancelToken: ourRequest.token });
          if (response.data) {
            //set loggedIn to true if obviously correct details
            appDispatch({ type: "LOGIN", data: response.data });
            appDispatch({ type: "FLASH_MESSAGE", value: "You have successfully logged in", status: "success" });
            // console.table(resposne.data);
          } else {
            console.log("Incorrect username / password");
            appDispatch({ type: "FLASH_MESSAGE", value: "Invalid username / password", status: "danger" });
          }
        } catch (e) {
          appDispatch({ type: "FLASH_MESSAGE", value: "We are sorry, we are experiencing technical issues", status: "danger" });
          console.log("There was a problem, with registering the user");
        }
      }
      login();
      // cleanup
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.submitCount]);

  return (
    <form onSubmit={handleSubmit} className="mb-0 pt-2 pt-md-0">
      <div className="row align-items-center">
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input ref={usernameInput} onChange={e => dispatch({ type: "USERNAME_IMMEDIATELY", value: e.target.value })} name="username" className="form-control form-control-sm input-dark" type="text" placeholder="Username" autoComplete="off" />
          <CSSTransition in={state.username.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
            <div className="alert alert-danger small liveValidateMessage">{state.username.message}</div>
          </CSSTransition>
        </div>
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input ref={passwordInput} onChange={e => dispatch({ type: "PASSWORD_IMMEDIATELY", value: e.target.value })} name="password" className="form-control form-control-sm input-dark" type="password" placeholder="Password" />
          <CSSTransition in={state.password.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
            <div className="alert alert-danger small liveValidateMessage">{state.password.message}</div>
          </CSSTransition>
        </div>
        <div className="col-md-auto">
          <button className="btn btn-success btn-sm">Sign In</button>
        </div>
      </div>
    </form>
  );
}

export default HeaderLoggedOut;
