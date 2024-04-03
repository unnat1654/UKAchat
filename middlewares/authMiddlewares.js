import JWT from "jsonwebtoken";

export const isLoggedIn = (req, res, next) => {
  try {
    const decode = JWT.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    req.user = decode;
    if(req.user){next();}
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      authToken: req.headers.authorization,
    });
  }
};
