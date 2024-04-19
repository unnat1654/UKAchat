import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import background from "../../assets/aesthetic-gifs.gif";
import { FiUpload } from "react-icons/fi";
import { RiEditLine } from "react-icons/ri";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import UserIcon from "../../components/UserIcon";
import Tilt from "react-parallax-tilt";

const ProfilePictureUpload = () => {
  const signupinfo = useLocation();
  const [photo, setPhoto] = useState();
  const navigate = useNavigate();

  const handleImage = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setPhoto(reader.result);
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER}/auth/signup`,
        {
          ...signupinfo.state,
          photo,
        }
      );
      if (data?.success) {
        toast.success(data?.message);
        navigate("/login");
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
      <Tilt
        transitionSpeed={5000}
        trackOnWindow={true}
        tiltReverse={true}
        className="signup"
      >
        <p className="signup-heading">Let's get started</p>
        <p className="signup-subheading">
          Join us here, a better place for every conversation
        </p>
        <div className="upload-box">
          <label className="profile-pic-label" htmlFor="dip">
            {photo ? <RiEditLine /> : <FiUpload />}
          </label>
          <input
            type="file"
            id="dip"
            accept="image/*"
            onChange={handleImage}
            className="upload-file"
          />
          {photo ? (
            <img
              src={photo}
              alt="profile_photo"
              height={"200px"}
              width={"200px"}
              className="photoupload"
            />
          ) : (
            <div>
              <br />
              <UserIcon size="210px" z="-10" />
              <br />
              <br />
              <br />
            </div>
          )}
        </div>
        <div className="signup-upload-buttons">
          <button
            type="button"
            className="signup-upload-button skip-upload-button"
            onClick={handleSubmit}
          >
            Skip
          </button>
          <button
            type="submit"
            className="signup-upload-button"
            onClick={handleSubmit}
          >
            Signup
          </button>
        </div>
        <p className="signup-redirect">
          Already a Member? <Link to="/login">Login</Link>
        </p>
      </Tilt>
      <img className="background" src={background} alt="background" />
    </div>
  );
};

export default ProfilePictureUpload;
