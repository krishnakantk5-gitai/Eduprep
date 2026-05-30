const Question = require('../models/Question');

exports.getQuestions = async (req, res) => {
  try {
    const { board, subject, topic, difficulty, type, examType, page = 1, limit = 20 } = req.query;
    const filter = { verified: true };
    if (board) filter.board = board;
    if (subject) filter.subject = subject;
    if (topic) filter.topic = new RegExp(topic, 'i');
    if (difficulty) filter.difficulty = difficulty;
    if (type) filter.type = type;
    if (board === 'IIT_JEE' && examType && examType !== 'BOTH') filter.examType = examType;

    const total = await Question.countDocuments(filter);
    const questions = await Question.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-correctAnswer -markscheme');

    res.json({ questions, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTopics = async (req, res) => {
  try {
    const { board, subject } = req.query;
    const filter = { verified: true };
    if (board) filter.board = board;
    if (subject) filter.subject = subject;
    const topics = await Question.distinct('topic', filter);
    res.json({ topics: topics.sort() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).select('-correctAnswer -markscheme');
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json({ question });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin only
exports.createQuestion = async (req, res) => {
  try {
    const question = await Question.create({ ...req.body, uploadedBy: req.user._id, verified: true });
    res.status(201).json({ question });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json({ question });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, { verified: true }, { new: true });
    res.json({ question });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
