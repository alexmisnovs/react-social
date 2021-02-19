import React, { useEffect, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";
import io from "socket.io-client";

import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";

function Chat() {
  const socket = useRef(null);
  const chatField = useRef(null);
  const chatLog = useRef(null);
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

  useEffect(() => {
    if (appState.isChatOpen) {
      chatField.current.focus(); // react way of doing same shit
      //document.getElementById("chatField").focus(); not react way..
      appDispatch({ type: "CLEAR_UNREAD_CHAT_COUNT" });
    }
  }, [appState.isChatOpen]);

  useEffect(() => {
    // possibly its a good idea to connect socket only when chat opens up
    socket.current = io(process.env.BACKENDURL || "https://rsbackendapi.herokuapp.com", {
      reconnection: false
    });

    // console.log("check 1", socket.connected);
    socket.current.on("connect", function () {
      console.log("check 2, socket connected", socket.connected);
    });
    socket.current.on("chatFromServer", message => {
      setState(draft => {
        draft.chatMessages.push(message);
      });
    });
    return () => socket.current.disconnect();
  }, []);

  // make sure chat stays on the bottom
  useEffect(() => {
    // document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight;
    chatLog.current.scrollTop = chatLog.current.scrollHeight;
    if (state.chatMessages.length && !appState.isChatOpen) {
      appDispatch({ type: "INCREMENT_UNREAD_MESSAGE_COUNT" });
    }
  }, [state.chatMessages]);

  function searchKeyPressHandler(event) {
    if (event.keyCode == 27) {
      closeChat();
    }
  }

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
    socket.current.emit("chatFromBrowser", {
      token: appState.user.token,
      message: state.fieldValue
    });

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
      <div id="chat" ref={chatLog} className="chat-log">
        {state.chatMessages.map((message, index) => {
          if (message.username == appState.user.username) {
            return (
              <div key={index} className="chat-self">
                <div className="chat-message">
                  <div className="chat-message-inner"> {message.message}</div>
                </div>
                <img className="chat-avatar avatar-tiny" src={message.avatar} />
              </div>
            );
          }
          return (
            <div key={index} className="chat-other">
              <Link to={`/profile/${message.username}`}>
                <img className="avatar-tiny" src={message.avatar} />
              </Link>
              <div className="chat-message">
                <div className="chat-message-inner">
                  <Link to={`/profile/${message.username}`}>
                    <strong>{message.username} </strong>
                  </Link>{" "}
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
