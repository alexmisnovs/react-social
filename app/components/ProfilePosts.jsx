import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Axios from "axios";
import Page from "./Page";
//components
import LoadingIcon from "./LoadingIcon";
/**
 * TODO: Add a Not Found component
 */
function ProfilePosts() {
  const { username } = useParams();
  const [isLoading, setIsloading] = useState(true);
  const [posts, setPosts] = useState([]);
  // added the not found error
  const [notFounderror, setNotFoundError] = useState(false);

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    async function fetchPosts() {
      try {
        const response = await Axios.get(`/profile/${username}/posts`, { cancelToken: ourRequest.token });
        if (!response.data) {
          setNotFoundError(true);
        }
        console.log(response.data);
        setPosts(response.data);
        setIsloading(false);
      } catch (e) {
        console.log("There was a problem, profile posts");
      }
    }
    fetchPosts();
    // cleanup
    return () => {
      ourRequest.cancel();
    };
  }, []);
  if (notFounderror) {
    return (
      <Page title="Profile Not Found.. ">
        <div>Profile Not Found..</div>
      </Page>
    );
  }
  if (isLoading) return <LoadingIcon />;

  return (
    <div className="list-group">
      {posts.map(post => {
        const date = new Date(post.createdDate);
        const dateFormatted = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
        return (
          <Link to={`/post/${post._id}`} key={post._id} href="#" className="list-group-item list-group-item-action">
            <img className="avatar-tiny" src={post.author.avatar} /> <strong>{post.title}</strong> <span className="text-muted small">on {dateFormatted} </span>
          </Link>
        );
      })}
    </div>
  );
}

export default ProfilePosts;
