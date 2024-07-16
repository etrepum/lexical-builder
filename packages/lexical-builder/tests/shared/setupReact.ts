import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

global.IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  cleanup();
});
