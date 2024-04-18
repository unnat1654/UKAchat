export const hasUpperStr = (str) => {
  return /[A-Z]/.test(str);
};

export const hasLowerStr = (str) => {
  return /[a-z]/.test(str);
};

export const hasNumber = (str) => {
  return /\d/.test(str);
};

export const getFileType = (extension) => {
  console.log(extension);
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"];
  const audioExtensions = [
    "mp3",
    "wav",
    "ogg",
    "aac",
    "flac",
    "aiff",
    "aif",
    "wma",
    "m4a",
  ];
  const videoExtensions = [
    "mp4",
    "webm",
    "ogg",
    "avi",
    "mov",
    "mkv",
    "flv",
    "wmv",
    "m4v",
  ];

  if (audioExtensions.some((ext) => ext.toLowerCase() === extension)) {
    return "audio";
  } else if (imageExtensions.some((ext) => ext.toLowerCase() === extension)) {
    return "image";
  } else if (videoExtensions.some((ext) => ext.toLowerCase() === extension)) {
    return "video";
  } else {
    return "document";
  }

  // const typeMatch = str.match(/^data:(.*?);base64,/);

  // if (typeMatch && typeMatch.length > 1) {
  //   const fileTypeParts = typeMatch[1].split("/");
  //   return fileTypeParts[0];
  // } else {
  //   const fileTypeParts = str.split("/"); //cloudinary link: https://res.cloudinary.com/x5fsdgeq3/image/upload/v1703795447/profile/tq6dwogehaaxfzujzasg.png
  //   if (fileTypeParts.length > 5) return fileTypeParts[4];
  //   else return "";
  // }
};
export const chunkString = (str, length) => {
  return str.match(new RegExp(".{1," + length + "}", "g"));
};
