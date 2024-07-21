import React from "react";
import { PiUserSwitch } from "react-icons/pi";
import { LuQrCode } from "react-icons/lu";
import toast from "react-hot-toast";
import { useAuth } from "../../context/authContext";
import { useContactDetailsArray } from "../../context/ContactDetailsContext";
import { useActiveGroup } from "../../context/activeGroupContext";
import OtherChats from "../chat/OtherChats";

const ManageMembersMenu = ({ show, setShow }) => {
  const [auth, setAuth] = useAuth();
  const [contactDetailsArray, setContactDetailsArray] =
    useContactDetailsArray();
  const [activeGroup, setActiveGroup] = useActiveGroup();

  const handleClick = () => {
    console.log("Handle click");
  };

  if (auth?.token) {
    return (
      <div
        className="manage-members-menu"
        style={{ visibility: show ? "visible" : "hidden" }}
        onMouseLeave={() => {
          setShow(false);
        }}
      >
        <div className="chatmenu-allchats">
          <React.Fragment>
            {contactDetailsArray?.detailsArray.map((c) => (
              <div key={c?._id}>
                {c && (
                  <OtherChats
                    name={c.contact?.username}
                    photo={c.contact?.photo?.secure_url}
                    notify={c.online}
                    id={c.contact?._id}
                  />
                )}
              </div>
            ))}
          </React.Fragment>
        </div>
        <div className="manage-members-menu-item">
          <PiUserSwitch className="manage-members-menu-icon" />
          <p>Change Profile Picture</p>
        </div>
        <hr />
        <div className="manage-members-menu-item">
          <LuQrCode className="manage-members-menu-icon" />
          <p>QR Code</p>
        </div>
      </div>
    );
  }
};

export default ManageMembersMenu;
