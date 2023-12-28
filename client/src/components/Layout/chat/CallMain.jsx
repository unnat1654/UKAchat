import React from "react";
import UserIcon from "../UserIcon";
import { MdCallEnd } from "react-icons/md";
import { IoMicOffOutline } from "react-icons/io5";
import { HiOutlineSpeakerWave } from "react-icons/hi2";

const CallMain = () => {
  return (
    <div className="callmain">
      <div className="callmain-user-icon">
        <UserIcon size="100%" />
      </div>
      <IoMicOffOutline className="callmain-user-mute-icon" />
      <MdCallEnd className="callmain-cut-call-icon" />
      <HiOutlineSpeakerWave className="callmain-mute-call-icon" />
    </div>
  );
};

export default CallMain;
