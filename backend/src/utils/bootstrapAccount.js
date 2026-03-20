import bcrypt from 'bcryptjs';

export const BOOTSTRAP_EMAIL = 'corentin.istace@hotmail.com';
const BOOTSTRAP_USER_ID = 'bootstrap-corentin-all-in';
const BOOTSTRAP_NAME = 'Corentin Istace';
const BOOTSTRAP_PLAN = 'team';
const BOOTSTRAP_PASSWORD_HASH = '$2a$10$QjH6qE5QmLsDHM9KQnPL5.k4SslTXaTx6pqgzXw1hzQbrBYAkBBvy';

export function isBootstrapEmail(email = '') {
  return String(email).trim().toLowerCase() === BOOTSTRAP_EMAIL;
}

export function isBootstrapUserId(userId = '') {
  return userId === BOOTSTRAP_USER_ID;
}

export function getBootstrapUser(name = BOOTSTRAP_NAME) {
  return {
    id: BOOTSTRAP_USER_ID,
    email: BOOTSTRAP_EMAIL,
    name: name || BOOTSTRAP_NAME,
    plan: BOOTSTRAP_PLAN,
    questions_today: 0,
  };
}

export async function verifyBootstrapPassword(password) {
  return bcrypt.compare(password, BOOTSTRAP_PASSWORD_HASH);
}