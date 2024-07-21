import axios from "axios";

export const useSendGroupMessages = (activeGroup, setActiveGroup, page) => {
  const addGroupLiveMessage = async (
    group,
    format,
    text,
    file,
    sent,
    extension,
    timeSent
  ) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER}/group/send-group-message-api`,
        {
          group,
          text: text || "",
          doc: file || "",
          extension,
          timeSent,
        }
      );
      if (!data?.success) {
        return;
      }
    } catch (error) {
      console.log(error);
    }

    if (group == activeGroup.group && page <= 2) {
      setActiveGroup((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            format,
            sender: activeGroup?.user,
            sent: true,
            text,
            file,
            timeSent,
            extension,
          },
        ], //format {format:bool(F for file:T for text), sender:"userid" sent:bool, text:"", file:link, timeSent:Date, extension}
      }));
    }
  };

  return { addGroupLiveMessage };
};
