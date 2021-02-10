import React, { useRef, useEffect, useContext } from "react";
import { useImmerReducer } from "use-immer";
import { CSSTransition } from "react-transition-group";
import Page from "./Page";
import Axios from "axios";
import DispatchContext from "../DispatchContext";

function HomeGuest() {
  const usernameInput = useRef(null);
  const emailInput = useRef(null);
  const passwordInput = useRef(null);

  const appDispatch = useContext(DispatchContext);

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
      case "USERNAME_UNIQUE_RESULTS":
        if (action.value) {
          //username already exists
          draft.username.hasErrors = true;
          draft.username.isUnique = false;
          draft.username.message = "Username taken";
          usernameInput.current.classList.add("is-invalid");
        } else {
          usernameInput.current.classList.remove("is-invalid");
          usernameInput.current.classList.add("is-valid");
          draft.username.isUnique = true;
        }
        return;
      case "USERNAME_EMPTY_BLUR":
        draft.username.value = action.value;
        draft.username.hasErrors = true;
        draft.username.message = "username cannot be empty";
        usernameInput.current.classList.add("is-invalid");

        return;
      case "EMAIL_IMMEDIATELY":
        draft.email.hasErrors = false;
        draft.email.value = action.value;
        if (draft.email.value.length > 30) {
          draft.email.hasErrors = true;
          draft.email.message = "email can't be longer then 30 chars";
          // document.getElementById('email-register').setAttribute('maxlength',11);
          emailInput.current.setAttribute("maxlength", 30);
          emailInput.current.classList.add("is-invalid");
        }
        return;
      case "EMAIL_AFTER_DELAY":
        if (draft.email.value.length < 5) {
          draft.email.hasErrors = true;
          draft.email.message = "This is too short to be a valid email..";
          emailInput.current.classList.add("is-invalid");
        }
        if (!/^\S+@\S+$/.test(draft.email.value)) {
          draft.email.hasErrors = true;
          draft.email.message = "Please provide valid email..";

          emailInput.current.classList.add("is-invalid");
        }
        if (!draft.email.hasErrors && !action.noRequest) {
          draft.email.checkCount++;
          emailInput.current.classList.add("is-valid");
        }
        return;
      case "EMAIL_UNIQUE_RESULTS":
        if (action.value) {
          //email already exists
          draft.email.hasErrors = true;
          draft.email.isUnique = false;
          draft.email.message = "Email already taken";
          emailInput.current.classList.add("is-invalid");
        } else {
          emailInput.current.classList.remove("is-invalid");
          emailInput.current.classList.add("is-valid");
          draft.email.isUnique = true;
        }
        return;
      case "EMAIL_EMPTY_BLUR":
        draft.email.value = action.value;
        draft.email.hasErrors = true;
        draft.email.message = "email cannot be empty";
        emailInput.current.classList.add("is-invalid");

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
      case "PASSWORD_EMPTY_BLUR":
        draft.password.value = action.value;
        draft.password.hasErrors = true;
        draft.password.message = "Password cannot be empty";
        passwordInput.current.classList.add("is-invalid");

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
        if (!draft.username.hasErrors && draft.username.isUnique && !draft.email.hasErrors && draft.email.isUnique & !draft.password.hasErrors) {
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
  // watch for changes email
  useEffect(() => {
    if (state.email.value) {
      const delay = setTimeout(() => {
        dispatch({ type: "EMAIL_AFTER_DELAY" });
      }, 800);
      // cleanup function will also run next time this useEffect will run again.
      return () => clearTimeout(delay);
    }
  }, [state.email.value]);
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

  // check if username exists
  useEffect(() => {
    if (state.username.checkCount) {
      const ourRequest = Axios.CancelToken.source();
      // searching only the posts.
      async function checkUsernameExists() {
        try {
          const response = await Axios.post(`/doesUsernameExist`, { username: state.username.value }, { cancelToken: ourRequest.token });
          dispatch({ type: "USERNAME_UNIQUE_RESULTS", value: response.data });
        } catch (e) {
          console.log("There was a problem, with unique username checking");
        }
      }
      checkUsernameExists();
      // cleanup
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.username.checkCount]);

  //check if email exists
  useEffect(() => {
    if (state.email.checkCount) {
      const ourRequest = Axios.CancelToken.source();
      // searching only the posts.
      async function checkEmailExists() {
        try {
          const response = await Axios.post(`/doesEmailExist`, { email: state.email.value }, { cancelToken: ourRequest.token });
          dispatch({ type: "EMAIL_UNIQUE_RESULTS", value: response.data });
        } catch (e) {
          console.log("There was a problem, with unique email checking");
        }
      }
      checkEmailExists();
      // cleanup
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.email.checkCount]);

  useEffect(() => {
    if (state.submitCount) {
      const ourRequest = Axios.CancelToken.source();
      // searching only the posts.
      async function register() {
        try {
          const response = await Axios.post(`/register`, { username: state.username.value, email: state.email.value, password: state.password.value }, { cancelToken: ourRequest.token });
          appDispatch({ type: "LOGIN", data: response.data });
          appDispatch({ type: "FLASH_MESSAGE", value: "Congrats, welcome to your new account", status: "success" });
        } catch (e) {
          console.log("There was a problem, with registering the user");
        }
      }
      register();
      // cleanup
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.submitCount]);

  function handleSubmit(e) {
    e.preventDefault();
    dispatch({ type: "USERNAME_IMMEDIATELY", value: state.username.value });
    dispatch({ type: "USERNAME_AFTER_DELAY", value: state.username.value, noRequest: true });
    dispatch({ type: "EMAIL_IMMEDIATELY", value: state.email.value });
    dispatch({ type: "EMAIL_AFTER_DELAY", value: state.email.value, noRequest: true });
    dispatch({ type: "PASSWORD_IMMEDIATELY", value: state.password.value });
    dispatch({ type: "PASSWORD_AFTER_DELAY", value: state.password.value });
    dispatch({ type: "SUBMIT_FORM" });
  }

  return (
    <Page wide={true} title="Home">
      <div className="row align-items-center">
        <div className="col-lg-7 py-3 py-md-5">
          <h1 className="display-3">Remember Writing Me? Forget it bitch</h1>
          <p className="lead text-muted">Are you sick of short tweets and impersonal &ldquo;shared&rdquo; posts that are reminiscent of the late 90&rsquo;s email forwards? We believe getting back to actually writing is the key to enjoying the internet again.</p>
        </div>
        <div className="col-lg-5 pl-lg-5 pb-3 py-lg-5">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username-register" className="text-muted mb-1">
                <small>Username</small>
              </label>
              <input onBlur={e => (!e.target.value ? dispatch({ type: "USERNAME_EMPTY_BLUR" }) : "")} ref={usernameInput} onChange={e => dispatch({ type: "USERNAME_IMMEDIATELY", value: e.target.value })} id="username-register" name="username" className="form-control" type="text" placeholder="Pick a username" autoComplete="off" />
              <CSSTransition in={state.username.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                <div className="alert alert-danger small liveValidateMessage">{state.username.message}</div>
              </CSSTransition>
            </div>
            <div className="form-group">
              <label htmlFor="email-register" className="text-muted mb-1">
                <small>Email</small>
              </label>
              <input onBlur={e => (!e.target.value ? dispatch({ type: "EMAIL_EMPTY_BLUR" }) : "")} ref={emailInput} onChange={e => dispatch({ type: "EMAIL_IMMEDIATELY", value: e.target.value })} id="email-register" name="email" className="form-control" type="text" placeholder="you@example.com" autoComplete="off" />
              <CSSTransition in={state.email.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                <div className="alert alert-danger small liveValidateMessage">{state.email.message}</div>
              </CSSTransition>
            </div>
            <div className="form-group">
              <label htmlFor="password-register" className="text-muted mb-1">
                <small>Password</small>
              </label>
              <input onBlur={e => (!e.target.value ? dispatch({ type: "PASSWORD_EMPTY_BLUR" }) : "")} ref={passwordInput} onChange={e => dispatch({ type: "PASSWORD_IMMEDIATELY", value: e.target.value })} id="password-register" name="password" className="form-control" type="password" placeholder="Create a password" />
              <CSSTransition in={state.password.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                <div className="alert alert-danger small liveValidateMessage">{state.password.message}</div>
              </CSSTransition>
            </div>
            <button type="submit" className="py-3 mt-4 btn btn-lg btn-success btn-block">
              Sign up for ComplexApp
            </button>
          </form>
        </div>
      </div>
    </Page>
  );
}

export default HomeGuest;
