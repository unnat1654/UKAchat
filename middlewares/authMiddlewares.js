import JWT from "jsonwebtoken";

export const isLoggedIn = (req, res, next) => {
  try {
    const decodedToken = JWT.decode(req.headers.authorization, {
      complete: true,
    });
    if (decodedToken && decodedToken.payload.exp) {
      const expirationTime = decodedToken.payload.exp;
      const currentTime = Math.floor(Date.now() / 1000);

      if (currentTime > expirationTime) {
        return res.status(401).send({
          success: false,
          message: "Token expired. Please login again",
        });
      } else {
        const decode = JWT.verify(
          req.headers.authorization,
          process.env.JWT_SECRET
        );
        req.user = decode;
        next();
      }
    } else {
      console.log("Invalid token format");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      authToken: req.headers.authorization,
    });
  }
};
