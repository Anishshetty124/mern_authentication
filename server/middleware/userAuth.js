// Userauth.js is used as a middleware used in api endpoints
//used  to verify the token sent while registration and logging in.
import jwt from "jsonwebtoken";

//when we use next express automatically treats it as a middleware
const userAuth = async (req, res, next) => {

  const {token} = req.cookies; 

  if (!token) {
    return res.json({ message: "Unauthorized, please login again" });
  }
  try {

    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    if (tokenDecode.id) {
      
      req.body.userId = tokenDecode.id; // 👈 You’re attaching userId to body
    
    } else {

      return res.json({ message: "Unauthorized" });
    }

    next(); 
  
  } catch (error) {
    res.status(401).json({ message: "Unauthorized, login again" });
  }
};

export default userAuth;
