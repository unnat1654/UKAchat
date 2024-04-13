export const hasUpperStr = (str) => {
  return /[A-Z]/.test(str);
};

export const hasLowerStr = (str) => {
  return /[a-z]/.test(str);
};

export const hasNumber = (str) => {
  return /\d/.test(str);
};

export const getFileType = (str)=>{
  const typeMatch = base64String.match(/^data:(.*?);base64,/);

    if (typeMatch && typeMatch.length > 1) {
        const fileTypeParts = typeMatch[1].split('/'); 
        return fileTypeParts[0];
    } else {
      const fileTypeParts = str.split('/'); //cloudinary link: https://res.cloudinary.com/x5fsdgeq3/image/upload/v1703795447/profile/tq6dwogehaaxfzujzasg.png
      if(fileTypeParts.length>5) return fileTypeParts[4];
      else return ""
    }
}