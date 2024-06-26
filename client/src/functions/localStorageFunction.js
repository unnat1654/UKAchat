import axios from "axios";

export const addMessageToLocalStorage = (
  room,
  { format, sent, text, iv, file, extension, timeSent }
) => {
  let olderMessages = localStorage.getItem(`room${room}`)
    ? JSON.parse(localStorage.getItem(`room${room}`))
    : [];
  olderMessages.push({ format, sent, text, iv, file, extension, timeSent });
  localStorage.setItem(`room${room}`, JSON.stringify(olderMessages));
  window.dispatchEvent(new Event("storage"));
};

// This function saves all the messages that were sent using web sockets to the server
export const saveAllOldMessages = async () => {
  const allMessages = [];
  let totalMessages = 0;
  const rooms = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("room")) {
      const messages = JSON.parse(localStorage.getItem(key));
      totalMessages += messages.length;
      chatObject = {
        room: key.slice(4),
        messages: JSON.parse(localStorage.getItem(key)),
      };
      allMessages.push(chatObject);
      rooms.push(key);
    }
  }
  if (totalMessages < 75) {
    return;
  } else {
    try {
      console.log(allMessages)
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER}/message/save-backup-messages`,
        allMessages
      );
      if (data?.success) {
        rooms.forEach((room) => {
          localStorage.removeItem(room);
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
};

// This function saves all the messages in a room that were sent using web sockets to the server
export const roomSaveOldMessages = async (room) => {
  if (localStorage.getItem(`room${room}`)) {
    const messages=JSON.parse(localStorage.getItem(`room${room}`)).map((message)=>{
      return {
        format:message.format,
        iv:message.iv,
        text:message.text,
        timeSent:message.timeSent,
        doc:message.file,
        extension:message.extension,
        sent:message.sent
      };
    });

    const { data } = await axios.post(
      `${import.meta.env.VITE_SERVER}/message/save-backup-messages`,
      [{ room, messages }]
    );
    localStorage.removeItem(`room${room}`);
    return data;
  }
  return { success: true };
};

//Get the messages stored in localStorage for a room
export const getRoomLSMessages = (room, required) => {
  if (!required) localStorage.removeItem(`room${room}`); //in case new messages are found, then these messages must have been saved to db already so remove them
  if (localStorage.getItem(`room${room}`)) {
    return JSON.parse(localStorage.getItem(`room${room}`));
  } else return [];
};

//Get first and last time
export const getLSMsgTimeRange = (room) => {
  if (localStorage.getItem(`room${room}`)) {
    let messages = JSON.parse(localStorage.getItem(`room${room}`));
    return [messages[0].timeSent, messages[messages.length - 1].timeSent];
  }
  return [0, 0];
};
