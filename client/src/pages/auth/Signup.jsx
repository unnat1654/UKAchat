import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Tilt from "react-parallax-tilt";
import { HiOutlineUser } from "react-icons/hi2";
import { IoMailOutline } from "react-icons/io5";
import { RiLockPasswordLine } from "react-icons/ri";
import { PiEyeClosed, PiEye } from "react-icons/pi";
import {
  IoIosCheckmarkCircleOutline,
  IoIosCloseCircleOutline,
} from "react-icons/io";
import { hasNumber, hasLowerStr, hasUpperStr } from "../../functions/checkFunctions";
import background from "../../assets/tumblr_piwmfy6Auo1rnbw6mo1_1280.gif.c7ace76f60e21632bee08b08c82391be.gif";

const Signup = () => {
  const [details, setDetails] = useSearchParams({ username: "", email: "" });
  const userName = details.get("username");
  const email = details.get("email");
  const [password, setPassword] = useState("");
  const [reEnterPassword, setReEnterPassword] = useState("");
  const [passwordType, setPasswordType] = useState("password");
  const [confirmPasswordType, setConfirmPasswordType] = useState("password");
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      password.length >= 8 &&
      hasLowerStr(password) &&
      hasUpperStr(password) &&
      password == reEnterPassword &&
      userName.length > 6
    ) {
      navigate("/profile-info", {
        state: { username: userName, email: email, password: password },
      });
    }
  };
  return (
    <div>
      <br />
      <br />

      <Tilt
        transitionSpeed={5000}
        tiltReverse={true}
        trackOnWindow={true}
        className="signup"
      >
        <p className="signup-heading">Let's get started</p>
        <p className="signup-subheading">
          Join us here, a better place for every conversation
        </p>
        <form className="signup-form">
          <label htmlFor="username">Username</label>
          <div className="form-input">
            <HiOutlineUser />
            <input
              type="text"
              id="username"
              className="signup-input"
              minLength="6"
              placeholder="Username"
              value={userName}
              onChange={(e) =>
                setDetails(
                  (prev) => {
                    prev.set("username", e.target.value);
                    return prev;
                  },
                  { replace: true }
                )
              }
              required
            />
          </div>
          <label htmlFor="email">Email address</label>
          <div className="form-input">
            <IoMailOutline />
            <input
              type="email"
              id="email"
              className="signup-input"
              placeholder="Email@example.com"
              value={email}
              onChange={(e) =>
                setDetails(
                  (prev) => {
                    prev.set("email", e.target.value);
                    return prev;
                  },
                  { replace: true }
                )
              }
              required
            />
          </div>
          <label htmlFor="password">Password</label>
          <div className="form-input">
            <RiLockPasswordLine />
            <input
              type={passwordType}
              id="password"
              className="signup-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {passwordType === "password" ? (
              <PiEye onClick={() => setPasswordType("text")} />
            ) : (
              <PiEyeClosed onClick={() => setPasswordType("password")} />
            )}
          </div>
          {password.length >= 1 ? (
            <div className="input-conditions">
              <div>
                {password.length >= 8 ? (
                  <IoIosCheckmarkCircleOutline style={{ color: "green" }} />
                ) : (
                  <IoIosCloseCircleOutline style={{ color: "red" }} />
                )}
                <span>At least 8 characters</span>
                <br />
              </div>
              <div>
                {hasLowerStr(password) ? (
                  <IoIosCheckmarkCircleOutline style={{ color: "green" }} />
                ) : (
                  <IoIosCloseCircleOutline style={{ color: "red" }} />
                )}
                <span>Include at least one lowercase(a-z)</span>
                <br />
              </div>
              <div>
                {hasUpperStr(password) ? (
                  <IoIosCheckmarkCircleOutline style={{ color: "green" }} />
                ) : (
                  <IoIosCloseCircleOutline style={{ color: "red" }} />
                )}
                <span>Include at least one uppercase(A-Z)</span>
                <br />
              </div>
              <div>
                {hasNumber(password) ? (
                  <IoIosCheckmarkCircleOutline style={{ color: "green" }} />
                ) : (
                  <IoIosCloseCircleOutline style={{ color: "red" }} />
                )}
                <span>Include at least one number(0-9)</span>
                <br />
              </div>
            </div>
          ) : (
            <div></div>
          )}

          <label htmlFor="reEnterpassword">Confirm Password</label>
          <div className="form-input">
            <RiLockPasswordLine />
            <input
              type={confirmPasswordType}
              id="reEnterpassword"
              className="signup-input"
              placeholder="Confirm password"
              value={reEnterPassword}
              onChange={(e) => setReEnterPassword(e.target.value)}
              required
            />
            {confirmPasswordType === "password" ? (
              <PiEye onClick={() => setConfirmPasswordType("text")} />
            ) : (
              <PiEyeClosed onClick={() => setConfirmPasswordType("password")} />
            )}
          </div>
          {reEnterPassword && password != reEnterPassword ? (
            <div className="input-conditions">
              <div>
                <IoIosCloseCircleOutline style={{ color: "red" }} />
                <span>Passwords do not match</span>
                <br />
              </div>
            </div>
          ) : (
            <div></div>
          )}
          <button
            type="submit"
            className="signup-button"
            onClick={handleSubmit}
          >
            Continue
          </button>
        </form>
        <p className="signup-redirect">
          Already a Member? <Link to="/login">Login</Link>
        </p>
      </Tilt>
      <img className="background" src={background} alt="background" />
    </div>
  );
};

export default Signup;
