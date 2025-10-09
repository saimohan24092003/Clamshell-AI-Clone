import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env.js';
import User from '../src/models/User.js';

async function main() {
  await mongoose.connect(env.mongoUri, { autoIndex: true });
  const email = process.argv[2] || 'tester@example.com';
  const password = process.argv[3] || 'Password123!';

  const passwordHash = await bcrypt.hash(password, 12);
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ email, passwordHash });
    console.log('Created user:', user.email);
  } else {
    user.passwordHash = passwordHash;
    await user.save();
    console.log('Updated password for:', user.email);
  }

  const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, env.jwtSecret, { expiresIn: '2h' });
  console.log('Login credentials:');
  console.log('  email   :', email);
  console.log('  password:', password);
  console.log('\nJWT token (2h):');
  console.log(token);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });


