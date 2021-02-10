import React from "react";

function FlashMessages(props) {
  let status = "success";
  if (props.status) {
    status = props.status;
  }
  return (
    <div className="floating-alerts">
      {props.messages.map((msg, index) => {
        // potentially can add more logic for other colours and statuses etc
        // lets use status as the part of the class name we want to add
        return (
          <div key={index} className={`alert alert-${status} text-centered floating-alert shadow-sm`}>
            {msg}
          </div>
        );
      })}
    </div>
  );
}

export default FlashMessages;
