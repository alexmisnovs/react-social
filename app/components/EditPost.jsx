import React, { useEffect, useState, useContext } from "react";
import { useImmerReducer } from "use-immer";
import { useParams, withRouter } from "react-router-dom";

import Axios from "axios";

// components
import LoadingIcon from "./LoadingIcon";
import Page from "./Page";
//Context
import DispatchContext from "../DispatchContext";
import StateContext from "../StateContext";

function EditPost(props) {
  // setting up reducer
  const originalState = {
    title: {
      value: "",
      hasErrors: false,
      message: ""
    },
    body: {
      value: "",
      hasErrors: false,
      message: ""
    },
    isFetching: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0
  };

  function ourReducer(draft, action) {
    switch (action.type) {
      case "FETCH_COMPLETE":
        draft.title.value = action.value.title;
        draft.body.value = action.value.body;
        draft.isFetching = false;
        return;
      case "TITLE_CHANGE":
        draft.title.hasErrors = false;
        draft.title.value = action.value;
        return;
      case "BODY_CHANGE":
        draft.body.hasErrors = false;
        draft.body.value = action.value;
        return;
      case "SUBMIT_REQUEST":
        if (!draft.title.hasErrors && !draft.body.hasErrors) {
          draft.sendCount++;
        }
        return;
      case "SAVE_REQUEST_STARTED":
        draft.isSaving = true;
        return;
      case "SAVE_REQUEST_FINISHED":
        draft.isSaving = false;
        return;
      case "TITLE_RULES":
        if (!action.value.trim()) {
          draft.title.hasErrors = true;
          draft.title.message = "You must provide a title";
        }
        return;
      case "BODY_RULES":
        if (!action.value.trim()) {
          draft.body.hasErrors = true;
          draft.body.message = "You must provide a Body";
        }
        return;
    }
  }
  const [state, dispatch] = useImmerReducer(ourReducer, originalState);
  // added the error
  const [notFoundError, setNotFoundError] = useState(false);

  const appDispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);

  // Fetch the Post on load
  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${state.id}`, { cancelToken: ourRequest.token });
        // Added a way to stop application breaking if post id is not found
        if (!response.data) {
          setNotFoundError(true);
        }
        dispatch({ type: "FETCH_COMPLETE", value: response.data });
      } catch (e) {
        console.log("There was a problem, with fetch in Edit Post");
      }
    }
    fetchPost();
    // cleanup
    return () => {
      ourRequest.cancel();
    };
  }, []);
  // Send post request
  useEffect(() => {
    if (state.sendCount > 0) {
      dispatch({ type: "SAVE_REQUEST_STARTED" });
      const ourRequest = Axios.CancelToken.source();
      async function updatePost() {
        try {
          const res = await Axios.post(
            `/post/${state.id}/edit`,
            {
              title: state.title.value,
              body: state.body.value,
              token: appState.user.token
            },
            { cancelToken: ourRequest.token }
          );
          dispatch({ type: "SAVE_REQUEST_FINISHED" });
          // redirect to new post url
          appDispatch({ type: "flashMessage", value: `Congrats, you have updated the post id ${state.id}` });
          props.history.push(`/post/${state.id}`);
        } catch (e) {
          console.log("Handle Update Post, somethings went wrong");
          // console.log(e.response.data);
        }
      }
      updatePost();
      // cleanup
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.sendCount]);

  if (notFoundError) {
    return (
      <Page title="Post Not Found.. ">
        <div>Post Not Found..</div>
      </Page>
    );
  }

  if (state.isFetching) {
    return (
      <Page title="Loading.. ">
        <LoadingIcon />
      </Page>
    );
  }

  async function handleUpdate(e) {
    e.preventDefault();
    dispatch({ type: "TITLE_RULES", value: state.title.value });
    dispatch({ type: "BODY_RULES", value: state.body.value });
    dispatch({ type: "SUBMIT_REQUEST" });
  }

  return (
    <Page title={`Edit : post.title`}>
      <form onSubmit={handleUpdate}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input
            onBlur={e => {
              dispatch({ type: "TITLE_RULES", value: e.target.value });
            }}
            onChange={e => dispatch({ type: "TITLE_CHANGE", value: e.target.value })}
            value={state.title.value}
            autoFocus
            name="title"
            id="post-title"
            className="form-control form-control-lg form-control-title"
            type="text"
            placeholder=""
            autoComplete="off"
          />
          {state.title.hasErrors ? <div className="alert alert-danger small liveValidateMessage"> {state.title.message} </div> : ""}
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea
            onBlur={e => {
              dispatch({ type: "BODY_RULES", value: e.target.value });
            }}
            onChange={e => dispatch({ type: "BODY_CHANGE", value: e.target.value })}
            value={state.body.value}
            name="body"
            id="post-body"
            className="body-content tall-textarea form-control"
            type="text"
          ></textarea>
          {state.body.hasErrors ? <div className="alert alert-danger small liveValidateMessage">{state.body.message}</div> : ""}
        </div>

        <button className="btn btn-primary" disabled={state.isSaving}>
          {state.isSaving ? "Updating.." : "Update Post"}
        </button>
      </form>
    </Page>
  );
}

export default withRouter(EditPost);
