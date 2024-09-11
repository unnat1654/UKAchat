import { createContext, useContext, useState } from "react";

const GroupDetailsContext = createContext();
const GroupDetailsProvider = ({ children }) => {
  const [groupDetailsArray, setGroupDetailsArray] = useState([]);
  return (
    <GroupDetailsContext.Provider
      value={[groupDetailsArray, setGroupDetailsArray]}
    >
      {children}
    </GroupDetailsContext.Provider>
  );
};

const useGroupDetailsArray = () => useContext(GroupDetailsContext);
export { useGroupDetailsArray, GroupDetailsProvider };
