import React, { useEffect, useContext, useRef } from "react";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";
import { useImmer } from "use-immer";

function Chat() {
  const chatField = useRef(null);
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  const [state, setState] = useImmer({
    fieldValue: ""
  });

  useEffect(() => {
    document.addEventListener("keyup", searchKeyPressHandler);
    return () => {
      document.removeEventListener("keyup", searchKeyPressHandler);
    };
  }, []);

  function searchKeyPressHandler(event) {
    if (event.keyCode == 27) {
      closeSearch();
    }
  }
  useEffect(() => {
    if (appState.isChatOpen) {
      chatField.current.focus(); // react way of doing same shit
      //document.getElementById("chatField").focus(); not react way..
    }
  }, [appState.isChatOpen]);

  function handleSubmit(e) {
    e.preventDefault();
    //finished here
    console.log(state.fieldValue);
  }
  function handleFieldChange(e) {
    const value = e.target.value;
    setState(draft => {
      draft.fieldValue = value;
    });
  }
  function closeSearch() {
    return appDispatch({ type: "CLOSE_CHAT" });
  }

  return (
    <div id="chat-wrapper" className={"chat-wrapper shadow border-top border-left border-right " + (appState.isChatOpen ? "chat-wrapper--is-visible" : "")}>
      <div className="chat-title-bar bg-primary">
        Chat
        <span onClick={closeSearch} className="chat-title-bar-close">
          <i className="fas fa-times-circle"></i>
        </span>
      </div>
      <div id="chat" className="chat-log">
        <div className="chat-self">
          <div className="chat-message">
            <div className="chat-message-inner">Hey, how are you?</div>
          </div>
          <img className="chat-avatar avatar-tiny" src="https://gravatar.com/avatar/b9408a09298632b5151200f3449434ef?s=128" />
        </div>

        <div className="chat-other">
          <a href="#">
            <img className="avatar-tiny" src="https://gravatar.com/avatar/b9216295c1e3931655bae6574ac0e4c2?s=128" />
          </a>
          <div className="chat-message">
            <div className="chat-message-inner">
              <a href="#">
                <strong>barksalot:</strong>
              </a>
              Hey, I am good, how about you?
            </div>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} id="chatForm" className="chat-form border-top">
        <input ref={chatField} onChange={handleFieldChange} type="text" className="chat-field" id="chatField" placeholder="Type a message…" autoComplete="off" />
      </form>
    </div>
  );
}

export default Chat;
