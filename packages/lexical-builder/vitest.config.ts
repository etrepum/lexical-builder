import { defineConfig } from "vitest/config";
import { defineTestConfig } from "./tests/shared/defineTestConfig";

export default defineConfig(await defineTestConfig(import.meta.url));
