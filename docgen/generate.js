const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  PageNumber, Header, Footer, TableOfContents, LevelFormat, PageBreak
} = require('docx');
const fs = require('fs');

// ─── helpers ──────────────────────────────────────────────────────────────────

const PAGE_W = 12240; // US Letter
const PAGE_H = 15840;
const MARGIN  = 1440; // 1 inch
const CONTENT = PAGE_W - MARGIN * 2; // 9360

const BRAND  = '2E4057'; // dark navy
const ACCENT = '4F46E5'; // indigo
const LIGHT  = 'E0E7FF'; // light indigo
const GRAY   = '6B7280';
const WHITE  = 'FFFFFF';
const BLACK  = '111827';

const border1 = { style: BorderStyle.SINGLE, size: 4, color: ACCENT };
const border0 = { style: BorderStyle.NONE,   size: 0, color: 'FFFFFF' };
const cellBorder = (color = 'CCCCCC') => ({ style: BorderStyle.SINGLE, size: 4, color });
const allBorders = (c) => ({ top: cellBorder(c), bottom: cellBorder(c), left: cellBorder(c), right: cellBorder(c) });
const noBorders   = { top: border0, bottom: border0, left: border0, right: border0 };

const sp  = (before, after) => ({ spacing: { before: before * 20, after: after * 20 } });
const ind = (left) => ({ indent: { left } });

const h = (text, level, color = BLACK) =>
  new Paragraph({
    heading: level,
    children: [new TextRun({ text, color })],
    ...sp(14, 6)
  });

const p = (text, opts = {}) =>
  new Paragraph({ children: [new TextRun({ text, size: 22, font: 'Arial', color: opts.color || BLACK })], ...sp(2, 2), ...opts });

const bold = (text, size = 22, color = BLACK) =>
  new TextRun({ text, bold: true, size, font: 'Arial', color });

const run  = (text, size = 22, color = BLACK) =>
  new TextRun({ text, size, font: 'Arial', color });

const code = (text) =>
  new TextRun({ text, font: 'Courier New', size: 18, color: '1e1b4b' });

const spacer = (n = 1) =>
  new Paragraph({ children: [new TextRun('')], ...sp(n * 4, n * 4) });

// ─── table builder ───────────────────────────────────────────────────────────

function makeTable(headers, rows, colWidths) {
  const total = colWidths.reduce((a, b) => a + b, 0);
  const hdrRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) =>
      new TableCell({
        borders: allBorders(ACCENT),
        width: { size: colWidths[i], type: WidthType.DXA },
        shading: { fill: ACCENT, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 140, right: 140 },
        children: [new Paragraph({ children: [bold(h, 20, WHITE)], ...sp(0, 0) })]
      })
    )
  });

  const dataRows = rows.map((row, ri) =>
    new TableRow({
      children: row.map((cell, ci) =>
        new TableCell({
          borders: allBorders('CCCCCC'),
          width: { size: colWidths[ci], type: WidthType.DXA },
          shading: { fill: ri % 2 === 0 ? 'F9FAFB' : WHITE, type: ShadingType.CLEAR },
          margins: { top: 70, bottom: 70, left: 140, right: 140 },
          children: [new Paragraph({ children: [run(cell, 20)], ...sp(0, 0) })]
        })
      )
    })
  );

  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [hdrRow, ...dataRows]
  });
}

// ─── numbered list ────────────────────────────────────────────────────────────

const listItem = (text, ref = 'bullets') =>
  new Paragraph({
    numbering: { reference: ref, level: 0 },
    children: [new TextRun({ text, size: 22, font: 'Arial', color: BLACK })],
    ...sp(1, 1)
  });

// ─── divider ─────────────────────────────────────────────────────────────────

const divider = () =>
  new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'E0E7FF', space: 1 } },
    children: [new TextRun('')],
    ...sp(6, 6)
  });

// ─── code block ──────────────────────────────────────────────────────────────

const codeBlock = (lines) =>
  new Paragraph({
    shading: { fill: 'F3F4F6', type: ShadingType.CLEAR },
    border: { left: border1 },
    children: lines.map((l, i) => i === 0 ? code(l) : new TextRun({ text: '\n' + l, font: 'Courier New', size: 18, color: '1e1b4b', break: 1 })),
    ...sp(4, 4),
    indent: { left: 240 }
  });

// ─── section heading row (colored banner) ────────────────────────────────────

const sectionBanner = (num, title) =>
  new Table({
    width: { size: CONTENT, type: WidthType.DXA },
    columnWidths: [CONTENT],
    rows: [new TableRow({
      children: [new TableCell({
        borders: noBorders,
        shading: { fill: ACCENT, type: ShadingType.CLEAR },
        margins: { top: 120, bottom: 120, left: 200, right: 200 },
        children: [new Paragraph({
          children: [
            new TextRun({ text: `${num}  `, bold: true, size: 28, font: 'Arial', color: LIGHT }),
            new TextRun({ text: title, bold: true, size: 28, font: 'Arial', color: WHITE })
          ],
          ...sp(0, 0)
        })]
      })]
    })]
  });

// ─── tree lines ──────────────────────────────────────────────────────────────

const treeLine = (text) =>
  new Paragraph({ children: [code(text)], ...sp(0, 0) });

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENT
// ═══════════════════════════════════════════════════════════════════════════════

const doc = new Document({
  numbering: {
    config: [
      { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 260 } } } }] },
      { reference: 'numbers', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 260 } } } }] },
    ]
  },
  styles: {
    default: {
      document: { run: { font: 'Arial', size: 22, color: BLACK } }
    },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: 'Arial', color: BRAND },
        paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'Arial', color: ACCENT },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, bold: true, font: 'Arial', color: BRAND },
        paragraph: { spacing: { before: 180, after: 80 }, outlineLevel: 2 } },
    ]
  },

  sections: [
    // ─────────────────────────────────────────────
    // COVER PAGE
    // ─────────────────────────────────────────────
    {
      properties: {
        page: {
          size: { width: PAGE_W, height: PAGE_H },
          margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN }
        }
      },
      children: [
        spacer(10),
        new Table({
          width: { size: CONTENT, type: WidthType.DXA },
          columnWidths: [CONTENT],
          rows: [new TableRow({
            children: [new TableCell({
              borders: noBorders,
              shading: { fill: BRAND, type: ShadingType.CLEAR },
              margins: { top: 600, bottom: 600, left: 600, right: 600 },
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'EduPrep', bold: true, size: 80, font: 'Arial', color: LIGHT })], ...sp(0, 8) }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Coaching Institute Platform', size: 40, font: 'Arial', color: 'A5B4FC' })], ...sp(0, 6) }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '', size: 20 })], ...sp(8, 8) }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Complete Technical Documentation', size: 28, font: 'Arial', color: WHITE })], ...sp(0, 0) }),
              ]
            })]
          })]
        }),
        spacer(4),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Version 1.0  •  May 2026', size: 22, font: 'Arial', color: GRAY })], ...sp(0, 0) }),
        spacer(2),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [bold('MERN Stack  •  MongoDB  •  Express  •  React  •  Node.js', 22, ACCENT)], ...sp(0, 0) }),
        spacer(14),
        new Paragraph({ children: [new PageBreak()] }),
      ]
    },

    // ─────────────────────────────────────────────
    // MAIN CONTENT
    // ─────────────────────────────────────────────
    {
      properties: {
        page: {
          size: { width: PAGE_W, height: PAGE_H },
          margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN }
        }
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            children: [
              bold('EduPrep — Coaching Institute Platform', 18, BRAND),
              new TextRun({ text: '\t', size: 18 }),
              run('Technical Documentation  v1.0', 18, GRAY)
            ],
            tabStops: [{ type: 'right', position: 9360 }],
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LIGHT, space: 1 } },
            ...sp(0, 4)
          })]
        })
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            children: [
              run('© 2026 EduPrep  •  Confidential', 18, GRAY),
              new TextRun({ text: '\t', size: 18 }),
              run('Page ', 18, GRAY),
              new TextRun({ children: [PageNumber.CURRENT], size: 18, font: 'Arial', color: GRAY }),
              run(' of ', 18, GRAY),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, font: 'Arial', color: GRAY }),
            ],
            tabStops: [{ type: 'right', position: 9360 }],
            border: { top: { style: BorderStyle.SINGLE, size: 4, color: LIGHT, space: 1 } },
            ...sp(4, 0)
          })]
        })
      },
      children: [

        // TABLE OF CONTENTS
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: 'Table of Contents', color: BRAND })], ...sp(0, 8) }),
        new TableOfContents('Table of Contents', { hyperlink: true, headingStyleRange: '1-3' }),
        new Paragraph({ children: [new PageBreak()] }),

        // ── SECTION 1 ──────────────────────────────────────────
        sectionBanner('1', 'Project Overview'),
        spacer(1),
        h('What Was Built', HeadingLevel.HEADING_2),
        p('A full-stack MERN (MongoDB, Express, React, Node.js) web application for a coaching institute. Students can generate customised worksheets from past year question papers, practise with a countdown timer, receive instant auto-grading, view markschemes, and track their progress over time. Administrators can upload past paper PDFs, review AI-extracted questions, and manage students.'),
        spacer(1),
        h('Boards & Subjects Covered', HeadingLevel.HEADING_2),
        makeTable(
          ['Board', 'Full Name', 'Subjects Available'],
          [
            ['IGCSE',    'International General Certificate of Secondary Education', 'Maths, CS'],
            ['AS & A Level', 'Cambridge Advanced Subsidiary and Advanced Level',    'Maths, CS'],
            ['IBDP',    'International Baccalaureate Diploma Programme',             'Maths, CS'],
            ['IIT JEE', 'Joint Entrance Examination (Indian Institutes of Technology)', 'Maths'],
          ],
          [2600, 4460, 2300]
        ),
        spacer(1),
        h('Key Highlights', HeadingLevel.HEADING_2),
        listItem('Free access — no subscription or payment required'),
        listItem('AI-powered PDF question extraction using OpenAI GPT-4o-mini'),
        listItem('MCQ auto-grading with instant feedback'),
        listItem('Markscheme shown after submission for structured questions'),
        listItem('Progress dashboard with weak-topic detection'),
        listItem('Admin panel for question management and student oversight'),
        divider(),

        // ── SECTION 2 ──────────────────────────────────────────
        sectionBanner('2', 'Tech Stack'),
        spacer(1),
        makeTable(
          ['Technology', 'Role', 'Version'],
          [
            ['MongoDB',          'NoSQL Database',                    'Latest'],
            ['Express.js',       'Backend REST API framework',        '4.18.2'],
            ['React',            'Frontend UI framework',             '18.2.0'],
            ['Node.js',          'JavaScript runtime',                '24.16.0 (LTS)'],
            ['Mongoose',         'MongoDB object modelling (ORM)',     '8.0.3'],
            ['jsonwebtoken',     'JWT authentication',                '9.0.2'],
            ['bcryptjs',         'Password hashing',                  '2.4.3'],
            ['pdf-parse',        'PDF text extraction',               '1.1.1'],
            ['OpenAI SDK',       'AI question tagging via GPT-4o-mini','4.24.1'],
            ['Multer',           'File upload handling',              '1.4.5'],
            ['Recharts',         'Charts and data visualisation',     '2.10.1'],
            ['React Router',     'Client-side routing',               '6.21.0'],
            ['Axios',            'HTTP client for API calls',         '1.6.2'],
          ],
          [2600, 4200, 2560]
        ),
        divider(),

        // ── SECTION 3 ──────────────────────────────────────────
        sectionBanner('3', 'Folder Structure'),
        spacer(1),
        p('The project is split into two top-level folders: backend (Node/Express API) and frontend (React app).'),
        spacer(1),
        ...[
          'coaching-institute/',
          '├── backend/',
          '│   ├── src/',
          '│   │   ├── config/',
          '│   │   │   └── db.js                 (MongoDB connection)',
          '│   │   ├── models/',
          '│   │   │   ├── User.js               (Student & Admin schema)',
          '│   │   │   ├── Question.js           (Question bank schema)',
          '│   │   │   ├── Worksheet.js          (Worksheet schema)',
          '│   │   │   └── Attempt.js            (Student attempt schema)',
          '│   │   ├── controllers/',
          '│   │   │   ├── authController.js     (Register, Login, Profile)',
          '│   │   │   ├── questionController.js (CRUD for questions)',
          '│   │   │   ├── worksheetController.js(Generate worksheets)',
          '│   │   │   └── attemptController.js  (Submit, grade, progress)',
          '│   │   ├── middleware/',
          '│   │   │   └── auth.js               (JWT protect + adminOnly)',
          '│   │   ├── routes/',
          '│   │   │   ├── auth.js / questions.js / worksheets.js',
          '│   │   │   └── attempts.js / admin.js / upload.js',
          '│   │   ├── services/',
          '│   │   │   └── pdfParser.js          (OpenAI PDF extraction)',
          '│   │   └── server.js               (Express app entry point)',
          '│   ├── .env                      (Environment variables)',
          '│   └── package.json',
          '└── frontend/',
          '    ├── public/index.html',
          '    └── src/',
          '        ├── context/AuthContext.js    (Global auth state)',
          '        ├── utils/api.js              (Axios + interceptors)',
          '        ├── components/Layout.js      (Sidebar navigation)',
          '        ├── pages/',
          '        │   ├── Login.js / Register.js / Profile.js',
          '        │   ├── StudentDashboard.js / MyAttempts.js',
          '        │   ├── WorksheetGenerator.js / WorksheetPractice.js',
          '        │   ├── AttemptResult.js',
          '        │   └── admin/',
          '        │       ├── AdminDashboard.js / AdminStudents.js',
          '        │       ├── AdminUpload.js / AdminQuestions.js',
          '        ├── App.js                    (Route definitions)',
          '        ├── index.js',
          '        └── index.css                 (Global styles)',
        ].map(treeLine),
        divider(),

        // ── SECTION 4 ──────────────────────────────────────────
        sectionBanner('4', 'Database Models'),
        spacer(1),

        h('4.1  User Model', HeadingLevel.HEADING_2),
        makeTable(
          ['Field', 'Type', 'Description'],
          [
            ['name',      'String',   'Full name (required)'],
            ['email',     'String',   'Unique, lowercase (required)'],
            ['password',  'String',   'Hashed with bcrypt (required)'],
            ['role',      'String',   "'student' or 'admin' (default: student)"],
            ['board',     'String',   'IGCSE / AS_A_LEVEL / IBDP / IIT_JEE'],
            ['subjects',  'Array',    "['Maths', 'CS']"],
            ['avatar',    'String',   'Profile image URL'],
            ['createdAt', 'Date',     'Auto timestamp'],
          ],
          [2200, 1800, 5360]
        ),
        spacer(1),

        h('4.2  Question Model', HeadingLevel.HEADING_2),
        makeTable(
          ['Field', 'Type', 'Description'],
          [
            ['type',             'String',   "'MCQ' or 'STRUCTURED' (required)"],
            ['board',            'String',   'IGCSE / AS_A_LEVEL / IBDP / IIT_JEE (required)'],
            ['subject',          'String',   "'Maths' or 'CS' (required)"],
            ['topic',            'String',   'e.g. Algebra, Calculus (required)'],
            ['subtopic',         'String',   'More specific sub-topic'],
            ['difficulty',       'String',   'Easy / Medium / Hard'],
            ['year',             'Number',   'Year of past paper'],
            ['paperNumber',      'String',   'e.g. P1, P2'],
            ['questionText',     'String',   'Full question text (required)'],
            ['imageUrl',         'String',   'Optional question image URL'],
            ['options',          'Array',    'MCQ options [{label, text, imageUrl}]'],
            ['correctAnswer',    'String',   'A / B / C / D for MCQ'],
            ['marks',            'Number',   'Marks for structured questions'],
            ['markscheme',       'String',   'Marking guidelines text'],
            ['source',           'String',   'e.g. IGCSE Maths 2022 P1'],
            ['verified',         'Boolean',  'Admin-verified (default: false)'],
            ['uploadedBy',       'ObjectId', 'Reference to User who uploaded'],
          ],
          [2400, 1600, 5360]
        ),
        spacer(1),

        h('4.3  Worksheet Model', HeadingLevel.HEADING_2),
        makeTable(
          ['Field', 'Type', 'Description'],
          [
            ['title',      'String',   'Auto-generated title (required)'],
            ['createdBy',  'ObjectId', 'Reference to User'],
            ['board',      'String',   'Board filter used when generating'],
            ['subject',    'String',   'Subject filter used'],
            ['topic',      'String',   'Topic filter used'],
            ['difficulty', 'String',   'Easy / Medium / Hard / Mixed'],
            ['questions',  'Array',    'Array of Question ObjectId references'],
            ['totalMarks', 'Number',   'Sum of all question marks'],
            ['timeLimit',  'Number',   'Minutes allowed (default: 30)'],
            ['createdAt',  'Date',     'Auto timestamp'],
          ],
          [2200, 1800, 5360]
        ),
        spacer(1),

        h('4.4  Attempt Model', HeadingLevel.HEADING_2),
        makeTable(
          ['Field', 'Type', 'Description'],
          [
            ['student',     'ObjectId', 'Reference to User (student)'],
            ['worksheet',   'ObjectId', 'Reference to Worksheet'],
            ['answers',     'Array',    '[{question, selectedOption, writtenAnswer, isCorrect, marksAwarded}]'],
            ['score',       'Number',   'Total marks earned'],
            ['totalMarks',  'Number',   'Total possible marks'],
            ['percentage',  'Number',   'Score expressed as a percentage'],
            ['timeTaken',   'Number',   'Seconds taken to complete'],
            ['completed',   'Boolean',  'Whether worksheet was submitted'],
            ['submittedAt', 'Date',     'Submission timestamp'],
          ],
          [2200, 1800, 5360]
        ),
        divider(),

        // ── SECTION 5 ──────────────────────────────────────────
        sectionBanner('5', 'API Endpoints'),
        spacer(1),

        h('5.1  Auth  —  /api/auth', HeadingLevel.HEADING_2),
        makeTable(
          ['Method', 'Endpoint', 'Auth', 'Description'],
          [
            ['POST', '/register', 'No',  'Create a new student account'],
            ['POST', '/login',    'No',  'Login and receive a JWT token'],
            ['GET',  '/me',       'Yes', 'Get the currently logged-in user'],
            ['PUT',  '/profile',  'Yes', 'Update name, board, subjects'],
          ],
          [1100, 2000, 1000, 5260]
        ),
        spacer(1),

        h('5.2  Questions  —  /api/questions', HeadingLevel.HEADING_2),
        makeTable(
          ['Method', 'Endpoint', 'Auth', 'Description'],
          [
            ['GET',   '/',          'Student', 'List questions with filters (board, subject, topic, difficulty)'],
            ['GET',   '/topics',    'Student', 'Get distinct topics for a given board + subject'],
            ['GET',   '/:id',       'Student', 'Get a single question by ID'],
            ['POST',  '/',          'Admin',   'Create a new question manually'],
            ['PUT',   '/:id',       'Admin',   'Update an existing question'],
            ['DELETE','/:id',       'Admin',   'Delete a question'],
            ['PATCH', '/:id/verify','Admin',   'Mark a question as verified'],
          ],
          [1100, 2000, 1200, 5060]
        ),
        spacer(1),

        h('5.3  Worksheets  —  /api/worksheets', HeadingLevel.HEADING_2),
        makeTable(
          ['Method', 'Endpoint',  'Auth',    'Description'],
          [
            ['POST', '/generate', 'Student', 'Generate a worksheet from filter criteria'],
            ['GET',  '/my',       'Student', 'Get all worksheets created by me'],
            ['GET',  '/:id',      'Student', 'Get worksheet with populated questions'],
          ],
          [1100, 2000, 1200, 5060]
        ),
        spacer(1),

        h('5.4  Attempts  —  /api/attempts', HeadingLevel.HEADING_2),
        makeTable(
          ['Method', 'Endpoint',  'Auth',    'Description'],
          [
            ['POST', '/submit',   'Student', 'Submit answers; MCQ auto-graded instantly'],
            ['GET',  '/my',       'Student', 'Get all my past attempts'],
            ['GET',  '/progress', 'Student', 'Get topic-wise stats and weak topics'],
            ['GET',  '/:id',      'Student', 'Get full result with markscheme revealed'],
          ],
          [1100, 2000, 1200, 5060]
        ),
        spacer(1),

        h('5.5  Admin  —  /api/admin', HeadingLevel.HEADING_2),
        makeTable(
          ['Method', 'Endpoint',          'Auth',  'Description'],
          [
            ['GET', '/stats',             'Admin', 'Dashboard counts: students, questions, attempts, pending'],
            ['GET', '/students',          'Admin', 'List all registered students'],
            ['GET', '/questions/pending', 'Admin', 'List all unverified questions'],
          ],
          [1100, 2800, 1200, 4260]
        ),
        spacer(1),

        h('5.6  Upload  —  /api/upload', HeadingLevel.HEADING_2),
        makeTable(
          ['Method', 'Endpoint', 'Auth',  'Description'],
          [
            ['POST', '/pdf',  'Admin', 'Upload PDF; AI extracts and tags questions'],
            ['POST', '/save', 'Admin', 'Save reviewed questions batch to database'],
          ],
          [1100, 1600, 1200, 6460]
        ),
        divider(),

        // ── SECTION 6 ──────────────────────────────────────────
        sectionBanner('6', 'Features Explained'),
        spacer(1),

        h('6.1  Student Registration & Login', HeadingLevel.HEADING_2),
        listItem('Students register with name, email, password, board, and subjects'),
        listItem('Password is hashed using bcrypt (12 salt rounds) before storing in MongoDB'),
        listItem('On login, a JWT token is issued and expires in 7 days'),
        listItem('Token is stored in browser localStorage and sent as a Bearer header with every API request'),
        listItem('If a token is invalid or expired, the user is automatically redirected to /login'),
        spacer(1),

        h('6.2  Worksheet Generator', HeadingLevel.HEADING_2),
        listItem('Student selects: Board → Subject → Topic (optional) → Difficulty → Number of questions → Time limit'),
        listItem('Backend uses MongoDB $sample aggregation to randomly pick matching verified questions'),
        listItem('A Worksheet document is created in the database and linked to the student'),
        listItem('Student is immediately redirected to the timed practice screen'),
        spacer(1),

        h('6.3  Timed Practice Mode', HeadingLevel.HEADING_2),
        listItem('Countdown timer starts when the student opens the worksheet'),
        listItem('Student navigates between questions using the side panel — answered questions turn green'),
        listItem('Timer turns red and pulses when under 2 minutes remain'),
        listItem('When the timer reaches 0, the worksheet is auto-submitted'),
        listItem('Student can also submit manually at any time'),
        spacer(1),

        h('6.4  Auto Grading', HeadingLevel.HEADING_2),
        listItem('MCQ answers are instantly graded by comparing the selected option with correctAnswer'),
        listItem('Marks are awarded per question; score, totalMarks, and percentage are stored on the Attempt'),
        listItem('Structured questions are not auto-graded — the markscheme is shown for self-assessment'),
        spacer(1),

        h('6.5  Result & Markscheme Review', HeadingLevel.HEADING_2),
        listItem('After submission the student sees their score, percentage, and a performance grade (Excellent / Good / Average / Needs Work)'),
        listItem('Each question can be expanded to reveal the full text, correct answer, and markscheme'),
        listItem('MCQ: wrong answer highlighted red, correct answer highlighted green'),
        listItem("Structured: student's written answer displayed alongside the official markscheme"),
        spacer(1),

        h('6.6  Progress Tracking', HeadingLevel.HEADING_2),
        listItem('Dashboard cards show: Total attempts, Average score, Topics covered, Weak topics count'),
        listItem('Weak topics = any topic where the student’s average percentage is below 50%'),
        listItem('A line chart plots score percentage across the most recent attempts'),
        listItem('Weak topics are listed with colour-coded progress bars (red < 30%, amber < 50%)'),
        spacer(1),

        h('6.7  PDF Upload & AI Question Extraction (Admin)', HeadingLevel.HEADING_2),
        listItem('Admin selects board, subject, year, and paper number, then uploads a PDF file'),
        listItem('pdf-parse extracts raw text from the PDF'),
        listItem('The text is sent to OpenAI GPT-4o-mini with a structured prompt requesting JSON output'),
        listItem('AI returns questions tagged with: type, topic, difficulty, options, correct answer, markscheme'),
        listItem('Admin reviews every extracted question — can edit text, topic, difficulty, options, markscheme or remove bad ones'),
        listItem('On save, questions are stored with verified: false (pending review)'),
        listItem('Admin then verifies individual questions from the Question Bank page'),
        spacer(1),

        h('6.8  Admin Panel', HeadingLevel.HEADING_2),
        listItem('Dashboard: key stats at a glance — total students, questions, attempts, pending reviews'),
        listItem('Upload PDF: full extraction and review workflow'),
        listItem('Question Bank: browse with board/subject filters, verify, and delete questions'),
        listItem('Students: searchable table of all registered students with board and subject info'),
        divider(),

        // ── SECTION 7 ──────────────────────────────────────────
        sectionBanner('7', 'Authentication & Security'),
        spacer(1),
        makeTable(
          ['Mechanism', 'Detail'],
          [
            ['Authentication type',     'Stateless JWT (JSON Web Tokens)'],
            ['Token expiry',            '7 days'],
            ['Password storage',        'bcrypt hash with 12 salt rounds — plain text never stored'],
            ['Protected routes',        'protect middleware verifies JWT on every request'],
            ['Admin routes',            'adminOnly middleware checks role === "admin" after JWT verify'],
            ['CORS',                    'Enabled for frontend-backend communication on localhost'],
            ['Token invalidation',      'Auto-cleared from localStorage on 401 Unauthorized response'],
          ],
          [3200, 6160]
        ),
        divider(),

        // ── SECTION 8 ──────────────────────────────────────────
        sectionBanner('8', 'Environment Variables'),
        spacer(1),
        p('Create a file named .env inside the backend/ folder. A .env.example template is already provided.'),
        spacer(1),
        makeTable(
          ['Variable', 'Description', 'Example Value'],
          [
            ['PORT',          'Backend server port',              '5000'],
            ['MONGO_URI',     'MongoDB connection string',        'mongodb://localhost:27017/coaching_institute'],
            ['JWT_SECRET',    'Secret key for JWT signing',       'any_long_random_string'],
            ['JWT_EXPIRE',    'Token expiry duration',            '7d'],
            ['OPENAI_API_KEY','OpenAI API key for PDF extraction','sk-...'],
            ['NODE_ENV',      'Runtime environment',              'development'],
          ],
          [2600, 3400, 3360]
        ),
        divider(),

        // ── SECTION 9 ──────────────────────────────────────────
        sectionBanner('9', 'How to Run the Project'),
        spacer(1),

        h('9.1  Prerequisites (already installed on this machine)', HeadingLevel.HEADING_2),
        makeTable(
          ['Software', 'Version', 'Status'],
          [
            ['Node.js', 'v24.16.0 (LTS)', 'Installed'],
            ['npm',     'v11.13.0',        'Installed'],
            ['MongoDB', 'Latest',          'Running as Windows Service'],
          ],
          [3600, 3000, 2760]
        ),
        spacer(1),

        h('9.2  Starting the Project', HeadingLevel.HEADING_2),
        p('MongoDB starts automatically as a Windows service — no manual action needed.'),
        spacer(1),
        p('Step 1 — Open a terminal and start the backend:'),
        codeBlock(['cd coaching-institute/backend', 'npm run dev']),
        spacer(1),
        p('Step 2 — Open a second terminal and start the frontend:'),
        codeBlock(['cd coaching-institute/frontend', 'npm start']),
        spacer(1),
        p('Step 3 — Open your browser and go to:'),
        codeBlock(['http://localhost:3000']),
        spacer(1),

        h('9.3  Default Ports', HeadingLevel.HEADING_2),
        makeTable(
          ['Service', 'Port', 'URL'],
          [
            ['React Frontend', '3000', 'http://localhost:3000'],
            ['Express Backend','5000', 'http://localhost:5000'],
            ['MongoDB',        '27017','mongodb://localhost:27017'],
          ],
          [3200, 1600, 4560]
        ),
        divider(),

        // ── SECTION 10 ──────────────────────────────────────────
        sectionBanner('10', 'Creating an Admin Account'),
        spacer(1),
        p('By default every registration creates a student account. To promote a user to admin:'),
        spacer(1),
        listItem('Register normally on the website at http://localhost:3000/register', 'numbers'),
        listItem('Open MongoDB Compass and connect to mongodb://localhost:27017', 'numbers'),
        listItem('Navigate to the coaching_institute database then the users collection', 'numbers'),
        listItem("Find your user document and change the role field from \"student\" to \"admin\"", 'numbers'),
        listItem('Save the document, log out of the website, and log back in', 'numbers'),
        listItem('You will now see the Admin panel in the sidebar navigation', 'numbers'),
        divider(),

        // ── SECTION 11 ──────────────────────────────────────────
        sectionBanner('11', 'Adding Your OpenAI API Key'),
        spacer(1),
        new Paragraph({
          shading: { fill: 'FEF9C3', type: ShadingType.CLEAR },
          border: { left: { style: BorderStyle.SINGLE, size: 8, color: 'F59E0B', space: 1 } },
          children: [bold('Note: ', 22, '92400E'), run('Without the OpenAI API key the PDF upload feature will not work. All other features (manual question entry, worksheets, practice, grading, progress tracking) work without it.', 22, '92400E')],
          indent: { left: 240 },
          ...sp(6, 6)
        }),
        spacer(1),
        listItem('Go to https://platform.openai.com and create an account', 'numbers'),
        listItem('Navigate to API Keys and generate a new key', 'numbers'),
        listItem('Open the file: coaching-institute/backend/.env', 'numbers'),
        listItem('Replace your_openai_api_key_here with your actual key', 'numbers'),
        listItem('Save the file and restart the backend server (npm run dev)', 'numbers'),
        divider(),

        // ── SECTION 12 ──────────────────────────────────────────
        sectionBanner('12', 'Frontend Pages Reference'),
        spacer(1),
        makeTable(
          ['Page', 'Route', 'Access', 'Description'],
          [
            ['Login',               '/login',                     'Public',  'Email + password sign-in'],
            ['Register',            '/register',                  'Public',  'Student registration with board/subject selection'],
            ['Student Dashboard',   '/dashboard',                 'Student', 'Stats, weak topics, performance line chart'],
            ['Worksheet Generator', '/worksheet/generate',        'Student', 'Filter and generate a new worksheet'],
            ['Worksheet Practice',  '/worksheet/:id/practice',    'Student', 'Timed practice with question navigation panel'],
            ['Attempt Result',      '/attempt/:id/result',        'Student', 'Score, grade, full answer review and markscheme'],
            ['My Attempts',         '/attempts',                  'Student', 'History of all past attempts with scores'],
            ['Profile',             '/profile',                   'Student', 'Edit name, board, and subject preferences'],
            ['Admin Dashboard',     '/admin',                     'Admin',   'Key stats and quick-action links'],
            ['Admin Upload',        '/admin/upload',              'Admin',   'PDF upload, AI extraction, and review workflow'],
            ['Admin Questions',     '/admin/questions',           'Admin',   'Browse, filter, verify, and delete questions'],
            ['Admin Students',      '/admin/students',            'Admin',   'View all registered students'],
          ],
          [2400, 2800, 1300, 2860]
        ),
        spacer(2),

        // closing note
        new Table({
          width: { size: CONTENT, type: WidthType.DXA },
          columnWidths: [CONTENT],
          rows: [new TableRow({
            children: [new TableCell({
              borders: noBorders,
              shading: { fill: LIGHT, type: ShadingType.CLEAR },
              margins: { top: 200, bottom: 200, left: 300, right: 300 },
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [bold('EduPrep — Coaching Institute Platform', 24, BRAND)], ...sp(0, 4) }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [run('Built with the MERN stack  •  Version 1.0  •  May 2026', 20, GRAY)], ...sp(0, 0) }),
              ]
            })]
          })]
        }),
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('C:\\Users\\krish\\OneDrive\\Desktop\\Claude\\coaching-institute\\Documentation.docx', buf);
  console.log('Documentation.docx created successfully!');
});
