// Simple in-memory user store for demo purposes.
// Replace with your database logic in production.

const emailToUser = new Map();

export function findOrCreateUserByEmail(email) {
  let user = emailToUser.get(email);
  if (!user) {
    user = {
      id: `user_${Math.random().toString(36).slice(2, 10)}`,
      email,
      role: 'user',
      createdAt: new Date().toISOString(),
    };
    emailToUser.set(email, user);
  }
  return user;
}

export function getUserByEmail(email) {
  return emailToUser.get(email) || null;
}

export default { findOrCreateUserByEmail, getUserByEmail };


