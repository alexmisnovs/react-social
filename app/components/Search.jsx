import React, { useEffect, useContext } from "react";
import { Link, withRouter } from "react-router-dom";
import { useImmer } from "use-immer"; // similar to reacts version
import Axios from "axios";
import DispatchContext from "../DispatchContext";
import Post from "./Post";

// playing around with

function Search() {
  const [state, setState] = useImmer({
    searchTerm: "",
    results: [],
    show: "neither",
    requestCount: 0
  });

  const appDispatch = useContext(DispatchContext);

  function closeSearch() {
    return appDispatch({ type: "CLOSE_SEARCH" });
  }
  useEffect(() => {
    document.addEventListener("keyup", searchKeyPressHandler);
    document.addEventListener("keydown", searchKeyPressHandler2);
    return () => {
      document.removeEventListener("keyup", searchKeyPressHandler);
      document.removeEventListener("keydown", searchKeyPressHandler2);
    };
  }, []);

  useEffect(() => {
    if (state.searchTerm.trim()) {
      setState(draft => {
        draft.show = "loading";
      });
      const delay = setTimeout(() => {
        // send request to the backend
        setState(draft => {
          draft.requestCount++;
        });
        // console.log(state.searchTerm);
      }, 1000);
      // cleanup function will also run next time this useEffect will run again.
      return () => clearTimeout(delay);
    } else {
      setState(draft => {
        draft.show = "neither";
      });
    }
  }, [state.searchTerm]);

  // sending request
  useEffect(() => {
    if (state.requestCount) {
      const ourRequest = Axios.CancelToken.source();
      // searching only the posts.
      async function fetchResults() {
        try {
          const response = await Axios.post(`/search`, { searchTerm: state.searchTerm }, { cancelToken: ourRequest.token });
          setState(draft => {
            draft.results = response.data;
            draft.show = "results";
          });
          // setIsLoading(false);
        } catch (e) {
          console.log("There was a problem, with Search Post Request");
        }
      }
      fetchResults();
      // cleanup
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.requestCount]);

  function searchKeyPressHandler(event) {
    if (event.keyCode == 27) {
      closeSearch();
    }
  }
  function searchKeyPressHandler2(e) {
    if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) && e.keyCode == 70) {
      e.preventDefault();
      // Process the event here
      closeSearch();
    }
  }

  function handleSearchInput(event) {
    const value = event.target.value;
    setState(draft => {
      draft.searchTerm = value;
    });
  }

  return (
    <>
      <div className="search-overlay-top shadow-sm">
        <div className="container container--narrow">
          <label htmlFor="live-search-field" className="search-overlay-icon">
            <i className="fas fa-search"></i>
          </label>
          <input onChange={handleSearchInput} autoFocus type="text" autoComplete="off" id="live-search-field" className="live-search-field" placeholder="What are you interested in?" />
          <span onClick={closeSearch} className="close-live-search">
            <i className="fas fa-times-circle"></i>
          </span>
        </div>
      </div>

      <div className="search-overlay-bottom">
        <div className="container container--narrow py-3">
          <div className={"circle-loader " + (state.show == "loading" ? "circle-loader--visible" : "")}></div>
          <div className={"live-search-results " + (state.show == "results" ? " live-search-results--visible" : "")}>
            {Boolean(state.results.length) && (
              <div className="list-group shadow-sm">
                <div className="list-group-item active">
                  <strong>Search Results</strong> ({state.results.length} {state.results.length > 1 ? "items" : "item"} found)
                </div>
                {state.results.map(post => {
                  return <Post post={post} key={post._id} onClick={closeSearch} />;
                })}
              </div>
            )}
            {!Boolean(state.results.length) && <p className="alert alert-danger text-center shadow-sm">Sorry, we couldn't find any results</p>}
          </div>
        </div>
      </div>
    </>
  );
}

export default Search;
