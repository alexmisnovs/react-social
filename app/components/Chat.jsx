import React, { useEffect, useContext, useRef } from "react";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";
import { useImmer } from "use-immer";
import io from "socket.io-client";

const socket = io("http://127.0.0.1:8080", {
  reconnection: false
});

console.log("check 1", socket.connected);
socket.on("connect", function () {
  console.log("check 2", socket.connected);
});

function Chat() {
  const chatField = useRef(null);
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  const [state, setState] = useImmer({
    fieldValue: "",
    chatMessages: []
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

  useEffect(() => {
    socket.on("chatFromServer", message => {
      setState(draft => {
        draft.chatMessages.push(message);
      });
    });
  }, []);
  function handleFieldChange(e) {
    const value = e.target.value;
    setState(draft => {
      draft.fieldValue = value;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    //finished here
    // send message to chat server
    socket.emit("chatFromBrowser", {
      token: appState.user.token,
      message: state.fieldValue
    });

    console.log(state.fieldValue);
    // chatField.current.value = ""; this works as well
    setState(draft => {
      // add message to state collection
      draft.chatMessages.push({ message: state.fieldValue, username: appState.user.username, avatar: appState.user.avatar });
      draft.fieldValue = "";
    });
  }

  function closeChat() {
    return appDispatch({ type: "CLOSE_CHAT" });
  }

  return (
    <div id="chat-wrapper" className={"chat-wrapper shadow border-top border-left border-right " + (appState.isChatOpen ? "chat-wrapper--is-visible" : "")}>
      <div className="chat-title-bar bg-primary">
        Chat
        <span onClick={closeChat} className="chat-title-bar-close">
          <i className="fas fa-times-circle"></i>
        </span>
      </div>
      <div id="chat" className="chat-log">
        {state.chatMessages.map((message, index) => {
          if (message.username == appState.user.username) {
            return (
              <div key={index} className="chat-self">
                <div className="chat-message">
                  <div className="chat-message-inner">{message.message}</div>
                </div>
                <img className="chat-avatar avatar-tiny" src={message.avatar} />
              </div>
            );
          }
          return (
            <div key={index} className="chat-other">
              <a href="#">
                <img className="avatar-tiny" src={message.avatar} />
              </a>
              <div className="chat-message">
                <div className="chat-message-inner">
                  <a href="#">
                    <strong>{message.username}</strong>
                  </a>{" "}
                  {message.message}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={handleSubmit} id="chatForm" className="chat-form border-top">
        <input value={state.fieldValue} ref={chatField} onChange={handleFieldChange} type="text" className="chat-field" id="chatField" placeholder="Type a message…" autoComplete="off" />
      </form>
    </div>
  );
}

export default Chat;
