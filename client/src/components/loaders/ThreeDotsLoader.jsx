import React from "react";
import { ThreeDots } from "react-loader-spinner";

const ThreeDotsLoader = () => {
  return (
    <ThreeDots
      visible={true}
      height="80"
      width="80"
      color="#008cffa2"
      radius="9"
      ariaLabel="three-dots-loading"
      wrapperClass="loader"
    />
  );
};

export default ThreeDotsLoader;
