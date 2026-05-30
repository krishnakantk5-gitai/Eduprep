const Worksheet = require('../models/Worksheet');
const Question = require('../models/Question');

exports.generateWorksheet = async (req, res) => {
  try {
    const { board, subject, topic, difficulty, examType, years, count = 10, timeLimit = 30 } = req.body;

    const filter = { board, subject, verified: true };
    if (topic) filter.topic = new RegExp(topic, 'i');
    if (difficulty && difficulty !== 'Mixed') filter.difficulty = difficulty;
    if (board === 'IIT_JEE' && examType && examType !== 'BOTH') filter.examType = examType;
    // years is an array e.g. [2021, 2022, 2023]; empty/missing means all years
    if (years && years.length > 0) filter.year = { $in: years.map(Number) };

    const questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: Number(count) } },
      { $project: { correctAnswer: 0, markscheme: 0 } }
    ]);

    if (questions.length === 0) {
      return res.status(404).json({ message: 'No questions found for the selected filters' });
    }

    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);

    const examLabel = board === 'IIT_JEE' && examType && examType !== 'BOTH'
      ? ` (${examType === 'MAIN' ? 'JEE Main' : 'JEE Advanced'})`
      : board === 'IIT_JEE' ? ' (Main + Advanced)' : '';

    const worksheet = await Worksheet.create({
      title: `${board.replace('_', ' ')} ${subject}${examLabel} - ${topic || 'Mixed'} Worksheet`,
      createdBy: req.user._id,
      board,
      subject,
      topic: topic || 'Mixed',
      difficulty: difficulty || 'Mixed',
      questions: questions.map(q => q._id),
      totalMarks,
      timeLimit: Number(timeLimit)
    });

    await worksheet.populate('questions');
    res.status(201).json({ worksheet });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getWorksheet = async (req, res) => {
  try {
    const worksheet = await Worksheet.findById(req.params.id)
      .populate({ path: 'questions', select: '-correctAnswer -markscheme' });
    if (!worksheet) return res.status(404).json({ message: 'Worksheet not found' });
    res.json({ worksheet });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyWorksheets = async (req, res) => {
  try {
    const worksheets = await Worksheet.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .select('-questions');
    res.json({ worksheets });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
