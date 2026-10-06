import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BrandMark } from "./brand-mark";

describe("BrandMark", () => {
  it("renders the official product name", () => {
    render(<BrandMark />);

    expect(screen.getByText("Struktiva")).toBeVisible();
  });
});
