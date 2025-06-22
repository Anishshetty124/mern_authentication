import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized, please login again" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    req.userId = decoded.id; // ✅ Attach userId directly to req

    next(); // ✅ Go to the next middleware/controller

  } catch (error) {
    res.status(401).json({ success: false, message: "Unauthorized, login again" });
  }
};

export default userAuth;
