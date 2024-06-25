import { defineConfig } from "vite";
import { defineTestConfig } from "@etrepum/lexical-builder/tests/shared/defineTestConfig";

export default defineConfig(await defineTestConfig(import.meta.url));
