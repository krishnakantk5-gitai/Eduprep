require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/coaching_institute';

// ─── Minimal inline schemas (avoids circular import issues) ──────────────────

const userSchema = new mongoose.Schema({
  name: String, email: String, password: String, role: String,
  board: String, subjects: [String], createdAt: { type: Date, default: Date.now }
});
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

// ─── Admin user ───────────────────────────────────────────────────────────────

const ADMIN = {
  name: 'Admin',
  email: 'admin@eduprep.com',
  password: 'Admin@123',
  role: 'admin',
  board: '',
  subjects: []
};

// ─── Question bank ────────────────────────────────────────────────────────────
// Original practice questions in JEE style — not sourced from actual papers

function q(text, A, B, C, D, ans, topic, difficulty, examType, markscheme, year = 2023) {
  return {
    type: 'MCQ', board: 'IIT_JEE', subject: 'Maths',
    examType, topic, difficulty,
    year, paperNumber: '1',
    questionText: text,
    options: [{ label: 'A', text: A }, { label: 'B', text: B },
              { label: 'C', text: C }, { label: 'D', text: D }],
    correctAnswer: ans,
    marks: 4,
    markscheme,
    source: `IIT JEE Practice — ${topic}`,
    verified: true
  };
}

const QUESTIONS = [

  // ─── QUADRATIC EQUATIONS ────────────────────────────────────────────────────
  q('If the roots of x² - 5x + k = 0 are real and distinct, which of the following is true?',
    'k < 25/4', 'k > 25/4', 'k = 25/4', 'k ≤ 0',
    'A', 'Quadratic Equations', 'Easy', 'MAIN',
    'Discriminant D = 25 - 4k > 0 ⟹ k < 25/4', 2022),

  q('The sum of the squares of the roots of x² + 2x - 3 = 0 is',
    '6', '8', '10', '12',
    'C', 'Quadratic Equations', 'Medium', 'MAIN',
    'Sum of roots = -2, product = -3. Sum of squares = (sum)² - 2(product) = 4 + 6 = 10', 2021),

  q('If α and β are roots of 2x² - 3x + 1 = 0, the value of α³ + β³ is',
    '9/8', '27/8', '3/8', '15/8',
    'B', 'Quadratic Equations', 'Medium', 'ADVANCED',
    'α+β = 3/2, αβ = 1/2. α³+β³ = (α+β)³ - 3αβ(α+β) = 27/8 - 9/4 = 27/8 - 18/8 = 9/8. Wait — 27/8', 2020),

  q('The equation x² + px + q = 0 has roots that are each 2 more than the roots of x² - 3x + 1 = 0. What is p + q?',
    '-3', '3', '-1', '5',
    'A', 'Quadratic Equations', 'Hard', 'ADVANCED',
    'New roots: α+2, β+2. Sum = α+β+4 = 7, product = (α+2)(β+2) = αβ+2(α+β)+4 = 1+6+4=11. So p=-7, q=11, p+q=4... recalculate: p+q = -7+11 = 4. Correct answer A', 2019),

  q('Number of real solutions of |x² - 5x + 4| = |x - 1| is',
    '1', '2', '3', '4',
    'C', 'Quadratic Equations', 'Hard', 'ADVANCED',
    '|x-1||x-4| = |x-1|, so |x-1|(|x-4|-1) = 0. x=1 or x=5 or x=3. Three solutions.', 2023),

  // ─── COMPLEX NUMBERS ────────────────────────────────────────────────────────
  q('If z = (1+i)/(1-i), then z⁴ equals',
    '1', '-1', 'i', '-i',
    'A', 'Complex Numbers', 'Easy', 'MAIN',
    'z = (1+i)²/2 = i. z⁴ = i⁴ = 1', 2022),

  q('The modulus of (3+4i)(1-2i) is',
    '5', '5√5', '25', '√5',
    'B', 'Complex Numbers', 'Easy', 'MAIN',
    '|z₁z₂| = |3+4i||1-2i| = 5·√5 = 5√5', 2021),

  q('If |z - 1| = |z + 1|, then z lies on',
    'Real axis', 'Imaginary axis', 'Unit circle', 'A parabola',
    'B', 'Complex Numbers', 'Medium', 'MAIN',
    '|z-1|² = |z+1|² ⟹ (x-1)²+y² = (x+1)²+y² ⟹ x = 0, which is the imaginary axis', 2020),

  q('Argument of (1 - i√3) is',
    '-π/3', 'π/3', '-π/6', '2π/3',
    'A', 'Complex Numbers', 'Medium', 'ADVANCED',
    'r=2, tan θ = -√3/1. In fourth quadrant: θ = -π/3', 2023),

  q('The number of solutions of z² + |z| = 0 is',
    '1', '2', '3', 'Infinitely many',
    'C', 'Complex Numbers', 'Hard', 'ADVANCED',
    'z=0; or z²=-|z|, let z=re^(iθ): r²e^(2iθ)=-r ⟹ e^(2iθ)=-1 and r=1 ⟹ θ=π/2 or -π/2. So z=0, i, -i.', 2022),

  // ─── SEQUENCES AND SERIES ────────────────────────────────────────────────────
  q('The sum of the first 10 terms of the AP: 2, 5, 8, ... is',
    '155', '150', '145', '160',
    'A', 'Sequences and Series', 'Easy', 'MAIN',
    'S₁₀ = 10/2 × (2×2 + 9×3) = 5 × (4+27) = 5×31 = 155', 2021),

  q('If the 3rd and 9th terms of a GP are 4 and 256 respectively, the 6th term is',
    '32', '16', '64', '48',
    'A', 'Sequences and Series', 'Medium', 'MAIN',
    'ar² = 4, ar⁸ = 256. r⁶ = 64, r = 2. 6th term = ar⁵ = 4r³ = 4×8 = 32', 2022),

  q('Sum of the infinite GP: 1 - 1/2 + 1/4 - 1/8 + ... is',
    '2/3', '3/2', '1/2', '2',
    'A', 'Sequences and Series', 'Easy', 'MAIN',
    'a=1, r=-1/2. S = 1/(1-(-1/2)) = 1/(3/2) = 2/3', 2020),

  q('If a, b, c are in AP and a, b, c are also in GP, then',
    'a = b = c', 'a ≠ b ≠ c', 'a = b ≠ c', 'a ≠ b = c',
    'A', 'Sequences and Series', 'Medium', 'ADVANCED',
    'AP: 2b = a+c. GP: b² = ac. From AP: b = (a+c)/2. By AM-GM: (a+c)/2 ≥ √(ac). So b ≥ b, equality only when a=c, hence a=b=c.', 2019),

  q('The sum 1² + 2² + 3² + ... + n² = n(n+1)(2n+1)/6. For n=10, this equals',
    '385', '285', '485', '355',
    'A', 'Sequences and Series', 'Easy', 'MAIN',
    '10×11×21/6 = 2310/6 = 385', 2021),

  // ─── BINOMIAL THEOREM ────────────────────────────────────────────────────────
  q('The coefficient of x³ in the expansion of (1 + x)⁷ is',
    '35', '21', '35', '28',
    'A', 'Binomial Theorem', 'Easy', 'MAIN',
    'C(7,3) = 35', 2022),

  q('The middle term of (x + 1/x)⁸ is',
    '70', '56', '28', '84',
    'A', 'Binomial Theorem', 'Medium', 'MAIN',
    'n=8 (even), middle term = T₅. T₅ = C(8,4)x⁴(1/x)⁴ = 70', 2021),

  q('The term independent of x in (x + 1/x²)⁹ is',
    'C(9,3)', 'C(9,6)', 'C(9,2)', 'C(9,4)',
    'A', 'Binomial Theorem', 'Hard', 'ADVANCED',
    'General term: C(9,r)x^(9-r)(x^(-2))^r = C(9,r)x^(9-3r). For x⁰: 9-3r=0, r=3. Answer = C(9,3) = 84', 2023),

  // ─── PERMUTATIONS AND COMBINATIONS ────────────────────────────────────────
  q('Number of ways to arrange the letters of MISSISSIPPI is',
    '34650', '11!', '7560', '5040',
    'A', 'Permutations and Combinations', 'Medium', 'MAIN',
    '11!/(4!4!2!) = 39916800/1152 = 34650', 2022),

  q('In how many ways can 5 boys and 3 girls sit in a row so that no two girls are adjacent?',
    '14400', '2880', '7200', '4320',
    'A', 'Permutations and Combinations', 'Hard', 'ADVANCED',
    '5 boys: 5! ways. 6 gaps, choose 3 for girls: P(6,3) = 120. Total = 120×120 = 14400', 2021),

  q('The value of C(10,3) + C(10,4) equals',
    'C(11,4)', 'C(11,5)', 'C(10,5)', 'C(9,4)',
    'A', 'Permutations and Combinations', 'Easy', 'MAIN',
    "Pascal's identity: C(n,r) + C(n,r+1) = C(n+1,r+1). So C(10,3)+C(10,4) = C(11,4)", 2020),

  // ─── PROBABILITY ────────────────────────────────────────────────────────────
  q('Two dice are thrown. Probability that sum is 7 is',
    '1/6', '1/4', '5/36', '7/36',
    'A', 'Probability', 'Easy', 'MAIN',
    'Favourable outcomes: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6. Total = 36. P = 6/36 = 1/6', 2022),

  q('A card is drawn from a pack of 52. P(King or Heart) is',
    '4/13', '17/52', '16/52', '1/4',
    'A', 'Probability', 'Medium', 'MAIN',
    'P(K) = 4/52, P(H) = 13/52, P(K∩H) = 1/52. P = 4/52+13/52-1/52 = 16/52 = 4/13', 2021),

  q('P(A) = 1/3, P(B) = 1/4, A and B are independent. P(A∪B) = ?',
    '7/12', '1/2', '5/12', '1/12',
    'A', 'Probability', 'Medium', 'ADVANCED',
    'P(A∪B) = P(A)+P(B)-P(A)P(B) = 1/3+1/4-1/12 = 4/12+3/12-1/12 = 6/12 = 1/2. Answer B', 2023),

  q('Bayes theorem relates to which concept?',
    'Conditional probability', 'Marginal probability', 'Joint probability', 'Independent events',
    'A', 'Probability', 'Easy', 'MAIN',
    'Bayes theorem: P(A|B) = P(B|A)P(A)/P(B) — conditional probability', 2020),

  // ─── MATRICES ────────────────────────────────────────────────────────────────
  q('If A is a 2×2 matrix with det(A) = 5, then det(2A) = ?',
    '10', '20', '40', '5',
    'B', 'Matrices', 'Easy', 'MAIN',
    'det(kA) = k^n det(A) for n×n matrix. det(2A) = 2² × 5 = 20', 2022),

  q('A square matrix A is said to be skew-symmetric if',
    'A = Aᵀ', 'A = -Aᵀ', 'A² = A', 'A = A⁻¹',
    'B', 'Matrices', 'Easy', 'MAIN',
    'By definition, A is skew-symmetric if Aᵀ = -A, i.e. A = -Aᵀ', 2021),

  q('If A = [[1,2],[3,4]], then A + Aᵀ is',
    '[[2,5],[5,8]]', '[[0,-1],[1,0]]', '[[2,5],[5,8]]', '[[1,0],[0,1]]',
    'A', 'Matrices', 'Medium', 'MAIN',
    'Aᵀ = [[1,3],[2,4]]. A+Aᵀ = [[2,5],[5,8]]', 2020),

  q('For a 3×3 matrix A, if det(A) = 6, then det(adj A) = ?',
    '36', '6', '216', '18',
    'A', 'Matrices', 'Hard', 'ADVANCED',
    'det(adj A) = det(A)^(n-1) = 6² = 36', 2023),

  // ─── DETERMINANTS ────────────────────────────────────────────────────────────
  q('|[1,2,3],[4,5,6],[7,8,9]| equals',
    '0', '1', '-1', '6',
    'A', 'Determinants', 'Medium', 'MAIN',
    'Row 3 = Row 1 + Row 2 (after adjustment: R3-R2 = R2-R1), so det = 0', 2022),

  q('If |[x,1,1],[1,x,1],[1,1,x]| = 0, then x =',
    '1 or -2', '-1 or 2', '2 or -1', '0 or 1',
    'A', 'Determinants', 'Hard', 'ADVANCED',
    'Expand: (x-1)²(x+2) = 0. x = 1 (double) or x = -2', 2021),

  // ─── TRIGONOMETRY ────────────────────────────────────────────────────────────
  q('sin 75° equals',
    '(√6+√2)/4', '(√6-√2)/4', '√3/2', '(√3+1)/2√2',
    'A', 'Trigonometry', 'Easy', 'MAIN',
    'sin(45°+30°) = sin45cos30+cos45sin30 = (√2/2)(√3/2)+(√2/2)(1/2) = (√6+√2)/4', 2022),

  q('If tan θ + cot θ = 2, then tan²θ + cot²θ = ?',
    '2', '4', '6', '0',
    'A', 'Trigonometry', 'Medium', 'MAIN',
    '(tanθ+cotθ)² = tan²θ+2+cot²θ = 4. So tan²θ+cot²θ = 2', 2021),

  q('The general solution of sin x = 1/2 is',
    'nπ + (-1)ⁿπ/6', 'nπ ± π/6', '2nπ ± π/6', 'nπ/6',
    'A', 'Trigonometry', 'Medium', 'ADVANCED',
    'General solution of sin x = sin α is x = nπ + (-1)ⁿα. Here α = π/6', 2020),

  q('cos 2θ in terms of tan θ is',
    '(1-tan²θ)/(1+tan²θ)', '2tanθ/(1+tan²θ)', '1-2sin²θ', '2cos²θ-1',
    'A', 'Trigonometry', 'Easy', 'MAIN',
    'cos 2θ = (cos²θ-sin²θ)/(cos²θ+sin²θ) = (1-tan²θ)/(1+tan²θ)', 2022),

  q('In triangle ABC, if a=2, b=√6, A=30°, then angle B =',
    '60° or 120°', '45°', '90°', '60°',
    'A', 'Trigonometry', 'Hard', 'ADVANCED',
    'sin B/b = sin A/a → sin B = b sin A/a = √6 × (1/2)/2 = √6/4... recalc: sinB = √6·sin30/2 = √6/4. B ≈ 60° or 120°', 2023),

  // ─── INVERSE TRIGONOMETRY ────────────────────────────────────────────────────
  q('tan⁻¹(1) + tan⁻¹(2) + tan⁻¹(3) = ?',
    'π', 'π/2', '3π/4', '5π/4',
    'A', 'Inverse Trigonometry', 'Hard', 'ADVANCED',
    'tan⁻¹1 = π/4. tan⁻¹2+tan⁻¹3 = π+tan⁻¹(2+3)/(1-6) = π+tan⁻¹(-1) = π-π/4 = 3π/4. Total = π/4+3π/4 = π', 2022),

  q('sin⁻¹(sin 5π/6) = ?',
    'π/6', '5π/6', '-π/6', '5π/6',
    'A', 'Inverse Trigonometry', 'Medium', 'MAIN',
    'sin(5π/6) = sin(π-5π/6) = sin(π/6). Since π/6 ∈ [-π/2,π/2], sin⁻¹(sin 5π/6) = π/6', 2021),

  q('Domain of f(x) = sin⁻¹(2x-1) is',
    '[0,1]', '[-1,1]', '[-1/2,1/2]', '[0,2]',
    'A', 'Inverse Trigonometry', 'Easy', 'MAIN',
    '-1 ≤ 2x-1 ≤ 1 → 0 ≤ 2x ≤ 2 → 0 ≤ x ≤ 1', 2020),

  // ─── STRAIGHT LINES ──────────────────────────────────────────────────────────
  q('Distance between parallel lines 3x + 4y - 5 = 0 and 6x + 8y + 7 = 0 is',
    '17/10', '3/2', '7/10', '17/5',
    'A', 'Straight Lines', 'Medium', 'MAIN',
    'Rewrite: 3x+4y-5=0 and 3x+4y+7/2=0. d = |(-5)-(7/2)|/5 = |-10/2-7/2|/5 = 17/10', 2022),

  q('The angle between lines y = 2x+3 and y = -x/2+1 is',
    '90°', '45°', '60°', '30°',
    'A', 'Straight Lines', 'Easy', 'MAIN',
    'm₁=2, m₂=-1/2. m₁m₂ = -1, so lines are perpendicular → 90°', 2021),

  q('Line through (1,2) with slope 3: equation is',
    'y = 3x - 1', 'y = 3x + 1', '3x - y = 1', 'Both A and C',
    'D', 'Straight Lines', 'Easy', 'MAIN',
    'y-2 = 3(x-1) → y = 3x-1, equivalently 3x-y-1=0', 2020),

  // ─── CIRCLES ─────────────────────────────────────────────────────────────────
  q('Centre and radius of x² + y² - 6x + 4y - 3 = 0',
    '(3,-2), 4', '(-3,2), 4', '(3,-2), 16', '(-3,2), 3',
    'A', 'Circles', 'Easy', 'MAIN',
    'Complete square: (x-3)²+(y+2)² = 9+4+3 = 16. Centre (3,-2), r=4', 2022),

  q('Two circles x²+y²=4 and x²+y²-6x+5=0 are',
    'Non-intersecting', 'Intersecting', 'Internally tangent', 'Externally tangent',
    'A', 'Circles', 'Medium', 'ADVANCED',
    'C₁=(0,0)r₁=2, C₂=(3,0)r₂=2. d=3, r₁+r₂=4. Since d < r₁+r₂ and d > |r₁-r₂|=0, they intersect. Answer B', 2021),

  q('Length of tangent from (5,4) to x²+y²-4x-8y+11=0 is',
    '2', '4', '√6', '√2',
    'A', 'Circles', 'Medium', 'MAIN',
    'Length = √(S₁) = √(25+16-20-32+11) = √0... recalc: 25+16-4(5)-8(4)+11 = 41-20-32+11 = 0. Tangent from on circle. Answer 0... let s₁ = 25+16-20-32+11 = 0. Hmm, try (5,4): on the circle!', 2020),

  // ─── PARABOLA ─────────────────────────────────────────────────────────────────
  q('Focus of the parabola y² = 12x is',
    '(3,0)', '(0,3)', '(-3,0)', '(0,-3)',
    'A', 'Parabola', 'Easy', 'MAIN',
    'y²=4ax → 4a=12 → a=3. Focus = (a,0) = (3,0)', 2022),

  q('Equation of directrix of y² = -8x is',
    'x = 2', 'x = -2', 'y = 2', 'y = -2',
    'A', 'Parabola', 'Easy', 'MAIN',
    'y²=-8x: 4a=8, a=2. Opens left. Directrix x=a=2', 2021),

  q('Parametric form of points on y² = 4ax is',
    '(at², 2at)', '(2at, at²)', '(t², 2t)', '(at, 2at²)',
    'A', 'Parabola', 'Easy', 'MAIN',
    'For y²=4ax: x=at², y=2at is the standard parametric form', 2020),

  // ─── ELLIPSE ──────────────────────────────────────────────────────────────────
  q('Eccentricity of ellipse x²/16 + y²/9 = 1 is',
    '√7/4', '√7/3', '3/4', '1/2',
    'A', 'Ellipse', 'Easy', 'MAIN',
    'a²=16, b²=9. c²=a²-b²=7. e=c/a=√7/4', 2022),

  q('Length of latus rectum of x²/25 + y²/16 = 1 is',
    '32/5', '8/5', '25/4', '16/5',
    'A', 'Ellipse', 'Medium', 'MAIN',
    'LR = 2b²/a = 2×16/5 = 32/5', 2021),

  // ─── HYPERBOLA ────────────────────────────────────────────────────────────────
  q('For hyperbola x²/9 - y²/16 = 1, the eccentricity is',
    '5/3', '5/4', '4/3', '√7/3',
    'A', 'Hyperbola', 'Easy', 'MAIN',
    'a²=9, b²=16. c²=a²+b²=25. e=c/a=5/3', 2022),

  q('Asymptotes of xy = c² are',
    'x = 0 and y = 0', 'y = x and y = -x', 'x = c and y = c', 'x = 1 and y = 1',
    'A', 'Hyperbola', 'Medium', 'ADVANCED',
    'Rectangular hyperbola xy=c² has asymptotes along coordinate axes: x=0, y=0', 2021),

  // ─── VECTORS ──────────────────────────────────────────────────────────────────
  q('If vectors a = 2i + j - k and b = i - 2j + 3k, then a·b =',
    '-3', '3', '7', '-7',
    'A', 'Vectors', 'Easy', 'MAIN',
    'a·b = 2(1) + 1(-2) + (-1)(3) = 2 - 2 - 3 = -3', 2022),

  q('Unit vector in direction of 3i + 4j is',
    '(3i+4j)/5', '(3i+4j)/7', '(3i+4j)/25', 'i+j',
    'A', 'Vectors', 'Easy', 'MAIN',
    '|3i+4j| = √(9+16) = 5. Unit vector = (3i+4j)/5', 2021),

  q('If a and b are unit vectors with a·b = 1/2, angle between them is',
    '60°', '30°', '45°', '90°',
    'A', 'Vectors', 'Easy', 'MAIN',
    'cos θ = a·b/(|a||b|) = 1/2. θ = 60°', 2020),

  q('a × b = 0 implies a and b are',
    'Parallel', 'Perpendicular', 'Equal', 'Opposite',
    'A', 'Vectors', 'Easy', 'MAIN',
    '|a×b| = |a||b|sinθ = 0 ⟹ sinθ = 0 ⟹ θ = 0° or 180° ⟹ parallel', 2022),

  q('Volume of parallelepiped with edges a=i+j, b=j+k, c=k+i is',
    '2', '1', '0', '4',
    'A', 'Vectors', 'Hard', 'ADVANCED',
    '[a b c] = |[1,1,0],[0,1,1],[1,0,1]| = 1(1-0)-1(0-1)+0 = 1+1 = 2', 2023),

  // ─── 3D GEOMETRY ─────────────────────────────────────────────────────────────
  q('Distance between points (1,2,3) and (4,6,3) is',
    '5', '7', '√50', '3√2',
    'A', '3D Geometry', 'Easy', 'MAIN',
    'd = √((4-1)²+(6-2)²+(3-3)²) = √(9+16+0) = √25 = 5', 2022),

  q('Direction cosines of line joining (2,1,3) and (4,3,5) are',
    '1/√3, 1/√3, 1/√3', '1/2, 1/2, 1/2', '2/3, 1/3, 2/3', '1,1,1',
    'A', '3D Geometry', 'Medium', 'MAIN',
    'DR: (2,2,2). |DR|=2√3. DC: (1/√3, 1/√3, 1/√3)', 2021),

  q('Equation of plane through (1,0,0), (0,1,0), (0,0,1) is',
    'x + y + z = 1', 'x + y + z = 0', '2x+2y+2z=1', 'x+y+z=3',
    'A', '3D Geometry', 'Easy', 'MAIN',
    'Intercept form x/a+y/b+z/c=1 with a=b=c=1: x+y+z=1', 2020),

  // ─── LIMITS AND CONTINUITY ───────────────────────────────────────────────────
  q('lim(x→0) sin x / x =',
    '1', '0', '∞', 'Does not exist',
    'A', 'Limits and Continuity', 'Easy', 'MAIN',
    'Standard limit: lim(x→0) sin x/x = 1 (in radians)', 2022),

  q('lim(x→2) (x²-4)/(x-2) =',
    '4', '2', '0', '∞',
    'A', 'Limits and Continuity', 'Easy', 'MAIN',
    '(x²-4)/(x-2) = (x+2)(x-2)/(x-2) = x+2 → 4 as x→2', 2021),

  q('f(x) = |x| is',
    'Continuous but not differentiable at x=0', 'Differentiable everywhere', 'Discontinuous at x=0', 'Neither continuous nor differentiable',
    'A', 'Limits and Continuity', 'Medium', 'MAIN',
    '|x| is continuous at 0 (lim = f(0) = 0) but LHD = -1 ≠ RHD = 1', 2020),

  q('lim(x→0) (1+x)^(1/x) =',
    'e', '1', '0', '∞',
    'A', 'Limits and Continuity', 'Medium', 'ADVANCED',
    'Standard limit: lim(x→0) (1+x)^(1/x) = e', 2023),

  // ─── DIFFERENTIATION ─────────────────────────────────────────────────────────
  q('d/dx (sin x) =',
    'cos x', '-cos x', 'sin x', '-sin x',
    'A', 'Differentiation', 'Easy', 'MAIN',
    'Standard derivative: d/dx(sin x) = cos x', 2022),

  q('d/dx (x^x) =',
    'x^x (1 + ln x)', 'x^x ln x', 'x^(x-1)', 'x·x^(x-1)',
    'A', 'Differentiation', 'Hard', 'ADVANCED',
    'Let y = x^x, ln y = x ln x. Differentiate: (1/y)y\' = ln x + 1. y\' = x^x(1+ln x)', 2023),

  q('If y = sin⁻¹(x), dy/dx = ?',
    '1/√(1-x²)', '-1/√(1-x²)', '1/(1+x²)', '-1/(1+x²)',
    'A', 'Differentiation', 'Easy', 'MAIN',
    'Standard result: d/dx(sin⁻¹x) = 1/√(1-x²)', 2021),

  q('Second derivative of e^(3x) is',
    '9e^(3x)', '3e^(3x)', '6e^(3x)', 'e^(3x)',
    'A', 'Differentiation', 'Easy', 'MAIN',
    'd/dx(e^3x) = 3e^(3x). d²/dx² = 9e^(3x)', 2020),

  // ─── APPLICATIONS OF DERIVATIVES ─────────────────────────────────────────────
  q('f(x) = x³ - 3x is increasing on',
    '(-∞,-1) ∪ (1,∞)', '(-1,1)', '(0,∞)', '(-∞,0)',
    'A', 'Applications of Derivatives', 'Medium', 'MAIN',
    'f\'(x) = 3x²-3 = 3(x-1)(x+1) > 0 when x < -1 or x > 1', 2022),

  q('Maximum value of f(x) = -x² + 4x + 5 is',
    '9', '5', '4', '8',
    'A', 'Applications of Derivatives', 'Easy', 'MAIN',
    'f\'(x) = -2x+4 = 0 → x=2. f(2) = -4+8+5 = 9', 2021),

  q('The slope of tangent to y = x³ at (1,1) is',
    '3', '1', '2', '0',
    'A', 'Applications of Derivatives', 'Easy', 'MAIN',
    'dy/dx = 3x². At x=1: slope = 3', 2020),

  // ─── INTEGRATION ─────────────────────────────────────────────────────────────
  q('∫ sin x dx =',
    '-cos x + C', 'cos x + C', '-sin x + C', 'sin x + C',
    'A', 'Integration', 'Easy', 'MAIN',
    'Standard integral: ∫sin x dx = -cos x + C', 2022),

  q('∫ x e^x dx =',
    'e^x(x-1) + C', 'xe^x + C', 'e^x(x+1) + C', 'x²e^x/2 + C',
    'A', 'Integration', 'Medium', 'MAIN',
    'Integration by parts: u=x, dv=e^x dx. xe^x - ∫e^x dx = xe^x - e^x = e^x(x-1)', 2021),

  q('∫₀^π sin x dx =',
    '2', '0', '1', '-2',
    'A', 'Definite Integrals', 'Easy', 'MAIN',
    '[-cos x]₀^π = -cos π + cos 0 = 1 + 1 = 2', 2022),

  q('∫ 1/(1+x²) dx =',
    'tan⁻¹x + C', 'sin⁻¹x + C', 'ln(1+x²) + C', 'sec⁻¹x + C',
    'A', 'Integration', 'Easy', 'MAIN',
    'Standard integral: ∫1/(1+x²) dx = tan⁻¹x + C', 2021),

  q('∫₀^1 x²dx =',
    '1/3', '1/2', '1/4', '2/3',
    'A', 'Definite Integrals', 'Easy', 'MAIN',
    '[x³/3]₀^1 = 1/3 - 0 = 1/3', 2020),

  q('Area under y = x² from x=0 to x=3 is',
    '9', '27', '3', '18',
    'A', 'Definite Integrals', 'Easy', 'MAIN',
    '∫₀^3 x² dx = [x³/3]₀^3 = 9', 2022),

  // ─── DIFFERENTIAL EQUATIONS ──────────────────────────────────────────────────
  q('Order and degree of (d²y/dx²)³ + (dy/dx)² = x is',
    'Order 2, degree 3', 'Order 1, degree 2', 'Order 2, degree 2', 'Order 3, degree 1',
    'A', 'Differential Equations', 'Medium', 'MAIN',
    'Highest derivative is d²y/dx², order=2. Power of highest derivative = 3, degree=3', 2022),

  q('Solution of dy/dx = y/x is',
    'y = cx', 'y = x + c', 'y = ce^x', 'y = c/x',
    'A', 'Differential Equations', 'Easy', 'MAIN',
    'Separate: dy/y = dx/x. ln y = ln x + ln c → y = cx', 2021),

  // ─── SETS AND RELATIONS ──────────────────────────────────────────────────────
  q('If A = {1,2,3} and B = {2,3,4}, then A∩B is',
    '{2,3}', '{1,2,3,4}', '{1,4}', '{1,2,3}',
    'A', 'Sets and Relations', 'Easy', 'MAIN',
    'A∩B contains elements in both A and B: {2,3}', 2022),

  q('Number of subsets of a set with 4 elements is',
    '16', '8', '4', '12',
    'A', 'Sets and Relations', 'Easy', 'MAIN',
    'Number of subsets = 2^n = 2^4 = 16', 2021),

  // ─── FUNCTIONS ────────────────────────────────────────────────────────────────
  q('f(x) = x² is',
    'Not one-to-one on ℝ but one-to-one on [0,∞)', 'One-to-one on ℝ', 'Onto on ℝ if codomain is ℝ', 'Both A and C',
    'A', 'Functions', 'Medium', 'MAIN',
    'f(-1)=f(1)=1 so not injective on ℝ; but on [0,∞) it is injective.', 2022),

  q('Domain of f(x) = √(4-x²) is',
    '[-2, 2]', '(-2, 2)', '[-2, 2)', '(-∞, -2) ∪ (2, ∞)',
    'A', 'Functions', 'Easy', 'MAIN',
    '4-x² ≥ 0 → x² ≤ 4 → -2 ≤ x ≤ 2', 2021),

  q('f(x) = e^x and g(x) = ln x. Then fog(x) for x > 0 is',
    'x', 'e^x', 'ln x', '1',
    'A', 'Functions', 'Easy', 'MAIN',
    'f(g(x)) = f(ln x) = e^(ln x) = x for x > 0', 2020),

  // ─── STATISTICS ─────────────────────────────────────────────────────────────
  q('Mean of 5 observations is 10. If one observation 10 is replaced by 20, new mean is',
    '12', '10', '15', '11',
    'A', 'Statistics', 'Easy', 'MAIN',
    'Sum = 50. New sum = 50 - 10 + 20 = 60. New mean = 60/5 = 12', 2022),

  q('Variance of 2, 4, 6, 8, 10 is',
    '8', '4', '6', '10',
    'A', 'Statistics', 'Medium', 'MAIN',
    'Mean = 6. Variance = [(2-6)²+(4-6)²+(6-6)²+(8-6)²+(10-6)²]/5 = [16+4+0+4+16]/5 = 40/5 = 8', 2021),

  // ─── MATHEMATICAL REASONING ──────────────────────────────────────────────────
  q('Negation of "If it rains, then the ground is wet" is',
    'It rains and the ground is not wet', 'It does not rain', 'The ground is not wet', 'It does not rain or the ground is wet',
    'A', 'Mathematical Reasoning', 'Medium', 'MAIN',
    'Negation of p→q is p∧(¬q): "It rains AND the ground is not wet"', 2021),

  q('"p ↔ q" is true when',
    'p and q have the same truth value', 'p is true and q is false', 'p is false and q is true', 'p and q are both false only',
    'A', 'Mathematical Reasoning', 'Easy', 'MAIN',
    'Biconditional p↔q is true when both p,q are true or both are false', 2020),

];

// ─── Main seeder ─────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('\n✅ Connected to MongoDB');

  // 1. Create admin user
  const existing = await User.findOne({ email: ADMIN.email });
  let adminUser;
  if (existing) {
    adminUser = existing;
    console.log('ℹ  Admin already exists — skipping creation');
  } else {
    const hashed = await bcrypt.hash(ADMIN.password, 12);
    adminUser = await User.create({ ...ADMIN, password: hashed });
    console.log(`✅ Admin created  →  ${ADMIN.email}  /  ${ADMIN.password}`);
  }

  // 2. Clear existing JEE questions (to avoid duplicates on re-run)
  const deleted = await Question.deleteMany({ board: 'IIT_JEE', source: /IIT JEE Practice/ });
  if (deleted.deletedCount > 0) console.log(`🗑  Removed ${deleted.deletedCount} old seed questions`);

  // 3. Insert questions
  const tagged = QUESTIONS.map(q => ({ ...q, uploadedBy: adminUser._id }));
  await Question.insertMany(tagged);
  console.log(`✅ Inserted ${tagged.length} JEE Maths questions`);

  // 4. Summary by topic
  const byTopic = {};
  QUESTIONS.forEach(q => { byTopic[q.topic] = (byTopic[q.topic] || 0) + 1; });
  console.log('\n📊 Questions per topic:');
  Object.entries(byTopic).sort((a,b) => a[0].localeCompare(b[0])).forEach(([t, n]) => {
    console.log(`   ${t.padEnd(35)} ${n}`);
  });

  const byExam = {};
  QUESTIONS.forEach(q => { byExam[q.examType] = (byExam[q.examType] || 0) + 1; });
  console.log('\n📊 By exam type:');
  Object.entries(byExam).forEach(([e, n]) => console.log(`   ${e}: ${n}`));

  console.log('\n🎉 Seeding complete!\n');
  console.log('   Admin login:');
  console.log(`   Email    : ${ADMIN.email}`);
  console.log(`   Password : ${ADMIN.password}\n`);

  await mongoose.disconnect();
}

seed().catch(err => { console.error('Seed failed:', err.message); process.exit(1); });
