import { useEffect, useState } from "react";
import { getRoomSharedKey } from "../functions/encryptionFunctions";

export const useSharedKey = (activeChat) => {
  const [sharedKey, setSharedKey] = useState("");
  useEffect(() => {
    if (activeChat?.room) {
      setSharedKey(getRoomSharedKey(activeChat.room));
    }
  }, [activeChat?.room]);
  return sharedKey;
};
