import { useContext, createContext, useState } from "react";

const ActiveChatContext = createContext();
const ActiveChatProvider = ({ children }) => {
  const [activeChat, setActiveChat] = useState({
    c_id: "",
    room: "",
    username: "",
    messages: [], //format {format:bool(F for file:T for text), sent:bool, text:"", file:link, timeSent:Date,}
    // switch:false,
    online: false,
    photo: "", //securl_url
  });

  return (
    <ActiveChatContext.Provider value={[activeChat, setActiveChat]}>
      {children}
    </ActiveChatContext.Provider>
  );
};

const useActiveChat = () => useContext(ActiveChatContext);

export { useActiveChat, ActiveChatProvider };
