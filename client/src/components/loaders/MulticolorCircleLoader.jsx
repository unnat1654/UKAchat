import React from "react";
import { ColorRing } from "react-loader-spinner";

const MulticolorCircleLoader = () => {
  return (
    <ColorRing
      visible={true}
      height="80"
      width="80"
      ariaLabel="color-ring-loading"
      wrapperStyle={{}}
      wrapperClass="color-ring-wrapper loader"
      colors={["#e15b64a5", "#f47e60a5", "#f8b26aa5", "#abbd81a5", "#849b87a5"]}
    />
  );
};

export default MulticolorCircleLoader;
