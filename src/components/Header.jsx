import React from "react";
import Button from "./Buttons";
import "../styles/variables.css";
import "./Header.css";

const Header = () => {
  return (
    <div className="Search-Nav">
      <div className="Search-Nav-Items">
        <a href="/">
          <img
            href="/"
            className="Search-nav-logo"
            src="https://www.infersol.com/wp-content/uploads/2020/02/logo.png"
            alt="Infer logo"
          ></img>
        </a>
        <section className="Search-nav-login">
          {/* <Button text="SignUp" className="signup-btn" /> */}
          <Button text="Login" className="login-btn" />
        </section>
      </div>
    </div>
  );
};

export default Header;
