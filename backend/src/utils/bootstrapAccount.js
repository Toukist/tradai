import bcrypt from 'bcryptjs';

export const BOOTSTRAP_EMAIL = 'corentin.istace@hotmail.com';
const BOOTSTRAP_USER_ID = 'bootstrap-corentin-all-in';
const BOOTSTRAP_NAME = 'Corentin Istace';
const BOOTSTRAP_PLAN = 'team';
const BOOTSTRAP_PASSWORD_HASH = '$2a$10$cV5DJkFX8SSGanQ/aX5YgeBXhW8jO.jgPpb6XuVPRzkVyc84fEuFq';

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