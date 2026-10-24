import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vitest";

// Generated components expose `data-ocid` rather than `data-testid`.
configure({ testIdAttribute: "data-ocid" });

afterEach(() => {
  cleanup();
});
