import React from "react";
import { CiCircleCheck } from "react-icons/ci";

const AcceptIcon = ({ size, top, left, z }) => {
  if (!size) {
    size = "calc(35px + 0.4vw)";
  }
  return (
    <CiCircleCheck
      style={{
        color: "rgba(0, 255, 0, 0.5)",
        backgroundColor: "transparent",
        height: size,
        width: size,
        borderRadius: "100%",
        textAlign: "center",
        position: "relative",
        top: top,
        left: left,
        zIndex: z,
      }}
    />
  );
};

export default AcceptIcon;
