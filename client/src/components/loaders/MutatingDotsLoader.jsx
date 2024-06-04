import React from "react";
import { MutatingDots } from "react-loader-spinner";

const MutatingDotsLoader = () => {
  return (
    <MutatingDots
      visible={true}
      height="100"
      width="100"
      color="#008cffa2"
      secondaryColor="#ffffff99"
      radius="12.5"
      ariaLabel="mutating-dots-loading"
      wrapperClass="loader"
    />
  );
};

export default MutatingDotsLoader;
