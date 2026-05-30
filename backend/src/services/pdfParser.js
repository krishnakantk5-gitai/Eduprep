const pdfParse = require('pdf-parse');
const OpenAI = require('openai');

// Lazy init — only created when PDF upload is actually used
let openai = null;
function getOpenAI() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set. Add it in your environment variables to use PDF upload.');
    }
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

const TOPIC_MAP = {
  Maths: [
    'Algebra', 'Quadratics', 'Functions', 'Trigonometry', 'Calculus',
    'Differentiation', 'Integration', 'Vectors', 'Matrices', 'Statistics',
    'Probability', 'Sequences', 'Series', 'Binomial', 'Geometry',
    'Coordinate Geometry', 'Complex Numbers', 'Logarithms', 'Exponentials',
    'Number Theory', 'Permutations', 'Combinations', 'Mechanics', 'Sets'
  ],
  CS: [
    'Data Types', 'Variables', 'Loops', 'Conditionals', 'Functions',
    'Arrays', 'Linked Lists', 'Stacks', 'Queues', 'Trees', 'Graphs',
    'Sorting', 'Searching', 'Recursion', 'Object Oriented Programming',
    'Databases', 'SQL', 'Networking', 'Operating Systems', 'Boolean Logic',
    'Binary', 'Hexadecimal', 'Algorithms', 'Pseudocode', 'Hardware'
  ]
};

async function extractQuestionsFromPDF(buffer, meta) {
  const data = await pdfParse(buffer);
  const text = data.text;

  const prompt = `You are an expert at extracting exam questions from past papers.

Given the following text extracted from a ${meta.board} ${meta.subject} past paper (Year: ${meta.year}, Paper: ${meta.paper}), extract all questions and return a JSON array.

For each question, return:
{
  "type": "MCQ" or "STRUCTURED",
  "questionText": "the question text",
  "options": [{"label": "A", "text": "..."}, ...] (only for MCQ),
  "correctAnswer": "A/B/C/D" (only for MCQ, leave empty if unknown),
  "marks": number (for structured questions),
  "markscheme": "marking guidelines if present",
  "topic": "best matching topic from: ${TOPIC_MAP[meta.subject]?.join(', ')}",
  "subtopic": "more specific subtopic if identifiable",
  "difficulty": "Easy/Medium/Hard"
}

Rules:
- Only extract clear, complete questions
- For MCQ, always include all options
- Infer difficulty: Easy (straightforward recall), Medium (application), Hard (multi-step/complex)
- Match topic to the provided list as closely as possible
- Return ONLY valid JSON array, no extra text

PDF Text:
${text.substring(0, 12000)}`;

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.2
  });

  const result = JSON.parse(response.choices[0].message.content);
  const questions = result.questions || result;

  return questions.map((q) => ({
    ...q,
    board: meta.board,
    subject: meta.subject,
    examType: meta.examType || '',
    year: meta.year,
    paperNumber: meta.paper,
    source: `${meta.board} ${meta.subject} ${meta.year} P${meta.paper}`,
    verified: false
  }));
}

module.exports = { extractQuestionsFromPDF };
