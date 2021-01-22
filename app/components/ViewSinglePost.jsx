import React, { useEffect, useState, useContext } from "react";
import { useParams, Link, withRouter } from "react-router-dom";
import Page from "./Page";
import Axios from "axios";
import ReactMarkdown from "react-markdown";
import ReactToolTip from "react-tooltip";

// components
import LoadingIcon from "./LoadingIcon";
import NotFound from "./NotFound";

// Context
import DispatchContext from "../DispatchContext";
import StateContext from "../StateContext";

function ViewSinglePost(props) {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState();
  // added the error
  const [notFoundError, setNotFoundError] = useState(false);
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${id}`, { cancelToken: ourRequest.token });
        // Added a way to stop application breaking if post id is not found
        if (!response.data) {
          setNotFoundError(true);
        }
        setPost(response.data);
        setIsLoading(false);
      } catch (e) {
        console.log("There was a problem, with View Signle Post Request");
      }
    }
    fetchPost();
    // cleanup
    return () => {
      ourRequest.cancel();
    };
  }, []);

  if (notFoundError) {
    return <NotFound type="post" />;
  }

  if (isLoading) {
    return (
      <Page title="Loading.. ">
        <LoadingIcon />
      </Page>
    );
  }

  const date = new Date(post.createdDate);
  const dateFormatted = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

  async function deleteHandler() {
    const areYouSure = window.confirm("Do you really want to delete this link?");
    if (areYouSure) {
      try {
        const response = await Axios.delete(`/post/${id}`, { data: { token: appState.user.token } });
        // server returns a string..
        if (response.data == "Success") {
          // display a flash message
          appDispatch({ type: "flashMessage", value: `Post "${post.title}" deleted..` });

          //redirect
          props.history.push(`/profile/${appState.user.username}`);
        }
      } catch (e) {
        console.log("problem deleting");
      }
    }
  }

  return (
    <Page title={post.title}>
      <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>
        {appState.user.username == post.author.username && (
          <span className="pt-2">
            <Link to={`/post/${post._id}/edit`} data-tip="Edit Post" data-for="editButton" className="text-primary mr-2">
              <i className="fas fa-edit"></i>
            </Link>
            <ReactToolTip id="editButton" className="custom-tooltip" />{" "}
            <a onClick={deleteHandler} data-tip="Delete Post" data-for="deleteButton" className="delete-post-button text-danger">
              <i className="fas fa-trash"></i>
            </a>
            <ReactToolTip id="deleteButton" className="custom-tooltip" />
          </span>
        )}
      </div>

      <p className="text-muted small mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img className="avatar-tiny" src={post.author.avatar} />
        </Link>
        Posted by <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link> on {dateFormatted}
      </p>

      <div className="body-content">
        <ReactMarkdown children={post.body} allowedTypes={["paragraph", "strong", "emphasis", "text", "heading", "list", "listItem"]} />
      </div>
    </Page>
  );
}

export default withRouter(ViewSinglePost);
