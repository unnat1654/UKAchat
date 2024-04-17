import React from "react";
import { convertTimeTo12 } from "../../../functions/timeFunction";
import image from "../../../assets/62111-urban-minimalist-wallpaper-top-free-urban-minimalist.jpg";
import { getFileType } from "../../../functions/regexFunctions";

const MessageDisplay = ({ format, timeSent, file, text, sent, extension }) => {
  let fileType = "";
  console.log(extension);

  const audioExtensions = [
    "mp3",
    "wav",
    "ogg",
    "aac",
    "flac",
    "aiff",
    "aif",
    "wma",
    "m4a",
  ];

  if (
    !format &&
    audioExtensions.some((ext) => ext.toLowerCase() === extension)
  ) {
    fileType = "audio";
  } else if (!format) {
    fileType = getFileType(file);
  }
  return (
    <>
      {format ? (
        <div className={`message-box message-box-text ${sent ? "sent" : ""}`}>
          <p className="message-box-message">{text}</p>
          <span className="message-box-time">{convertTimeTo12(timeSent)}</span>
        </div>
      ) : (
        <div className={`message-box ${sent ? "sent" : ""}`}>
          {fileType == "image" && (
            <>
              <img
                className="message-box-image"
                src={file}
                alt="image not found"
              />
              <span className="message-box-time">
                {convertTimeTo12(timeSent)}
              </span>
            </>
          )}
          {fileType == "video" && (
            <>
              <video
                className="message-box-video"
                src={file}
                alt="image not found"
                controls={true}
              />
              <span className="message-box-time">
                {convertTimeTo12(timeSent)}
              </span>
            </>
          )}
          {fileType == "audio" && (
            <>
              <audio
                className="message-box-audio"
                controls
                preload="auto"
                src={file}
              />

              <span className="message-box-time">
                {convertTimeTo12(timeSent)}
              </span>
            </>
          )}
          {fileType != "video" &&
            fileType != "image" &&
            fileType != "audio" && (
              <>
                <p className="message-box-document">
                  <a href={file}>Click here to download the file. </a>
                </p>
                <span className="message-box-time">
                  {convertTimeTo12(timeSent)}
                </span>
              </>
            )}
        </div>
      )}
    </>
  );
};

export default MessageDisplay;
