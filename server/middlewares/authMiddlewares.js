import JWT from "jsonwebtoken";

export const isLoggedIn = (req, res, next) => {
  try {
    const decodedToken = JWT.decode(req.headers.authorization, {
      complete: true,
    });
    if (!decodedToken) {
      return res.status(401).send({
        success: false,
        message: "token not valid",
      });
    }
    // const expirationTime = decodedToken.payload.exp;
    // const currentTime = Math.floor(Date.now() / 1000);

    // if (currentTime > expirationTime) {
    //   
    // } else {
    const decode = JWT.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    req.user = decode;
    // }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      authToken: req.headers.authorization,
    });
  }
};
