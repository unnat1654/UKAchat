import React, { useState } from "react";
import { IoMailOutline } from "react-icons/io5";
import { RiLockPasswordLine } from "react-icons/ri";
import { PiEye, PiEyeClosed } from "react-icons/pi";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import background from "../../assets/5927911.gif";
import {
  IoIosCheckmarkCircle,
  IoIosCheckmarkCircleOutline,
  IoIosCloseCircleOutline,
} from "react-icons/io";
import { hasNumber, hasLowerStr, hasUpperStr } from "../../functions/functions";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const ForgotPassword = () => {
  const [details, setDetails] = useSearchParams({ email: "" });
  const email = details.get("email");
  const [password, setPassword] = useState("");
  const [reEnterPassword, setReEnterPassword] = useState("");
  const [passwordType, setPasswordType] = useState("password");
  const [confirmPasswordType, setConfirmPasswordType] = useState("password");
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (password === reEnterPassword) {
        const { data } = await axios.patch(
          `${import.meta.env.VITE_SERVER}/auth/forgot-password`,
          {
            email: email,
            new_password: password,
          }
        );
        if (data?.success) {
          toast.success(data?.message);
          navigate("/login");
        } else {
          toast.error(data?.message);
        }
      } else {
        toast.error("Passwords do not match");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response ? error.response.data.message : error);
    }
  };
  return (
    <div>
      <br />
      <br />
      <br />
      <br />
      <img className="background" src={background} alt="background" />
      <div className="forpass">
        <p className="forpass-heading">Reset password</p>
        <p className="forpass-subheading">Enter your new password</p>
        <form className="forpass-form">
          <label htmlFor="email">Email address</label>
          <div className="form-input">
            <IoMailOutline />
            <input
              type="email"
              id="email"
              className="forpass-input"
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
            className="forpass-button"
            onClick={handleSubmit}
          >
            Reset Password
          </button>
        </form>
        <p className="forpass-redirect">
          Remember your password? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
