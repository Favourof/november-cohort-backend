const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

const verificationToken = (email) =>
  jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1d" });

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const verification = verificationToken(email);
    console.log(verification);

    user = await User.create({
      name,
      email,
      password: hashed,
      verification,
    });

    const url = `${process.env.BASE_URL}/api/auth/verify/${verification}`;

    await sendEmail(
      email,
      "Verify Your Email",
      `<p>Click here to verify your email:</p><a href="${url}">${url}</a>`
    );

    res.json({
      msg: "Registration successful! Check your email for verification link.",
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    if (!user || !user.verificationToken)
      return res.status(400).json({ msg: "Invalid token" });
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    console.log(user.verificationToken);

    res.json({ msg: "Email verified successfully!" });
  } catch (error) {
    res.status(500).json({ msg: "Expired or invalid token" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });
    const verification = verificationToken(email);
    const url = `${process.env.BASE_URL}/api/auth/verify/${verification}`;
    if (!user.isVerified) {
      sendEmail(
        email,
        "verify your email",
        `<p>Click here to verify your email:</p><a href="${url}">${url}</a>`
      );
      return res.status(403).json({ msg: "Please verify your email first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // const token = jwt.sign(
    //     { id: user._id },
    //     process.env.JWT_SECRET,
    //     { expiresIn: "7d" }
    // );

    res.json({ msg: "Login successful" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
