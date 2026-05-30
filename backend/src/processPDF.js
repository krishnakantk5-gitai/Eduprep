require('dotenv').config();
const fs = require('fs');
const mongoose = require('mongoose');
const { extractQuestionsFromPDF } = require('./services/pdfParser');

const userSchema = new mongoose.Schema({ name: String, email: String, password: String, role: String });
const User = mongoose.model('User', userSchema);

const questionSchema = new mongoose.Schema({
  type: String, board: String, subject: String, examType: String,
  topic: String, subtopic: String, difficulty: String,
  year: Number, paperNumber: String,
  questionText: String,
  options: [{ label: String, text: String }],
  correctAnswer: String,
  marks: Number, markscheme: String,
  source: String, uploadedBy: mongoose.Schema.Types.ObjectId,
  verified: Boolean, createdAt: { type: Date, default: Date.now }
});
const Question = mongoose.model('Question', questionSchema);

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB Atlas');

  const admin = await User.findOne({ email: 'admin@eduprep.com' });
  const adminId = admin?._id;

  const pdfPath = 'C:\\Users\\krish\\Downloads\\0606_w25_qp_21.pdf';
  const buffer = fs.readFileSync(pdfPath);

  console.log('📄 Extracting questions from PDF using AI...');

  const questions = await extractQuestionsFromPDF(buffer, {
    board: 'IGCSE',
    subject: 'Maths',
    year: 2025,
    paper: '21',
    examType: ''
  });

  console.log(`✅ Extracted ${questions.length} questions`);

  const tagged = questions.map(q => ({
    ...q,
    verified: true,
    uploadedBy: adminId
  }));

  await Question.insertMany(tagged);
  console.log(`✅ Saved ${tagged.length} questions to Atlas database`);

  // Summary
  const byTopic = {};
  questions.forEach(q => { byTopic[q.topic] = (byTopic[q.topic] || 0) + 1; });
  console.log('\n📊 Questions by topic:');
  Object.entries(byTopic).forEach(([t, n]) => console.log(`   ${t}: ${n}`));

  await mongoose.disconnect();
  console.log('\n🎉 Done! Questions are live on your website.');
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
