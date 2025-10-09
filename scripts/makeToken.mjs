import 'dotenv/config';
import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'replace-this-with-a-strong-secret';
const payload = {
  sub: 'test-user-id',
  email: 'test@example.com',
  role: 'tester'
};

const token = jwt.sign(payload, secret, { expiresIn: '1h' });
console.log(token);


