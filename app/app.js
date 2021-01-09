import React from "react";
import ReactDOM from "react-dom";

function ExampleComponent() {
  return (
    <div>
      <h1>Our Example Component!!!</h1>
      <p>The sky is the limit Blah blah!</p>
    </div>
  );
}

ReactDOM.render(<ExampleComponent />, document.querySelector("#app"));

if (module.hot) {
  module.hot.accept();
}
