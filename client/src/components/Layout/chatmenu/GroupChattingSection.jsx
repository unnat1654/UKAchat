import { useCallback, useEffect, useState } from "react";
import GroupNavbar from "../../group/GroupNavbar";
import GroupMain from "../../group/GroupMain";
import { useGroupDetailsArray } from "../../../context/groupDetailsContext";
import { useActiveGroup } from "../../../context/activeGroupContext";

const GroupChattingSection = () => {
  const [activeGroup, setActiveGroup] = useActiveGroup();
  const [groupDetailsArray, setGroupDetailsArray] = useGroupDetailsArray();

  const setActiveGroupDetails = useCallback(() => {
    if (!groupDetailsArray || !activeGroup?.group) return;
    const groupObject = groupDetailsArray.find(
      (groupDetailsObject) => groupDetailsObject._id == activeGroup.group
    );
    if (!groupObject) {
      return;
    }
    setActiveGroup((prev) => ({
      ...prev,
      name: groupObject?.name,
      description: groupObject?.description,
      admin: groupObject?.admin,
      members: groupObject?.members,
      photo: groupObject?.photo?.secure_url,
    }));
  }, [groupDetailsArray, activeGroup.group]);
  useEffect(() => {
    setActiveGroupDetails();
  }, [setActiveGroupDetails]);

  return (
    <div className="chattingsection">
      <>
        <GroupNavbar />
        <GroupMain />
      </>
    </div>
  );
};

export default GroupChattingSection;
