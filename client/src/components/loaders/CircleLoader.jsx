import React from "react";
import { Oval } from "react-loader-spinner";
import "./LoadingScreen.css";

const CircleLoader = ({ color, secondaryColor, size }) => {
  return (
    <div className="loader-wrapper">
      <Oval
        visible={true}
        height={size || "60px"}
        width={size || "60px"}
        color={color || "#ffffff99"}
        secondaryColor={secondaryColor || "#008cffa2"}
        strokeWidth={"2"}
        strokeWidthSecondary="2"
        ariaLabel="oval-loading"
        wrapperClass="loader"
      />
    </div>
  );
};

export default CircleLoader;
