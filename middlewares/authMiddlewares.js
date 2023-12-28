import JWT from "jsonwebtoken";

export const isLoggedIn = (req, res, next) => {
  try {
    const decode = JWT.verify(req.headers.authorization, process.env.JWT_KEY);
    req.user = decode;
    next();
  } catch (error) {
    console.log(error);
  }
};
