import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Axios from "axios";
//components
import LoadingIcon from "./LoadingIcon";
import Page from "./Page";
import Post from "./Post";
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
        // console.log(response.data);
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
  }, [username]);
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
        return <Post noAuthor={true} post={post} key={post._id} />;
      })}
    </div>
  );
}

export default ProfilePosts;
