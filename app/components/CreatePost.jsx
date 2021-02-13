import React, { useEffect, useRef, useContext } from "react";
import { useImmerReducer } from "use-immer";
import Page from "./Page";
import Axios from "axios";
import { withRouter } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import DispatchContext from "../DispatchContext";
import StateContext from "../StateContext";

function CreatePost(props) {
  const titleInput = useRef(null);
  const bodyInput = useRef(null);

  const initialState = {
    title: {
      value: "",
      hasErrors: false,
      message: "",
    },
    body: {
      value: "",
      hasErrors: false,
      message: "",
    },
    submitCount: 0
  };

  function ourReducer(draft, action) {
    switch (action.type) {
      
      case "UPDATE_TITLE" :
        draft.title.value = action.value;
      return;
      case "UPDATE_BODY" :
        draft.body.value = action.value;
      return;
      case "UPDATE_TITLE" :
        draft.title.value = action.value;
      return;
      // Validation
      case "TITLE_AFTER_DELAY":
        // min chars..
        console.log(draft.title.value)
        if (draft.title.value.length < 3) {
          
          draft.title.hasErrors = true;
          draft.title.message = "Title must be at least 3 chars";
          titleInput.current.classList.add("is-invalid");
        }
        else{
          draft.title.hasErrors = false;
          titleInput.current.classList.remove("is-invalid");
        }
        if (!draft.title.hasErrors) {
          titleInput.current.classList.add("is-valid");
        }
        return;
      case "TITLE_EMPTY_BLUR":
        
        draft.title.hasErrors = true;
        draft.title.message = "Title cannot be empty";
        titleInput.current.classList.add("is-invalid");

        return;
        //body
      case "BODY_AFTER_DELAY":
        if (draft.body.value.length < 3) {
          draft.body.hasErrors = true;
          draft.body.message = "This is too short to be a valid body..";
          bodyInput.current.classList.add("is-invalid");
        }
        else{
          draft.body.hasErrors = false;
          bodyInput.current.classList.remove("is-invalid");
        }
        if (!draft.body.hasErrors) {
          bodyInput.current.classList.add("is-valid");
        }
        return;
      case "BODY_EMPTY_BLUR":
          draft.body.hasErrors = true;
          draft.body.message = "Body cannot be empty";
          bodyInput.current.classList.add("is-invalid");
        return;
      
      case "SUBMIT_FORM":
        if (!draft.title.hasErrors && !draft.body.hasErrors) {
          draft.submitCount++;
        }
        return;
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  const appDispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);

  async function handleSubmit(e) {
    // should we validate here? nah
    e.preventDefault();
    dispatch({ type: "TITLE_AFTER_DELAY", value: state.title.value });
    dispatch({ type: "BODY_AFTER_DELAY", value: state.body.value });
    dispatch({ type: "SUBMIT_FORM" });
  }
  // create post 
  useEffect(() => {
    if (state.submitCount) {
      const ourRequest = Axios.CancelToken.source();
      // searching only the posts.
      async function createPost() {
        try {
          const res = await Axios.post("/create-post", { title: state.title.value, body: state.body.value, token: appState.user.token });
          console.log(`New post created: ${res.data}`);
          // redirect to new post url
          appDispatch({ type: "FLASH_MESSAGE", value: "Congrats, you've created a new post", status: "dark" });
          props.history.push(`/post/${res.data}`);
        } catch (e) {
          console.log("Something wrong with adding new post");
          // console.log(e.response.data);
        }
      }
      createPost();
      // cleanup
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.submitCount]);

    // watch for changes username
    useEffect(() => {
      if (state.title.value) {
        const delay = setTimeout(() => {
          dispatch({ type: "TITLE_AFTER_DELAY" });
        }, 800);
        // cleanup function will also run next time this useEffect will run again.
        return () => clearTimeout(delay);
      }
    }, [state.title.value]);
    // watch for changes email
    useEffect(() => {
      if (state.body.value) {
        const delay = setTimeout(() => {
          dispatch({ type: "BODY_AFTER_DELAY" });
        }, 800);
        // cleanup function will also run next time this useEffect will run again.
        return () => clearTimeout(delay);
      }
    }, [state.body.value]);
// if not logged in? is there a better way to do it maybe in main?
  // useEffect(() => {
  //   if(!appState.loggedIn){
  //       props.history.push('/');
  //   }
   
  // }, [appState.loggedIn])
  return (
    <Page title="Create New Post">
      <form>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input ref={titleInput} onBlur={e => (!e.target.value ? dispatch({ type: "TITLE_EMPTY_BLUR" }) : "")}  onChange={e => dispatch({ type: "UPDATE_TITLE" , value: e.target.value})}  autoFocus name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" placeholder="" autoComplete="off" />
          <CSSTransition in={state.title.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                <div className="alert alert-danger small liveValidateMessage">{state.title.message}</div>
              </CSSTransition>
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea onBlur={e => (!e.target.value ? dispatch({ type: "BODY_EMPTY_BLUR" }) : "")}  ref={bodyInput} onChange={e => dispatch({ type: "UPDATE_BODY" , value: e.target.value})} name="body" id="post-body" className="body-content tall-textarea form-control" type="text"></textarea>
          <CSSTransition in={state.body.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                <div className="alert alert-danger small liveValidateMessage">{state.body.message}</div>
              </CSSTransition>
        </div>

        <button onClick={handleSubmit} className="btn btn-primary">
          Save New Post
        </button>
      </form>
    </Page>
  );
}

export default withRouter(CreatePost);
