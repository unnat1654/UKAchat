import { useContext, createContext, useState, useEffect } from "react";
import { useContactDetailsArray } from "./ContactDetailsContext";

const ActiveChatContext = createContext();
const ActiveChatProvider = ({ children }) => {
  const [contactDetailsArray,setContactDetailsArray]=useContactDetailsArray([]);
  const [activeChat, setActiveChat] = useState({
    room: "",
    username: "",
    messages: [],
    online: false,
    photo:"" //securl_url
  });
  useEffect(() => {
    if(activeChat?.room && contactDetailsArray!=[]){
      const contactObject=contactDetailsArray.find((contactDetailsObject)=>contactDetailsObject.room===activeChat.room);
      
      if(contactObject){
        setActiveChat({...activeChat,username:contactObject.username,photo:contactObject?.photo?.securl_url})
      }
    }
    
  }, [activeChat?.room]);

  return (
    <ActiveChatContext.Provider value={[activeChat, setActiveChat]}>
      {children}
    </ActiveChatContext.Provider>
  );
};

const useActiveChat = () => useContext(ActiveChatContext);

export { useActiveChat, ActiveChatProvider };
