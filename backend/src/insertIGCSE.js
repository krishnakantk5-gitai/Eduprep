require('dotenv').config();
const axios = require('axios');

const BACKEND = 'https://eduprep-backend-d34z.onrender.com';

const questions = [
  {
    type: 'STRUCTURED', board: 'IGCSE', subject: 'Maths', examType: '',
    topic: 'Ratio and Proportion', subtopic: 'Ratio simplification',
    difficulty: 'Easy', year: 2025, paperNumber: '42',
    source: 'IGCSE Maths 0580/42 Oct/Nov 2025',
    questionText: 'Write the ratio 60 grams : 3 kilograms in the form 1 : n.',
    marks: 2, markscheme: '60g : 3000g = 60:3000 = 1:50. Answer: n = 50',
    verified: true
  },
  {
    type: 'STRUCTURED', board: 'IGCSE', subject: 'Maths', examType: '',
    topic: 'Algebra', subtopic: 'Linear equations',
    difficulty: 'Easy', year: 2025, paperNumber: '42',
    source: 'IGCSE Maths 0580/42 Oct/Nov 2025',
    questionText: 'Solve.\n8x − 17 = 27',
    marks: 2, markscheme: '8x = 44, x = 5.5',
    verified: true
  },
  {
    type: 'STRUCTURED', board: 'IGCSE', subject: 'Maths', examType: '',
    topic: 'Geometry', subtopic: 'Symmetry',
    difficulty: 'Easy', year: 2025, paperNumber: '42',
    source: 'IGCSE Maths 0580/42 Oct/Nov 2025',
    questionText: 'Write down the order of rotational symmetry of a regular decagon.',
    marks: 1, markscheme: '10',
    verified: true
  },
  {
    type: 'STRUCTURED', board: 'IGCSE', subject: 'Maths', examType: '',
    topic: 'Ratio and Proportion', subtopic: 'Rates and percentage profit',
    difficulty: 'Easy', year: 2025, paperNumber: '42',
    source: 'IGCSE Maths 0580/42 Oct/Nov 2025',
    questionText: 'Pedro makes cards.\n(a) He makes cards at a rate of 9 cards every 20 minutes. Work out the number of cards he makes in 8 hours.\n(b) Each card costs 12 cents to make. Pedro sells each card for 50 cents. Work out his percentage profit on each card.',
    marks: 4, markscheme: '(a) 8 hours = 480 min. 480/20 × 9 = 216 cards.\n(b) Profit = 38 cents. Percentage profit = 38/12 × 100 = 316.67%',
    verified: true
  },
  {
    type: 'STRUCTURED', board: 'IGCSE', subject: 'Maths', examType: '',
    topic: 'Ratio and Proportion', subtopic: 'Currency conversion',
    difficulty: 'Easy', year: 2025, paperNumber: '42',
    source: 'IGCSE Maths 0580/42 Oct/Nov 2025',
    questionText: 'Nuwa is buying a phone.\nOne website sells the phone for 953 Yuan.\nA different website sells the same phone for $141.\nThe exchange rate is 1 Yuan = $0.152.\nCalculate the difference between these phone prices. Give your answer in dollars, correct to the nearest cent.',
    marks: 2, markscheme: '953 × 0.152 = $144.86. Difference = 144.86 - 141 = $3.86',
    verified: true
  },
  {
    type: 'STRUCTURED', board: 'IGCSE', subject: 'Maths', examType: '',
    topic: 'Statistics', subtopic: 'Stem-and-leaf, mean and range',
    difficulty: 'Medium', year: 2025, paperNumber: '42',
    source: 'IGCSE Maths 0580/42 Oct/Nov 2025',
    questionText: 'One morning, a dentist has appointments for 10 patients.\nThe stem-and-leaf diagram shows the waiting time for 8 of these patients:\n0 | 1  4\n1 | 0  2  9\n2 | 1  5  5\nKey: 1|0 represents 10 minutes\n\nThe times for the two other patients, P and Q, are not shown.\nThe mean waiting time of all 10 patients is 16 minutes.\nThe range of waiting times is 26 minutes.\nPatient P waits longer than patient Q.\nFind the waiting time for each of patient P and patient Q.',
    marks: 4, markscheme: 'Sum of 8 shown = 1+4+10+12+19+21+25+25 = 117. Total sum = 160. P+Q = 43. Max shown = 25, range = 26 so max = 27. P = 27, Q = 43-27 = 16.',
    verified: true
  },
  {
    type: 'STRUCTURED', board: 'IGCSE', subject: 'Maths', examType: '',
    topic: 'Geometry', subtopic: 'Perimeter and area of parallelogram',
    difficulty: 'Hard', year: 2025, paperNumber: '42',
    source: 'IGCSE Maths 0580/42 Oct/Nov 2025',
    questionText: 'The diagram shows a parallelogram with sides x m and 6.51 m.\nThe parallelogram has the same perimeter as a circle with radius 4 m.\n(a) Show that x = 6.06 m, correct to 2 decimal places.\n(b) The floor of a room is in the shape of this parallelogram with sides 6.51 m and 6.06 m and an angle of 36°. It costs $18 per square metre to tile the floor. Calculate the total cost of tiling the floor.',
    marks: 8, markscheme: '(a) Perimeter of circle = 2π×4 = 25.13... m. 2(x + 6.51) = 25.13. x = 25.13/2 - 6.51 = 6.06 m.\n(b) Area = 6.51 × 6.06 × sin36° = 6.51 × 6.06 × 0.5878 = 23.19 m². Cost = 23.19 × 18 = $417.42',
    verified: true
  },
  {
    type: 'STRUCTURED', board: 'IGCSE', subject: 'Maths', examType: '',
    topic: 'Transformations', subtopic: 'Translation, reflection, describing transformations',
    difficulty: 'Medium', year: 2025, paperNumber: '42',
    source: 'IGCSE Maths 0580/42 Oct/Nov 2025',
    questionText: 'Shape A is drawn on a coordinate grid.\n(a)(i) Draw the image of shape A after a translation by the vector (1, −7).\n(a)(ii) Draw the image of shape A after a reflection in the line y = x + 1.\n(b) Describe fully the single transformation that maps shape A onto shape B.',
    marks: 8, markscheme: '(a)(i) Move every point 1 right and 7 down.\n(a)(ii) Reflect in y = x+1 (swap coordinates and adjust for +1).\n(b) Rotation, 180°, centre (0, 4) [or equivalent description].',
    verified: true
  },
  {
    type: 'STRUCTURED', board: 'IGCSE', subject: 'Maths', examType: '',
    topic: 'Kinematics', subtopic: 'Speed-time graph, distance',
    difficulty: 'Medium', year: 2025, paperNumber: '42',
    source: 'IGCSE Maths 0580/42 Oct/Nov 2025',
    questionText: 'The diagram shows the speed–time graph for part of a car journey.\nThe speed increases from 60 km/h to 80 km/h over the first 15 minutes, then decreases from 80 km/h to 0 over the next 10 minutes.\nFind the total distance travelled in the 25 minutes.',
    marks: 3, markscheme: 'Area of trapezium (0 to 15 min): ½(60+80)×(15/60) = ½×140×0.25 = 17.5 km.\nArea of triangle (15 to 25 min): ½×80×(10/60) = ½×80×0.1667 = 6.67 km.\nTotal = 17.5 + 6.67 = 24.2 km.',
    verified: true
  },
  {
    type: 'STRUCTURED', board: 'IGCSE', subject: 'Maths', examType: '',
    topic: 'Sequences and Series', subtopic: 'nth term of linear and quadratic sequences',
    difficulty: 'Easy', year: 2025, paperNumber: '42',
    source: 'IGCSE Maths 0580/42 Oct/Nov 2025',
    questionText: 'Find the nth term of each sequence.\n(a) 17, 9, 1, −7, −15, …\n(b) 3, 12, 27, 48, 75, …',
    marks: 4, markscheme: '(a) Common difference = −8. First term = 17. nth term = 25 − 8n.\n(b) Differences: 9,15,21,27 — second difference = 6 so 3n². Check: 3(1)²=3 ✓. nth term = 3n².',
    verified: true
  },
  {
    type: 'STRUCTURED', board: 'IGCSE', subject: 'Maths', examType: '',
    topic: 'Functions', subtopic: 'Drawing and using cubic graphs',
    difficulty: 'Hard', year: 2025, paperNumber: '42',
    source: 'IGCSE Maths 0580/42 Oct/Nov 2025',
    questionText: 'The table shows some values for y = x³ − 2x + 3 for −2 ≤ x ≤ 2.\n(a) Complete the table:\nx: −2, −1.5, −1, −0.5, 0, 0.5, 1, 1.5, 2\ny: −1, ?, 4, 3.88, 3, 2.13, 2, ?, 7\n(b) Draw the graph of y = x³ − 2x + 3 for −2 ≤ x ≤ 2.\n(c) By drawing a suitable straight line on the grid, solve the equation x³ − 2.5x + 1 = 0.',
    marks: 10, markscheme: '(a) x=−1.5: y=(−1.5)³−2(−1.5)+3 = −3.375+3+3 = 2.63. x=1.5: y=3.375−3+3=3.38.\n(b) Smooth curve through all points.\n(c) x³−2x+3 = 0.5x+2. Draw y=0.5x+2. Intersections give x ≈ −1.9, −0.4, 1.3.',
    verified: true
  },
  {
    type: 'STRUCTURED', board: 'IGCSE', subject: 'Maths', examType: '',
    topic: 'Circles', subtopic: 'Circle theorems, tangent',
    difficulty: 'Medium', year: 2025, paperNumber: '42',
    source: 'IGCSE Maths 0580/42 Oct/Nov 2025',
    questionText: 'A, B and C lie on a circle centre O. DE is a tangent to the circle at C.\nAngle ABC = 52° and angle BCE = 65°.\n(a) Find the value of x (angle BOC). Give a geometrical reason for your answer.\n(b) Find the value of y (angle BAC).',
    marks: 4, markscheme: '(a) Angle BCA (in alternate segment) = angle BCE = 65° (tangent-chord angle = angle in alternate segment). x = angle BOC = 2 × angle BAC. First find angle ACB = 65°. Then angle BAC = 180°−52°−65° = 63°. x = 2×52° = 104° (angle at centre = twice angle at circumference).\n(b) y = 180° − 52° − 65° = 63° (angles in triangle).',
    verified: true
  },
  {
    type: 'STRUCTURED', board: 'IGCSE', subject: 'Maths', examType: '',
    topic: 'Algebra', subtopic: 'Algebraic fractions',
    difficulty: 'Easy', year: 2025, paperNumber: '42',
    source: 'IGCSE Maths 0580/42 Oct/Nov 2025',
    questionText: 'Simplify.\n7/(2m) + 3/(8m)',
    marks: 2, markscheme: 'Common denominator = 8m. 28/(8m) + 3/(8m) = 31/(8m)',
    verified: true
  },
  {
    type: 'STRUCTURED', board: 'IGCSE', subject: 'Maths', examType: '',
    topic: 'Financial Mathematics', subtopic: 'Compound interest, percentage profit, exponential decay',
    difficulty: 'Medium', year: 2025, paperNumber: '42',
    source: 'IGCSE Maths 0580/42 Oct/Nov 2025',
    questionText: '(a) Carlos invests $24000 at a rate of 3.2% per year compound interest. Calculate the value of his investment at the end of 4 years.\n(b) Carlos buys a painting for $x. He sells the painting for $40870 making a profit of 34%. Calculate the value of his profit.\n(c) Carlos buys a car with value $32500. Its value decreases exponentially by 23% each year. Find a formula for the value, $V, of the car at the end of n years.',
    marks: 8, markscheme: '(a) 24000 × (1.032)⁴ = $27,195.47\n(b) Cost = 40870/1.34 = $30500. Profit = 40870−30500 = $10370\n(c) V = 32500 × (0.77)ⁿ',
    verified: true
  },
  {
    type: 'STRUCTURED', board: 'IGCSE', subject: 'Maths', examType: '',
    topic: 'Trigonometry', subtopic: 'Sine rule, cosine rule, area of triangle',
    difficulty: 'Hard', year: 2025, paperNumber: '42',
    source: 'IGCSE Maths 0580/42 Oct/Nov 2025',
    questionText: 'The diagram shows a field ABCD in the shape of a quadrilateral. BD = 300m, DC = 112m, angle BDC = 140°, AB = 180m.\n(a) Calculate BC.\n(b) Calculate angle DBC.\n(c) The total area of field ABCD is 35900m². Work out the length of the shortest distance from D to AB.',
    marks: 10, markscheme: '(a) BC² = BD²+DC²−2×BD×DC×cos140° = 90000+12544−2×300×112×(−0.766) = 154,088. BC = 392.5m\n(b) sinDBC/112 = sin140°/392.5. sinDBC = 0.1834. Angle DBC = 10.6°\n(c) Area of BCD = ½×300×112×sin140° = 10,788m². Area ABD = 35900−10788 = 25112m². h = 2×25112/180 = 279.0m',
    verified: true
  },
  {
    type: 'STRUCTURED', board: 'IGCSE', subject: 'Maths', examType: '',
    topic: 'Statistics', subtopic: 'Histogram, probability, mean',
    difficulty: 'Hard', year: 2025, paperNumber: '42',
    source: 'IGCSE Maths 0580/42 Oct/Nov 2025',
    questionText: 'The histogram shows information about the masses of some coconuts classified into categories A (0.9–1.0kg), B (1.1–1.2kg), C (1.2–1.3kg), D (1.4–1.6kg).\n(a) Show that there are 10 coconuts in category D.\n(b) Two coconuts from categories C and D are chosen at random. Find the probability that both are from category D.\n(c) Calculate an estimate of the mean mass of the coconuts.',
    marks: 8, markscheme: '(a) Frequency density ≈ 50, width = 0.2kg. Frequency = 50×0.2 = 10 ✓\n(b) Category C: fd=100, width=0.1, freq=10. Category D: 10. Total C+D=20. P(both D) = 10/20 × 9/19 = 90/380 = 9/38\n(c) Midpoints: A=0.95(20), B=1.15(10), C=1.25(10), D=1.5(10). Mean = (0.95×20+1.15×10+1.25×10+1.5×10)/50 = (19+11.5+12.5+15)/50 = 58/50 = 1.16kg',
    verified: true
  },
  {
    type: 'STRUCTURED', board: 'IGCSE', subject: 'Maths', examType: '',
    topic: 'Algebra', subtopic: 'Expanding triple brackets',
    difficulty: 'Medium', year: 2025, paperNumber: '42',
    source: 'IGCSE Maths 0580/42 Oct/Nov 2025',
    questionText: 'Expand and simplify.\n(x − 2)(2x + 3)(x + 4)',
    marks: 3, markscheme: 'First: (x−2)(2x+3) = 2x²+3x−4x−6 = 2x²−x−6. Then (2x²−x−6)(x+4) = 2x³+8x²−x²−4x−6x−24 = 2x³+7x²−10x−24',
    verified: true
  },
  {
    type: 'STRUCTURED', board: 'IGCSE', subject: 'Maths', examType: '',
    topic: 'Vectors', subtopic: 'Vector expressions and midpoints',
    difficulty: 'Medium', year: 2025, paperNumber: '42',
    source: 'IGCSE Maths 0580/42 Oct/Nov 2025',
    questionText: 'In the diagram, OA is parallel to CB. OA:CB = 4:3. OA = a and OB = b.\n(a) Find vector AB in terms of a and b.\n(b) M is the midpoint of OC. Find vector AM in terms of a and b. Give your answer in its simplest form.',
    marks: 4, markscheme: '(a) AB = AO + OB = −a + b = b − a\n(b) CB = (3/4)a (parallel to OA, ratio 3:4). OC = OB + BC = b − (3/4)a. M = midpoint OC = ½(b − (3/4)a). AM = AO + OM = −a + ½b − (3/8)a = ½b − (11/8)a',
    verified: true
  },
  {
    type: 'STRUCTURED', board: 'IGCSE', subject: 'Maths', examType: '',
    topic: 'Algebra', subtopic: 'Simultaneous equations (linear and quadratic)',
    difficulty: 'Hard', year: 2025, paperNumber: '42',
    source: 'IGCSE Maths 0580/42 Oct/Nov 2025',
    questionText: 'Solve the simultaneous equations. Show all working and give answers correct to 2 decimal places.\ny = 5 − 2x\ny = 3x² − 7x − 6',
    marks: 6, markscheme: 'Substitute: 5−2x = 3x²−7x−6. 3x²−5x−11=0. x = (5±√(25+132))/6 = (5±√157)/6. x = (5+12.53)/6 = 2.92 or x = (5−12.53)/6 = −1.26. y = 5−2(2.92) = −0.84 or y = 5−2(−1.26) = 7.52',
    verified: true
  },
  {
    type: 'STRUCTURED', board: 'IGCSE', subject: 'Maths', examType: '',
    topic: 'Bounds', subtopic: 'Upper and lower bounds',
    difficulty: 'Medium', year: 2025, paperNumber: '42',
    source: 'IGCSE Maths 0580/42 Oct/Nov 2025',
    questionText: 'A solid metal prism has a mass of 4810g, correct to the nearest 10g.\nThe density of the metal is 7.7 g/cm³, correct to 1 decimal place.\nCalculate the lower bound for the volume of the prism.\n[Density = mass ÷ volume]',
    marks: 3, markscheme: 'Lower bound of mass = 4805g. Upper bound of density = 7.75 g/cm³. Lower bound of volume = 4805/7.75 = 620 cm³',
    verified: true
  },
  {
    type: 'STRUCTURED', board: 'IGCSE', subject: 'Maths', examType: '',
    topic: 'Ratio and Proportion', subtopic: 'Inverse proportion and combined variation',
    difficulty: 'Hard', year: 2025, paperNumber: '42',
    source: 'IGCSE Maths 0580/42 Oct/Nov 2025',
    questionText: 'y is inversely proportional to (x + 2)².\nw is proportional to x.\nWhen y = 8, x = 3.5.\nWhen w = 15, x = 90.\nFind y in terms of w.',
    marks: 4, markscheme: 'y = k/(x+2)². 8 = k/(5.5)² = k/30.25. k = 242. w = cx. 15 = 90c. c = 1/6. So x = 6w. y = 242/(6w+2)² = 242/(2(3w+1))² = 242/4(3w+1)² = 60.5/(3w+1)²',
    verified: true
  }
];

async function main() {
  console.log('👤 Logging into live backend...');
  let token;
  try {
    const reg = await axios.post(`${BACKEND}/api/auth/register`, {
      name: 'Admin', email: 'admin@eduprep.com',
      password: 'Admin@123', board: '', subjects: []
    });
    token = reg.data.token;
    // Upgrade role by re-registering won't work — use login
  } catch {
    const login = await axios.post(`${BACKEND}/api/auth/login`, {
      email: 'admin@eduprep.com', password: 'Admin@123'
    });
    token = login.data.token;
  }
  console.log('✅ Logged in');

  console.log(`\n📤 Uploading ${questions.length} questions from IGCSE Maths 0580/42 Oct/Nov 2025...`);
  const res = await axios.post(`${BACKEND}/api/upload/save`,
    { questions },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  console.log(`✅ ${res.data.count} questions saved to Atlas!`);

  const byTopic = {};
  questions.forEach(q => { byTopic[q.topic] = (byTopic[q.topic] || 0) + 1; });
  console.log('\n📊 By topic:');
  Object.entries(byTopic).forEach(([t, n]) => console.log(`   ${t}: ${n}`));
  console.log('\n🎉 Done! Visit https://eduprep-neon.vercel.app to see questions live.');
}

main().catch(err => {
  console.error('Error:', err.response?.data || err.message);
  process.exit(1);
});
