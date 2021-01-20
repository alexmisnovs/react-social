import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Page from "./Page";
import Axios from "axios";

// components
import LoadingIcon from "./LoadingIcon";

function ViewSinglePost(props) {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState();
  // added the error
  const [notFounderror, setNotFoundError] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${id}`);
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
  }, []);

  if (notFounderror) {
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
        <p>{post.body}</p>
      </div>
    </Page>
  );
}

export default ViewSinglePost;
