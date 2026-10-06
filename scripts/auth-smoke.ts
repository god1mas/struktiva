import "dotenv/config";
import { auth } from "../src/lib/auth";

if (!auth.handler) {
  throw new Error("Better Auth handler is unavailable");
}

console.log("Better Auth configuration loaded successfully.");
