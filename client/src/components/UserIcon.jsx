import React from "react";
import { TiUser } from "react-icons/ti";

const UserIcon = ({ classNameProp, size, top, left, z }) => {
  if (!size && !classNameProp) {
    size = "40px";
  }
  return (
    <TiUser
      style={{
        color: "rgba(128, 128, 128, 0.181)",
        backgroundColor: "#dfdfdf",
        height: size,
        width: size,
        borderRadius: "100%",
        textAlign: "center",
        position: "relative",
        top: top,
        left: left,
        zIndex: z,
      }}
      className={classNameProp}
    />
  );
};

export default UserIcon;
