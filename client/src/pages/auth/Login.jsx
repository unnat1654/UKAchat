import React, { useState } from "react";
import {
  useSearchParams,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { IoMailOutline } from "react-icons/io5";
import { RiLockPasswordLine } from "react-icons/ri";
import { PiEyeClosed, PiEye } from "react-icons/pi";
import background from "../../assets/13b0000818cfd9cf27d39afaa051dc23.gif";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../../context/authContext";
import Tilt from "react-parallax-tilt";

const Login = () => {
  const [details, setDetails] = useSearchParams({ email: "" });
  const email = details.get("email");
  const [password, setPassword] = useState("");
  const [passwordType, setPasswordType] = useState("password");
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER}/auth/login`,
        {
          email,
          password,
        }
      );
      if (data?.success) {
        toast.success(data?.message);
        setAuth({ ...auth, user: data.user, token: data.token });
        localStorage.setItem("auth", JSON.stringify(data));
        navigate(location?.state?.previousLink || "/");
      } else {
        toast.error(data ? data.message : "Something went wrong!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response ? error.response.data.message : error);
    }
  };
  return (
    <div>
      <Toaster />
      <br />
      <br />
      <br />
      <br />
      <img className="background" src={background} alt="background" />
      <Tilt
        transitionSpeed={5000}
        trackOnWindow={true}
        tiltReverse={true}
        className="login"
      >
        <p className="login-heading">Hi, Welcome back</p>
        <p className="login-subheading">
          Enter your email and password to sign in
        </p>
        <form className="login-form">
          <label htmlFor="email">Email address</label>
          <div className="form-input">
            <IoMailOutline />
            <input
              type="email"
              id="email"
              className="login-input"
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
              className="login-input"
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

          <p className="login-redirect1">
            <Link to="/forgot-password">Forgot your password?</Link>
          </p>
          <button type="submit" className="login-button" onClick={handleSubmit}>
            Log in
          </button>
        </form>
        <p className="login-redirect2">
          Not registered yet? <Link to="/signup">Create an account</Link>
        </p>
      </Tilt>
    </div>
  );
};

export default Login;
