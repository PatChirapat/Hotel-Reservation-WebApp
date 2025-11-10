import React, { useState } from "react";
import axios from "axios";
import "../ui/Signin.css";
import Navbar from "../components/Navbar";
import { apiUrl } from "../utils/api";

function Signin() {
  const signinbg = "images/home/proj_home3.jpeg";
  const [activeTab, setActiveTab] = useState("signin");

  // --- API base ---
  // --- Sign In state ---
  const [identifier, setIdentifier] = useState(""); // username / phone / email
  const [passwordIn, setPasswordIn] = useState("");
  const [loadingIn, setLoadingIn] = useState(false);
  const [errIn, setErrIn] = useState("");

  // --- Sign Up state ---
  const [su, setSu] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    username: "",
    password: "",
    confirm: "",
    email: "",
  });
  const [loadingUp, setLoadingUp] = useState(false);
  const [errUp, setErrUp] = useState("");
  const [okUp, setOkUp] = useState("");

  async function handleSignin(e) {
    e.preventDefault();
    setErrIn("");
    setLoadingIn(true);
    try {
      const { data } = await axios.post(apiUrl("api/auth/signin.php"), {
        identifier,
        password: passwordIn,
      }, {
        headers: { "Content-Type": "application/json" }
      });
      // Keep simple local session
      localStorage.setItem("user", JSON.stringify(data));
      // Redirect (adjust target as you wish)
      window.location.href = "/";
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.errors?.join(", ") || err.message;
      setErrIn(msg);
    } finally {
      setLoadingIn(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setErrUp("");
    setOkUp("");

    if (su.password.length < 6) {
      setErrUp("Password must be at least 6 characters");
      return;
    }
    if (su.password !== su.confirm) {
      setErrUp("Passwords do not match");
      return;
    }

    setLoadingUp(true);
    try {
      const { data } = await axios.post(apiUrl("api/auth/signup.php"), {
        first_name: su.first_name,
        last_name: su.last_name,
        phone: su.phone,
        username: su.username,
        password: su.password,
        email: su.email,
      }, {
        headers: { "Content-Type": "application/json" }
      });
      // Optionally auto-signin user after signup
      localStorage.setItem("user", JSON.stringify({ member_id: data.member_id, username: data.username }));
      setOkUp("Account created!");
      setActiveTab("signin");
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.errors?.join(", ") || err.message;
      setErrUp(msg);
    } finally {
      setLoadingUp(false);
    }
  }

  return (
    <div className="signin">
      <Navbar />
      <img src={signinbg} alt="Signin Background" className="bg-img" />
      <div className="form-overlay" style={{ maxHeight: "100vh", overflowY: "auto" }}>
        <div className="form-container" style={{ maxHeight: "calc(100vh - 80px)", overflowY: "auto" }}>
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
            <form className="form" onSubmit={handleSignin}>
              {errIn && <div className="msg error">{errIn}</div>}
              <h2>Username / Phone / Email</h2>
              <input
                type="text"
                placeholder="Enter your username / phone / email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
              <h2>Password</h2>
              <input
                type="password"
                placeholder="Enter your password"
                value={passwordIn}
                onChange={(e) => setPasswordIn(e.target.value)}
              />
              <button className="submit-btn" type="submit" disabled={loadingIn}>
                {loadingIn ? "Signing in..." : "Sign In"}
              </button>
            </form>
          ) : (
            <form className="form" onSubmit={handleSignup}>
              <button
                type="button"
                className="link-back"
                onClick={() => setActiveTab("signin")}
                aria-label="Back to Sign In"
              >
                ← Back to Sign In
              </button>
              {errUp && <div className="msg error">{errUp}</div>}
              {okUp && <div className="msg success">{okUp}</div>}

              <h2>First name</h2>
              <input
                type="text"
                placeholder="Enter your first name"
                value={su.first_name}
                onChange={(e) => setSu({ ...su, first_name: e.target.value })}
              />
              <h2>Last name</h2>
              <input
                type="text"
                placeholder="Enter your last name"
                value={su.last_name}
                onChange={(e) => setSu({ ...su, last_name: e.target.value })}
              />
              <h2>Phone</h2>
              <input
                type="text"
                placeholder="e.g. 0812345678"
                value={su.phone}
                onChange={(e) => setSu({ ...su, phone: e.target.value })}
              />
              <h2>Username</h2>
              <input
                type="text"
                placeholder="Choose a username"
                value={su.username}
                onChange={(e) => setSu({ ...su, username: e.target.value })}
              />
              <h2>Password</h2>
              <input
                type="password"
                placeholder="Create a password (≥6)"
                value={su.password}
                onChange={(e) => setSu({ ...su, password: e.target.value })}
              />
              <h2>Confirm Password</h2>
              <input
                type="password"
                placeholder="Confirm your password"
                value={su.confirm}
                onChange={(e) => setSu({ ...su, confirm: e.target.value })}
              />
              <h2>Email (optional)</h2>
              <input
                type="email"
                placeholder="your@email.com"
                value={su.email}
                onChange={(e) => setSu({ ...su, email: e.target.value })}
              />

              <button className="submit-btn" type="submit" disabled={loadingUp}>
                {loadingUp ? "Creating..." : "Sign Up"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Signin;
