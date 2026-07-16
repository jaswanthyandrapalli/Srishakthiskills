/**
 * Validates whether the given string is a valid email format.
 * 
 * @param email Email input string
 * @returns boolean
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates whether the password meets security requirements (min 8 characters).
 * 
 * @param password Password input string
 * @returns boolean
 */
export const validatePassword = (password: string): boolean => {
  return typeof password === 'string' && password.length >= 8;
};
