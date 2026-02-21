import { Google, GitHub } from "arctic";

const APP_URL = process.env.APP_URL ?? "http://localhost:5173";
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3001";

export const google = new Google(
  process.env.GOOGLE_CLIENT_ID ?? "",
  process.env.GOOGLE_CLIENT_SECRET ?? "",
  `${BACKEND_URL}/api/auth/callback/google`,
);

export const github = new GitHub(
  process.env.GITHUB_CLIENT_ID ?? "",
  process.env.GITHUB_CLIENT_SECRET ?? "",
  `${BACKEND_URL}/api/auth/callback/github`,
);

export const appUrl = APP_URL;
