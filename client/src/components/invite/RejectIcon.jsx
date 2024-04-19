import React from "react";
import { CiCircleRemove } from "react-icons/ci";

const RejectIcon = ({ size, top, left, z }) => {
  if (!size) {
    size = "calc(35px + 0.4vw)";
  }
  return (
    <CiCircleRemove
      style={{
        color: "rgba(255, 0, 0)",
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

export default RejectIcon;
