import React from "react";
import { ProgressBar } from "react-loader-spinner";

const ProgressBarLoader = () => {
  return (
    <ProgressBar
      visible={true}
      height="80"
      width="80"
      color="#4fa94d"
      borderColor="#ffffff99"
      barColor="#008cffa2"
      ariaLabel="progress-bar-loading"
      wrapperStyle={{}}
      wrapperClass="loader"
    />
  );
};

export default ProgressBarLoader;
