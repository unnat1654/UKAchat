import React, { useState } from "react";
import UserIcon from "../UserIcon";
import { useActiveGroup } from "../../context/activeGroupContext";
import { IoExitSharp } from "react-icons/io5";
import { MdManageAccounts } from "react-icons/md";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useGroupDetailsArray } from "../../context/groupDetailsContext";
import ManageMembersMenu from "../managegroupmembersmenu/ManageMembersMenu";

const GroupNavbar = () => {
  const [activeGroup, setActiveGroup] = useActiveGroup();
  const [groupDetailsArray, setGroupDetailsArray] = useGroupDetailsArray();
  const [show, setShow] = useState(false);

  const manageGroupMembers = () => {
    console.log("Manage group members");
    setShow(true);
  };
  const exitGroup = async () => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER}/group/leave-group`,
        {
          group: activeGroup.group,
        }
      );
      if (!data?.success) {
        toast.error(data ? data.message : "Something went wrong!");
        return;
      }
      const filteredGroups = groupDetailsArray.filter(
        (group) => group._id !== activeGroup?.group
      );
      setGroupDetailsArray(filteredGroups);
      setActiveGroup({
        group: "",
        name: "",
        description: "",
        admin: [],
        members: [],
        messages: [], //format {format:bool(F for file:T for text), sender:"", text:"", file:link, timeSent:Date, extension}
        photo: "", //securl_url
        user: "",
        totalPages: 0,
      });
      toast.success("You left the group.");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Toaster />
      <div className="chat-navbar">
        {activeGroup?.photo ? (
          <img
            src={activeGroup?.photo}
            className="chat-navbar-icon"
            alt="Unable to load profile picture"
          />
        ) : (
          <UserIcon classNameProp="chat-navbar-icon" />
        )}
        <span>{activeGroup?.name}</span>
        <React.Fragment>
          <MdManageAccounts
            className="chat-navbar-manage-members"
            onClick={() => {
              manageGroupMembers();
            }}
          />

          <IoExitSharp
            className="chat-navbar-leave-group"
            onClick={() => {
              exitGroup();
            }}
          />
        </React.Fragment>
        <ManageMembersMenu show={show} setShow={setShow} />
      </div>
    </>
  );
};

export default GroupNavbar;
