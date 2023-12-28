import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

export const hashPassword = (password) => {
  const salt = randomBytes(20).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
};

export const verifyPassword = (password, hashedPassword) => {
  const [salt, hash] = hashedPassword.split(":");
  const test_hash_buffer = scryptSync(password, salt, 64);

  const hash_buffer = Buffer.from(hash, "hex");
  const match_status = timingSafeEqual(hash_buffer, test_hash_buffer);

  return match_status;
};
