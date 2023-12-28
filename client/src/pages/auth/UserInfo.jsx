import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import background from "../../assets/9f85175210d9db162454df94e5c74efc.gif";
import Tilt from "react-parallax-tilt";

const UserInfo = () => {
  const signupinfo = useLocation();
  const [firstName, setFirstName] = useState();
  const [lastName, setLastName] = useState();
  const [phone, setPhone] = useState();
  const [dateOfBirth, setDateOfBirth] = useState();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/profile-picture-upload", {
      state: {
        username: signupinfo?.state?.username,
        email: signupinfo?.state?.email,
        password: signupinfo?.state?.password,
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        DOB: dateOfBirth,
      },
    });
  };
  return (
    <div>
      <br />
      <br />
      <Tilt
        transitionSpeed={5000}
        tiltMaxAngleX={2}
        tiltReverse={true}
        trackOnWindow={true}
        className="signup"
      >
        <p className="signup-heading">Please share these details</p>
        <p className="signup-subheading">
          Only your name will be publicly available
        </p>
        <form className="signup-form">
          <label htmlFor="fn">First name</label>
          <div className="form-input">
            <input
              type="text"
              id="fn"
              className="signup-input"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <label htmlFor="ln">Last name</label>
          <div className="form-input">
            <input
              type="text"
              id="ln"
              className="signup-input"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <label htmlFor="phone">Phone number</label>
          <div className="form-input">
            <input
              type="text"
              id="phone"
              className="signup-input"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <label htmlFor="dob">Date of birth</label>
          <div className="form-input">
            <input
              type="date"
              id="dob"
              className="signup-input"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
          </div>

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

export default UserInfo;
