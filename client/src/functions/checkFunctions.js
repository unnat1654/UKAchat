export const hasUpperStr = (str) => {
  return /[A-Z]/.test(str);
};

export const hasLowerStr = (str) => {
  return /[a-z]/.test(str);
};

export const hasNumber = (str) => {
  return /\d/.test(str);
};
