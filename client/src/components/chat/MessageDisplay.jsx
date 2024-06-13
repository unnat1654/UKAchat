import React, { useCallback, useEffect, useState } from "react";
import { IoCloudDownloadOutline } from "react-icons/io5";
import { convertTimeTo12 } from "../../functions/timeFunction";
import { getFileType } from "../../functions/regexFunctions";
import { decrypt } from "../../functions/encryptionFunctions";

const MessageDisplay = ({
  format,
  timeSent,
  file,
  text,
  sent,
  extension,
  iv,
  sharedKey,
}) => {
  let fileType = "";

  const [messageDecrypted, setMessageDecrypted] = useState("");

  if (!format) fileType = getFileType(extension);

  const decryption = useCallback( async () => {
    const message = await decrypt(sharedKey, iv, text);
    setMessageDecrypted(message);
  },[sharedKey,text]);
  
  useEffect(() => {
    if (!text || !sharedKey) {
      return;
    }
    decryption();
  }, [decryption]);
  return (
    <>
      {format ? (
        <div className={`message-box message-box-text ${sent ? "sent" : ""}`}>
          <p className="message-box-message">{messageDecrypted}</p>
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
                <p className="message-box-download">
                  <a href={file} target="_blank">
                    <IoCloudDownloadOutline />
                    Click here to download <br />
                    the file.{" "}
                  </a>
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
