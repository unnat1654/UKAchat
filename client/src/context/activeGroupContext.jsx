import { useContext, createContext, useState } from "react";

const ActiveGroupContext = createContext();
const ActiveGroupProvider = ({ children }) => {
  const [activeGroup, setActiveGroup] = useState({
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

  return (
    <ActiveGroupContext.Provider value={[activeGroup, setActiveGroup]}>
      {children}
    </ActiveGroupContext.Provider>
  );
};

const useActiveGroup = () => useContext(ActiveGroupContext);

export { useActiveGroup, ActiveGroupProvider };
