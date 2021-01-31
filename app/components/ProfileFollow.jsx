import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Axios from "axios";

//components
import LoadingIcon from "./LoadingIcon";
/**
 * TODO: Add a Not Found component
 */
function ProfileFollow(props) {
  const { username } = useParams();
  const [isLoading, setIsloading] = useState(true);
  const [follow, setFollow] = useState([]);

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    async function fetchProfileFollows() {
      try {
        const response = await Axios.get(`/profile/${username}/${props.action}`, { cancelToken: ourRequest.token });
        console.log(response.data);
        setFollow(response.data);
        setIsloading(false);
      } catch (e) {
        console.log(`There was a problem, in profile ${props.action}`);
      }
    }
    fetchProfileFollows();
    // cleanup
    return () => {
      ourRequest.cancel();
    };
  }, [props.action]);

  if (isLoading) return <LoadingIcon />;
  if (!follow.length) {
    return <div>{props.action == "followers" ? <p>No followers yet</p> : <p>Not following anyone yet</p>}</div>;
  }
  return (
    <div className="list-group">
      {follow.map((follower, index) => {
        return (
          <Link to={`/profile/${follower.username}`} key={index} href="#" className="list-group-item list-group-item-action">
            <img className="avatar-tiny" src={follower.avatar} /> {follower.username}
          </Link>
        );
      })}
    </div>
  );
}

export default ProfileFollow;
