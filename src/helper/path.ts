import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ROOT_DIR = path.join(__dirname, "..");
export const SRC_DIR = ROOT_DIR;
export const TEMPLATES_DIR = path.join(SRC_DIR, "templates");
export const EMAIL_TEMPLATES_DIR = path.join(TEMPLATES_DIR, "emails");
