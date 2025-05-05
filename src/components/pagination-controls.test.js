import { describe, it, expect, beforeAll, afterAll } from "vitest"; // Import vitest globals
import { fixture, expect as chaiExpect, html } from "@open-wc/testing"; // Keep OWC testing helpers for now
import sinon from "sinon";

// Import the component definition
import "./pagination-controls.js";
// Import t for titles
import { t } from "../localization/localization.js";

describe("PaginationControls", () => {
  // Helper function remains the same for now
  const getElements = (el) => ({
    prevButton: el.shadowRoot.querySelector("button:first-of-type"),
    nextButton: el.shadowRoot.querySelector("button:last-of-type"),
    pageButtons: Array.from(
      el.shadowRoot.querySelectorAll("button.page-number")
    ),
    ellipses: Array.from(el.shadowRoot.querySelectorAll("span.ellipsis")),
  });

  // Tests using fixture and expect (updated to Vitest expect syntax where possible)
  it("should not render if totalPages is 1 or less", async () => {
    let el = await fixture(
      html`<pagination-controls
        .currentPage=${1}
        .totalPages=${1}
      ></pagination-controls>`
    );
    await el.updateComplete;
    expect(el.shadowRoot.querySelector("button")).toBeNull();

    el = await fixture(
      html`<pagination-controls
        .currentPage=${1}
        .totalPages=${0}
      ></pagination-controls>`
    );
    await el.updateComplete;
    expect(el.shadowRoot.querySelector("button")).toBeNull();
  });

  it("should render basic controls for a few pages", async () => {
    const totalPages = 3;
    const currentPage = 1;
    const el = await fixture(
      html`<pagination-controls
        .currentPage=${currentPage}
        .totalPages=${totalPages}
      ></pagination-controls>`
    );
    const { prevButton, nextButton, pageButtons, ellipses } = getElements(el);

    expect(prevButton).toBeDefined();
    expect(prevButton.disabled).toBe(true);
    expect(nextButton).toBeDefined();
    expect(nextButton.disabled).toBe(false);
    expect(pageButtons.length).toBe(totalPages);
    expect(pageButtons[0].textContent.trim()).toBe("1");
    expect(pageButtons[0].classList.contains("active")).toBe(true);
    expect(pageButtons[1].textContent.trim()).toBe("2");
    expect(pageButtons[1].classList.contains("active")).toBe(false);
    expect(pageButtons[2].textContent.trim()).toBe("3");
    expect(pageButtons[2].classList.contains("active")).toBe(false);
    expect(ellipses.length).toBe(0);
  });

  it("should render ellipses correctly for many pages (middle)", async () => {
    const totalPages = 10;
    const currentPage = 5;
    const el = await fixture(
      html`<pagination-controls
        .currentPage=${currentPage}
        .totalPages=${totalPages}
      ></pagination-controls>`
    );
    const { prevButton, nextButton, pageButtons, ellipses } = getElements(el);

    expect(prevButton.disabled).toBe(false);
    expect(nextButton.disabled).toBe(false);
    expect(ellipses.length).toBe(2);
    expect(pageButtons.length).toBe(5);
    expect(pageButtons[0].textContent.trim()).toBe("1");
    expect(pageButtons[1].textContent.trim()).toBe("4");
    expect(pageButtons[2].textContent.trim()).toBe("5");
    expect(pageButtons[2].classList.contains("active")).toBe(true);
    expect(pageButtons[3].textContent.trim()).toBe("6");
    expect(pageButtons[4].textContent.trim()).toBe("10");
  });

  it("should render ellipses correctly for many pages (start)", async () => {
    const totalPages = 10;
    const currentPage = 2;
    const el = await fixture(
      html`<pagination-controls
        .currentPage=${currentPage}
        .totalPages=${totalPages}
      ></pagination-controls>`
    );
    const { pageButtons, ellipses } = getElements(el);

    expect(ellipses.length).toBe(1);
    expect(pageButtons.length).toBe(4);
    expect(pageButtons[0].textContent.trim()).toBe("1");
    expect(pageButtons[1].textContent.trim()).toBe("2");
    expect(pageButtons[1].classList.contains("active")).toBe(true);
    expect(pageButtons[2].textContent.trim()).toBe("3");
    expect(pageButtons[3].textContent.trim()).toBe("10");
  });

  it("should render ellipses correctly for many pages (end)", async () => {
    const totalPages = 10;
    const currentPage = 9;
    const el = await fixture(
      html`<pagination-controls
        .currentPage=${currentPage}
        .totalPages=${totalPages}
      ></pagination-controls>`
    );
    const { pageButtons, ellipses } = getElements(el);

    expect(ellipses.length).toBe(1);
    expect(pageButtons.length).toBe(4);
    expect(pageButtons[0].textContent.trim()).toBe("1");
    expect(pageButtons[1].textContent.trim()).toBe("8");
    expect(pageButtons[2].textContent.trim()).toBe("9");
    expect(pageButtons[2].classList.contains("active")).toBe(true);
    expect(pageButtons[3].textContent.trim()).toBe("10");
  });

  it("should disable next button on the last page", async () => {
    const totalPages = 5;
    const currentPage = 5;
    const el = await fixture(
      html`<pagination-controls
        .currentPage=${currentPage}
        .totalPages=${totalPages}
      ></pagination-controls>`
    );
    const { prevButton, nextButton, pageButtons } = getElements(el);

    expect(prevButton.disabled).toBe(false);
    expect(nextButton.disabled).toBe(true);
    expect(
      pageButtons[pageButtons.length - 1].classList.contains("active")
    ).toBe(true);
  });

  it('should dispatch "page-change" event with correct page number when a page button is clicked', async () => {
    const totalPages = 5;
    const currentPage = 2;
    const el = await fixture(
      html`<pagination-controls
        .currentPage=${currentPage}
        .totalPages=${totalPages}
      ></pagination-controls>`
    );
    const { pageButtons } = getElements(el);
    const targetPage = 3;
    const targetButton = pageButtons.find(
      (btn) => btn.textContent.trim() === String(targetPage)
    );

    const eventPromise = new Promise((resolve) => {
      el.addEventListener("page-change", (e) => resolve(e), { once: true });
    });
    targetButton.click();
    const event = await eventPromise;

    expect(event).toBeDefined();
    expect(event.detail).toEqual({ page: targetPage }); // Use toEqual for deep comparison
  });

  it('should dispatch "page-change" event with correct page number when next button is clicked', async () => {
    const totalPages = 5;
    const currentPage = 2;
    const el = await fixture(
      html`<pagination-controls
        .currentPage=${currentPage}
        .totalPages=${totalPages}
      ></pagination-controls>`
    );
    const { nextButton } = getElements(el);

    const eventPromise = new Promise((resolve) => {
      el.addEventListener("page-change", (e) => resolve(e), { once: true });
    });
    nextButton.click();
    const event = await eventPromise;

    expect(event).toBeDefined();
    expect(event.detail).toEqual({ page: currentPage + 1 });
  });

  it('should dispatch "page-change" event with correct page number when prev button is clicked', async () => {
    const totalPages = 5;
    const currentPage = 3;
    const el = await fixture(
      html`<pagination-controls
        .currentPage=${currentPage}
        .totalPages=${totalPages}
      ></pagination-controls>`
    );
    const { prevButton } = getElements(el);

    const eventPromise = new Promise((resolve) => {
      el.addEventListener("page-change", (e) => resolve(e), { once: true });
    });
    prevButton.click();
    const event = await eventPromise;

    expect(event).toBeDefined();
    expect(event.detail).toEqual({ page: currentPage - 1 });
  });

  it('should not dispatch "page-change" event when clicking the active page button', async () => {
    const totalPages = 5;
    const currentPage = 3;
    const el = await fixture(
      html`<pagination-controls
        .currentPage=${currentPage}
        .totalPages=${totalPages}
      ></pagination-controls>`
    );
    const { pageButtons } = getElements(el);
    const activeButton = pageButtons.find((btn) =>
      btn.classList.contains("active")
    );

    const listener = sinon.spy();
    el.addEventListener("page-change", listener);
    activeButton.click(); // Click the already active button

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(listener.called).toBe(false);
    el.removeEventListener("page-change", listener);
  });

  it("should have correct titles for prev/next buttons", async () => {
    const el = await fixture(
      html`<pagination-controls
        .currentPage=${2}
        .totalPages=${3}
      ></pagination-controls>`
    );
    const { prevButton, nextButton } = getElements(el);

    expect(prevButton.title).toBe(t("previousPage"));
    expect(nextButton.title).toBe(t("nextPage"));
  });
});
