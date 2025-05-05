import { describe, it, expect, afterEach } from "vitest";
import { fixture, html } from "@open-wc/testing";

// Import the component definition
import "./nav-menu.js";
import { t } from "../localization/localization.js";

describe("NavMenu", () => {
  let element;

  // Helper to create the element with a specific location
  async function setupElement(pathname) {
    const location = { pathname: pathname || "/" }; // Simulate router location object
    element = await fixture(html`<nav-menu .location=${location}></nav-menu>`);
    await element.updateComplete;
    return element;
  }

  afterEach(() => {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
    element = null;
  });

  it("should render the navigation links", async () => {
    element = await setupElement("/employees");
    const links = element.shadowRoot.querySelectorAll("a");

    // Check based on expected links - assuming Employees and Add Employee
    expect(links.length).toBeGreaterThanOrEqual(2);

    const employeesLink = element.shadowRoot.querySelector(
      'a[href="/employees"]'
    );
    expect(employeesLink).toBeDefined();
    // Check actual text, accounting for potential whitespace
    expect(employeesLink.textContent.trim()).toBe("Employees");

    const addLink = element.shadowRoot.querySelector('a[href="/add-employee"]');
    expect(addLink).toBeDefined();
    // Check actual text based on the key "addEmployee" and en.json value
    expect(addLink.textContent.trim()).toBe("Add New");

    // Check for icons if they are expected
    // const employeeIcon = employeesLink.querySelector('img'); // Example
    // expect(employeeIcon).toBeDefined();
  });

  it("should apply active class to the link matching current location", async () => {
    const currentPath = "/employees";
    element = await setupElement(currentPath);

    const employeesLink = element.shadowRoot.querySelector(
      `a[href="${currentPath}"]`
    );
    const addLink = element.shadowRoot.querySelector('a[href="/add-employee"]');

    expect(employeesLink.classList.contains("active")).toBe(true);
    expect(addLink.classList.contains("active")).toBe(false);
  });

  it("should apply active class to Add Employee link when location matches", async () => {
    const currentPath = "/add-employee";
    element = await setupElement(currentPath);

    const employeesLink = element.shadowRoot.querySelector(
      'a[href="/employees"]'
    );
    const addLink = element.shadowRoot.querySelector(
      `a[href="${currentPath}"]`
    );

    expect(employeesLink.classList.contains("active")).toBe(false);
    expect(addLink.classList.contains("active")).toBe(true);
  });

  it("should not apply active class if no link matches", async () => {
    element = await setupElement("/some-other-path");

    const links = element.shadowRoot.querySelectorAll("a.active");
    expect(links.length).toBe(0);
  });
});
