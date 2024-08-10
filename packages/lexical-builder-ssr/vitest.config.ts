import { defineConfig } from "vite";
import { defineTestConfig } from "../lexical-builder/tests/shared/defineTestConfig";

export default defineConfig(await defineTestConfig(import.meta.url));
