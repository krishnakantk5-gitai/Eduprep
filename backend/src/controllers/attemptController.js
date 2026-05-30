const Attempt = require('../models/Attempt');
const Worksheet = require('../models/Worksheet');
const Question = require('../models/Question');

exports.submitAttempt = async (req, res) => {
  try {
    const { worksheetId, answers, timeTaken } = req.body;

    const worksheet = await Worksheet.findById(worksheetId).populate('questions');
    if (!worksheet) return res.status(404).json({ message: 'Worksheet not found' });

    // Auto-grade answers
    const gradedAnswers = await Promise.all(
      answers.map(async (ans) => {
        const question = await Question.findById(ans.questionId);
        if (!question) return null;

        let isCorrect = false;
        let marksAwarded = 0;

        if (question.type === 'MCQ') {
          isCorrect = ans.selectedOption === question.correctAnswer;
          marksAwarded = isCorrect ? (question.marks || 1) : 0;
        }

        return {
          question: ans.questionId,
          selectedOption: ans.selectedOption || '',
          writtenAnswer: ans.writtenAnswer || '',
          isCorrect,
          marksAwarded
        };
      })
    );

    const validAnswers = gradedAnswers.filter(Boolean);
    const score = validAnswers.reduce((sum, a) => sum + a.marksAwarded, 0);
    const totalMarks = worksheet.totalMarks || validAnswers.length;
    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

    const attempt = await Attempt.create({
      student: req.user._id,
      worksheet: worksheetId,
      answers: validAnswers,
      score,
      totalMarks,
      percentage,
      timeTaken,
      completed: true,
      submittedAt: new Date()
    });

    res.status(201).json({ attempt, score, totalMarks, percentage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAttemptResult = async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.id)
      .populate({
        path: 'answers.question',
        select: '+correctAnswer +markscheme +markschemeImageUrl'
      })
      .populate('worksheet');

    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
    if (attempt.student.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json({ attempt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyAttempts = async (req, res) => {
  try {
    const attempts = await Attempt.find({ student: req.user._id })
      .populate('worksheet', 'title board subject topic')
      .sort({ createdAt: -1 });
    res.json({ attempts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProgress = async (req, res) => {
  try {
    const attempts = await Attempt.find({ student: req.user._id, completed: true })
      .populate('worksheet', 'board subject topic');

    // Build topic-wise stats
    const topicStats = {};
    attempts.forEach((attempt) => {
      const key = `${attempt.worksheet.board}_${attempt.worksheet.subject}_${attempt.worksheet.topic}`;
      if (!topicStats[key]) {
        topicStats[key] = {
          board: attempt.worksheet.board,
          subject: attempt.worksheet.subject,
          topic: attempt.worksheet.topic,
          attempts: 0,
          totalScore: 0,
          totalMarks: 0
        };
      }
      topicStats[key].attempts++;
      topicStats[key].totalScore += attempt.score;
      topicStats[key].totalMarks += attempt.totalMarks;
    });

    const stats = Object.values(topicStats).map((s) => ({
      ...s,
      avgPercentage: s.totalMarks > 0 ? Math.round((s.totalScore / s.totalMarks) * 100) : 0
    }));

    const weakTopics = stats.filter((s) => s.avgPercentage < 50).sort((a, b) => a.avgPercentage - b.avgPercentage);
    const recentAttempts = attempts.slice(0, 10);

    res.json({ stats, weakTopics, recentAttempts, totalAttempts: attempts.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
