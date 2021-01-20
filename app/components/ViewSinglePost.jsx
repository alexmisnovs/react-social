import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Page from "./Page";
import Axios from "axios";
import ReactMarkdown from "react-markdown";

// components
import LoadingIcon from "./LoadingIcon";

function ViewSinglePost(props) {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState();
  // added the error
  const [notFoundError, setNotFoundError] = useState(false);

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${id}`, { cancelToken: ourRequest.token });
        // Added a way to stop application breaking if post id is not found
        if (!response.data) {
          setNotFoundError(true);
        }
        console.log(response.data);
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
    return (
      <Page title="Post Not Found.. ">
        <div>Post Not Found..</div>
      </Page>
    );
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

  return (
    <Page title={post.title}>
      <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>
        <span className="pt-2">
          <a href="#" className="text-primary mr-2" title="Edit">
            <i className="fas fa-edit"></i>
          </a>
          <a className="delete-post-button text-danger" title="Delete">
            <i className="fas fa-trash"></i>
          </a>
        </span>
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

export default ViewSinglePost;
