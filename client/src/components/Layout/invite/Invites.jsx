import React, { useEffect, useState } from "react";
import UserIcon from "../UserIcon";
import Tilt from "react-parallax-tilt";
import RejectIcon from "./RejectIcon";
import AcceptIcon from "./AcceptIcon";

const Invites = ({ sender, photo, id, active }) => {
  const [invitesArray, setInvitesArray] = useState([]);

  const handleClick = async () => {
    try {
      console.log("Clicked");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div onClick={handleClick}>
      <Tilt
        tiltMaxAngleX={1}
        className={`invites ${active ? "invites-active" : ""}`}
      >
        {photo ? (
          <img src={photo} className="invites-dp" alt="" />
        ) : (
          <UserIcon size="calc(35px + 0.4vw)" />
        )}
        <div className="invites-chat">
          <span className="invites-chat-name">{sender}</span>
        </div>
        <div className="invites-buttons">
          <div className="accept-button">
            <AcceptIcon></AcceptIcon>
          </div>
          <div className="reject-button">
            <RejectIcon></RejectIcon>
          </div>
        </div>
      </Tilt>
    </div>
  );
};

export default Invites;

// invitesArray.map((invite) => {
//   <div onClick={handleClick}>
//     <Tilt
//       tiltMaxAngleX={1}
//       className={`invites ${active ? "invites-active" : ""}`}
//     >
//       {photo ? (
//         <img src={invite.photo} className="invites-dp" alt="" />
//       ) : (
//         <UserIcon size="45px" />
//       )}
//       <div className="invites-chat">
//         <span className="invites-chat-name">{invite.sender}</span>
//       </div>
//     </Tilt>
//   </div>;
// });
