import React from "react";
import { convertTimeTo12 } from "../../../functions/timeFunction";
import image from "../../../assets/62111-urban-minimalist-wallpaper-top-free-urban-minimalist.jpg";
import { getFileType } from "../../../functions/regexFunctions";

const MessageDisplay = ({ format, timeSent, file, text, sent }) => {
  let fileType="";
  if(!format){
    fileType=getFileType(file);
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
          {fileType== "video" && (
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
          {fileType=="audio" && (<>
          <audio className="message-box-image" controls={true} autoBuffer={true}>
            <source src={file} />
          </audio>
          <span className="message-box-time">
              {convertTimeTo12(timeSent)}
            </span>
          </>)}
          {
            fileType!="video" && fileType!="image" && fileType!="audio" (<></>)

          }
        </div>
      )}
    </>
  );
};

export default MessageDisplay;
