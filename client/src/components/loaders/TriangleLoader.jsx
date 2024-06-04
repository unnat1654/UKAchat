import React from "react";
import { Triangle } from "react-loader-spinner";

const TriangleLoader = () => {
  return (
    <Triangle
      color="#008cffa2"
      visible={true}
      height="80"
      width="80"
      ariaLabel="triangle-loading"
      wrapperStyle={{}}
      wrapperClass="loader"
    />
  );
};

export default TriangleLoader;
