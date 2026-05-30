const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

exports.register = async (req, res) => {
  try {
    const { name, email, password, board, subjects } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, board, subjects });
    const token = signToken(user._id);
    res.status(201).json({ token, user: { id: user._id, name, email, role: user.role, board, subjects } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = signToken(user._id);
    res.json({ token, user: { id: user._id, name: user.name, email, role: user.role, board: user.board, subjects: user.subjects } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, board, subjects } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, board, subjects },
      { new: true, select: '-password' }
    );
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
