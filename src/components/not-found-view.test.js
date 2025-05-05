// File: employee-management-app/src/components/not-found-view.test.js
import { describe, it, expect, afterEach } from "vitest";
import { fixture, html } from "@open-wc/testing";

// Import the component definition
import "./not-found-view.js";
import { t } from "../localization/localization.js";

describe("NotFoundView", () => {
  let element;

  afterEach(() => {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
    element = null;
  });

  it("should render the not found message", async () => {
    element = await fixture(html`<not-found-view></not-found-view>`);
    await element.updateComplete;

    const heading = element.shadowRoot.querySelector("h2");
    const paragraph = element.shadowRoot.querySelector("p");
    const link = element.shadowRoot.querySelector("a");

    expect(heading).toBeDefined();
    expect(heading.textContent).toContain(t("notFoundTitle"));
    expect(paragraph).toBeDefined();
    expect(paragraph.textContent).toContain(t("notFoundMessage"));
    expect(link).toBeDefined();
    expect(link.textContent).toContain(t("notFoundLink"));
    expect(link.getAttribute("href")).toBe("/");
  });
});
