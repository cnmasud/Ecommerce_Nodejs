var { User, Role } = require("../models/user");
var { hashPass, authUser } = require("../auth");
const jwt = require("jsonwebtoken");

// User Registration
async function userRegister(req, res, next) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email, and password are required.",
      });
    }

    // Check if the user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "There is an existing account associated with this email.",
      });
    }

    // Hash password
    const hashedPass = await hashPass(password);

    // Assign "user" role to the new user
    const userRole = await Role.findOne({ name: "user" });
    if (!userRole) {
      return res.status(500).json({
        success: false,
        message: "Default 'user' role not found. Please seed roles first.",
      });
    }

    const newUser = new User({
      username,
      email,
      password: hashedPass,
      role: userRole._id,
      name: "",
      avatar: "",
      phone: "",
      address: {
        country: "",
        province: "",
        city: "",
        postCode: "",
        street: "",
      },
    });

    await newUser.save();

    // Add the user to the "user" role
    await Role.findOneAndUpdate(
      { name: "user" },
      { $push: { users: newUser._id } },
      { new: true },
    );

    // Return user without password
    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json({ success: true, user: userObj });
  } catch (err) {
    next(err);
  }
}

// User Login
async function userLogin(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email }).populate("role");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const match = await authUser(password, user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role ? user.role.name : "user",
        email: user.email,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );

    res.json({ success: true, token });
  } catch (err) {
    next(err);
  }
}

// Change user password
async function changePass(req, res, next) {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "email, oldPassword, and newPassword are required.",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const match = await authUser(oldPassword, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Wrong current password." });
    }

    const hashedNewPass = await hashPass(newPassword);
    await User.findOneAndUpdate(
      { email },
      { password: hashedNewPass },
      { new: true },
    );

    res.json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    next(err);
  }
}

// Show user profile
async function showUser(req, res, next) {
  try {
    if (!req.query.userID) {
      return res.status(400).json({ success: false, message: "userID is required" });
    }
    const user = await User.findById(req.query.userID).select("-password -role");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
}

// Update user profile
async function updateUser(req, res, next) {
  try {
    if (!req.query.userID) {
      return res.status(400).json({ success: false, message: "userID is required" });
    }

    // If there is a new avatar
    if (req.file) {
      const pathMatch = /(\/uploads)(.+)/g.exec(req.file.path);
      if (pathMatch) {
        await User.findByIdAndUpdate(
          req.query.userID,
          { avatar: pathMatch[0] },
          { new: true },
        );
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.query.userID,
      {
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        address: {
          country: req.body.country,
          province: req.body.province,
          city: req.body.city,
          postCode: req.body.postCode,
          street: req.body.street,
        },
      },
      { new: true },
    );

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  userRegister,
  userLogin,
  changePass,
  showUser,
  updateUser,
};
