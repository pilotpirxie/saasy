import { pbkdf2Sync } from "crypto";

export function getHashedPassword({
  password,
  salt,
  iterations,
}: {
  password: string;
  salt: string;
  iterations: number;
}) {
  return pbkdf2Sync(
    password,
    salt,
    iterations,
    64,
    "sha512",
  ).toString("hex");
}
