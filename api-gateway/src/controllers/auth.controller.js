const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const users = new Map();

const seedDemoUser = async () => {
  const hashedPassword = await bcrypt.hash('password123', 10);
  users.set('demo@college.edu', {
    userId: 'USER001',
    name: 'Demo Student',
    email: 'demo@college.edu',
    password: hashedPassword
  });
  console.log('[API Gateway] Demo user seeded: demo@college.edu / password123');
};

const register = async ({ name, email, password }) => {
  if (users.has(email)) {
    throw Object.assign(new Error('Email already registered'), { statusCode: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = `USER${uuidv4().slice(0, 6).toUpperCase()}`;

  const user = { userId, name, email, password: hashedPassword };
  users.set(email, user);

  const token = generateToken(user);
  return { user: { userId, name, email }, token };
};

const login = async ({ email, password }) => {
  const user = users.get(email);
  if (!user) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }

  const token = generateToken(user);
  return { user: { userId: user.userId, name: user.name, email: user.email }, token };
};

const generateToken = (user) => {
  return jwt.sign(
    { userId: user.userId, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

module.exports = { seedDemoUser, register, login };
