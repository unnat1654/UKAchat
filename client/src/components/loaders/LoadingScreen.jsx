import "./LoadingScreen.css";
import React from "react";
import { Triangle } from "react-loader-spinner";
import { ColorRing } from "react-loader-spinner";
import { Oval } from "react-loader-spinner";
import { MutatingDots } from "react-loader-spinner";
import { ThreeDots } from "react-loader-spinner";
import { ProgressBar } from "react-loader-spinner";

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loaders">
        <Triangle
          color="#008cffa2"
          visible={true}
          height="80"
          width="80"
          ariaLabel="triangle-loading"
          wrapperStyle={{}}
          wrapperClass="loader"
        />
        <ColorRing
          visible={true}
          height="80"
          width="80"
          ariaLabel="color-ring-loading"
          wrapperStyle={{}}
          wrapperClass="color-ring-wrapper loader"
          colors={[
            "#e15b64a5",
            "#f47e60a5",
            "#f8b26aa5",
            "#abbd81a5",
            "#849b87a5",
          ]}
        />
        <Oval
          visible={true}
          height="60"
          width="60"
          color="#ffffff99"
          secondaryColor="#008cffa2"
          strokeWidth={"2"}
          strokeWidthSecondary="2"
          ariaLabel="oval-loading"
          wrapperClass="loader"
        />
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
        <ThreeDots
          visible={true}
          height="80"
          width="80"
          color="#008cffa2"
          radius="9"
          ariaLabel="three-dots-loading"
          wrapperClass="loader"
        />
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
      </div>
    </div>
  );
};

export default LoadingScreen;
