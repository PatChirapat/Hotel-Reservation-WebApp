import React, { useState } from "react";
import "../ui/Signin.css";
import Navbar from "../components/Navbar";

function Signin() {
  const signinbg = "images/home/proj_home3.jpeg";
  const [activeTab, setActiveTab] = useState("signin");

  return (
    <div className="signin">
      <Navbar />
      <img src={signinbg} alt="Signin Background" className="bg-img" />
      <div className="form-overlay">
        <div className="form-container">
          <div className="form-header">
            <button
              className={activeTab === "signin" ? "active" : ""}
              onClick={() => setActiveTab("signin")}
            >
              Sign In
            </button>
            <button
              className={activeTab === "signup" ? "active" : ""}
              onClick={() => setActiveTab("signup")}
            >
              Sign Up
            </button>
          </div>

          {activeTab === "signin" ? (
            <div className="form">
              <h2>Username</h2>
              <input type="text" placeholder="Enter your username" />
              <h2>Password</h2>
              <input type="password" placeholder="Enter your password" />
              <button className="submit-btn">Sign In</button>
            </div>
          ) : (
            <div className="form">
              <h2>Username</h2>
              <input type="text" placeholder="Enter your username" />
              <h2>Password</h2>
              <input type="password" placeholder="Enter your password" />
              <h2>Confirm Password</h2>
              <input type="password" placeholder="Confirm your password" />
              <button className="submit-btn">Sign Up</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Signin;
