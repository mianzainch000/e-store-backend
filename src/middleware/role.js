require("dotenv").config();

SECRET_KEY = process.env.SECRET_KEY;

const roleAdmin = (req, res, next) => {
  const role = req.user.role;
  if (role !== "admin") {
    return res.status(400).send({
      message: "Access Denied. Only admin can update status",
    });
  }
  next();
};

module.exports = roleAdmin;
