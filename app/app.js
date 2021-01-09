import React from "react";
import ReactDOM from "react-dom";

//Components
import Footer from "./components/Footer";
import Header from "./components/Header";
import HomeGuest from "./components/HomeGuest";

function Main() {
  return (
    <>
      <Header />

      <HomeGuest />

      <Footer />
    </>
  );
}

ReactDOM.render(<Main />, document.querySelector("#app"));

if (module.hot) {
  module.hot.accept();
}
