require('dotenv').config();
const fs = require('fs');
const pdfParse = require('pdf-parse');
const OpenAI = require('openai');
const axios = require('axios');

const BACKEND = 'https://eduprep-backend-d34z.onrender.com';

const TOPIC_MAP = {
  Maths: [
    'Algebra', 'Quadratic Equations', 'Functions', 'Trigonometry', 'Calculus',
    'Differentiation', 'Integration', 'Vectors', 'Matrices', 'Statistics',
    'Probability', 'Sequences and Series', 'Binomial Theorem', 'Geometry',
    'Coordinate Geometry', 'Complex Numbers', 'Logarithms', 'Exponentials',
    'Permutations and Combinations', 'Sets', 'Straight Lines', 'Circles',
    'Polynomials', 'Surds and Indices', 'Inequalities', 'Simultaneous Equations'
  ]
};

async function main() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Step 1: Extract text from PDF
  console.log('📄 Reading PDF...');
  const pdfs = [
    { path: 'C:\\Users\\krish\\Downloads\\0580_w25_qp_41 (1).pdf', paper: '41' },
    { path: 'C:\\Users\\krish\\Downloads\\0580_w25_qp_42.pdf',     paper: '42' },
    { path: 'C:\\Users\\krish\\Downloads\\0580_w25_qp_43.pdf',     paper: '43' },
  ];

  let allQuestions = [];

  for (const pdf of pdfs) {
    console.log(`\n📄 Processing Paper ${pdf.paper}...`);
    const buffer = fs.readFileSync(pdf.path);
    const data = await pdfParse(buffer);
    console.log(`   Text extracted: ${data.text.length} chars`);

    const prompt = `You are an expert at extracting exam questions from Cambridge IGCSE past papers.

Extract ALL questions from this IGCSE Mathematics (0580) paper ${pdf.paper} and return a JSON object with a "questions" array.

For each question return:
{
  "type": "STRUCTURED",
  "questionText": "full question text including all parts (a), (b), (c) etc",
  "marks": total marks for the whole question (number),
  "topic": "best matching topic from: ${TOPIC_MAP.Maths.join(', ')}",
  "subtopic": "more specific subtopic",
  "difficulty": "Easy/Medium/Hard",
  "markscheme": ""
}

Rules:
- Include ALL questions, even multi-part ones
- Preserve mathematical notation as best as possible
- Infer difficulty: Easy (1-4 marks), Medium (5-8 marks), Hard (9+ marks)
- Return ONLY valid JSON

PDF Text:
${data.text.substring(0, 14000)}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.1
    });

    const result = JSON.parse(response.choices[0].message.content);
    const questions = (result.questions || []).map(q => ({
      ...q,
      board: 'IGCSE',
      subject: 'Maths',
      examType: '',
      year: 2025,
      paperNumber: pdf.paper,
      source: `IGCSE Maths 2025 P${pdf.paper}`,
      verified: true
    }));

    console.log(`   ✅ Extracted ${questions.length} questions from Paper ${pdf.paper}`);
    allQuestions = [...allQuestions, ...questions];
  }

  console.log(`\n✅ Total: ${allQuestions.length} questions from all 3 papers`);
  const tagged = allQuestions;

  // Save to JSON for review
  fs.writeFileSync('extracted_questions.json', JSON.stringify(tagged, null, 2));
  console.log('💾 Saved to extracted_questions.json');

  // Step 4: Register admin on live backend
  console.log('\n👤 Creating admin account on live backend...');
  let token;
  try {
    const reg = await axios.post(`${BACKEND}/api/auth/register`, {
      name: 'Admin',
      email: 'admin@eduprep.com',
      password: 'Admin@123',
      board: '',
      subjects: []
    });
    token = reg.data.token;
    console.log('✅ Admin registered');
  } catch {
    // Already exists — login instead
    const login = await axios.post(`${BACKEND}/api/auth/login`, {
      email: 'admin@eduprep.com',
      password: 'Admin@123'
    });
    token = login.data.token;
    console.log('✅ Admin logged in');
  }

  // Step 5: Upload questions via live API
  console.log(`\n📤 Uploading ${tagged.length} questions to live database...`);
  const save = await axios.post(`${BACKEND}/api/upload/save`,
    { questions: tagged },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  console.log(`✅ ${save.data.count} questions saved to Atlas!`);

  // Step 6: Upgrade admin role directly won't work without DB access
  // But we can check
  console.log('\n🎉 Done! Questions are now live at https://eduprep-neon.vercel.app');
  console.log('\n📊 Questions by topic:');
  const byTopic = {};
  tagged.forEach(q => { byTopic[q.topic] = (byTopic[q.topic] || 0) + 1; });
  Object.entries(byTopic).forEach(([t, n]) => console.log(`   ${t}: ${n}`));
}

main().catch(err => {
  console.error('Error:', err.response?.data || err.message);
  process.exit(1);
});
