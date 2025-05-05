// File: employee-management-app/src/components/employee-card.test.js
import { describe, it, expect, vi } from "vitest";
import { fixture, html } from "@open-wc/testing";
// Import the component definition
import "./employee-card.js";
// Import t for labels
import { t } from "../localization/localization.js";

// Mock employee data
const mockEmployee = {
  id: "test-123",
  firstName: "Ada",
  lastName: "Lovelace",
  position: "Pioneer",
  email: "ada.lovelace@example.com",
  phoneNumber: "123-456-7890",
  department: "Computing",
  dateOfEmployment: "1843-10-15", // YYYY-MM-DD format
};

// Expected formatted date (DD Mon YYYY)
// Note: Month names are hardcoded in the component, so this should be stable
const expectedFormattedDate = "15 Oct 1843";

describe("EmployeeCard", () => {
  // Helper to get elements (adjust selectors as needed)
  const getElements = (el) => ({
    nameElement: el.shadowRoot.querySelector(".name-position h3"),
    positionElement: el.shadowRoot.querySelector(".name-position span"),
    emailLink: el.shadowRoot.querySelector('.detail-value a[href^="mailto:"]'),
    phoneElement: el.shadowRoot.querySelector(
      ".card-details span.detail-value:nth-of-type(4)"
    ), // Adjust index based on final structure if needed
    departmentElement: el.shadowRoot.querySelector(
      ".card-details span.detail-value:nth-of-type(6)"
    ),
    dateElement: el.shadowRoot.querySelector(
      ".card-details span.detail-value:nth-of-type(8)"
    ),
    editButton: el.shadowRoot.querySelector(".btn-edit"),
    deleteButton: el.shadowRoot.querySelector(".btn-delete"),
  });

  it("should render employee data correctly", async () => {
    const el = await fixture(
      html`<employee-card .employee=${mockEmployee}></employee-card>`
    );
    const {
      nameElement,
      positionElement,
      emailLink,
      phoneElement,
      departmentElement,
      dateElement,
    } = getElements(el);

    expect(nameElement.textContent.trim()).toBe(
      `${mockEmployee.firstName} ${mockEmployee.lastName}`
    );
    expect(positionElement.textContent.trim()).toBe(mockEmployee.position);
    expect(emailLink).toBeDefined();
    expect(emailLink.textContent.trim()).toBe(mockEmployee.email);
    expect(emailLink.href).toBe(`mailto:${mockEmployee.email}`);
    // Need to adjust nth-of-type based on actual rendered output if structure changes
    // Let's query by text content relative to key for robustness if possible, or stick to indices carefully
    // Assuming indices based on current structure:
    expect(
      el.shadowRoot
        .querySelector(".detail-key:nth-of-type(3)")
        .textContent.trim()
    ).toBe(t("phoneLabel"));
    expect(phoneElement.textContent.trim()).toBe(mockEmployee.phoneNumber);
    expect(
      el.shadowRoot
        .querySelector(".detail-key:nth-of-type(5)")
        .textContent.trim()
    ).toBe(t("departmentLabel"));
    expect(departmentElement.textContent.trim()).toBe(mockEmployee.department);
    expect(
      el.shadowRoot
        .querySelector(".detail-key:nth-of-type(7)")
        .textContent.trim()
    ).toBe(t("joinedLabel"));
    expect(dateElement.textContent.trim()).toBe(expectedFormattedDate); // Check formatted date
  });

  it("should format the date correctly (DD Mon YYYY)", async () => {
    const el = await fixture(
      html`<employee-card .employee=${mockEmployee}></employee-card>`
    );
    const dateElement = getElements(el).dateElement;
    expect(dateElement.textContent.trim()).toBe(expectedFormattedDate);

    // Test edge case: null date
    const employeeWithNullDate = { ...mockEmployee, dateOfEmployment: null };
    const el2 = await fixture(
      html`<employee-card .employee=${employeeWithNullDate}></employee-card>`
    );
    const dateElement2 = getElements(el2).dateElement;
    expect(dateElement2.textContent.trim()).toBe("");

    // Test edge case: invalid date string (should return original string ideally, or empty)
    const employeeWithInvalidDate = {
      ...mockEmployee,
      dateOfEmployment: "invalid-date-string",
    };
    const el3 = await fixture(
      html`<employee-card .employee=${employeeWithInvalidDate}></employee-card>`
    );
    const dateElement3 = getElements(el3).dateElement;
    expect(dateElement3.textContent.trim()).toBe("invalid-date-string"); // Current behavior returns original on error
  });

  it('should dispatch "edit-employee" event with employeeId when Edit button is clicked', async () => {
    const el = await fixture(
      html`<employee-card .employee=${mockEmployee}></employee-card>`
    );
    const { editButton } = getElements(el);

    const listener = vi.fn();
    el.addEventListener("edit-employee", (e) => listener(e.detail));

    editButton.click();
    await el.updateComplete; // Wait for potential Lit update cycles

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ employeeId: mockEmployee.id });
  });

  it('should dispatch "delete-employee" event with employeeId when Delete button is clicked', async () => {
    const el = await fixture(
      html`<employee-card .employee=${mockEmployee}></employee-card>`
    );
    const { deleteButton } = getElements(el);

    const listener = vi.fn();
    el.addEventListener("delete-employee", (e) => listener(e.detail));

    deleteButton.click();
    await el.updateComplete;

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ employeeId: mockEmployee.id });
  });

  it("should render empty if no employee data is provided", async () => {
    const el = await fixture(html`<employee-card></employee-card>`);
    // Check that the main container is empty or minimal
    expect(el.shadowRoot.querySelector(".employee-card")).toBeNull();
  });

  it("should render empty if employee data lacks an id", async () => {
    const employeeWithoutId = { ...mockEmployee, id: undefined };
    const el = await fixture(
      html`<employee-card .employee=${employeeWithoutId}></employee-card>`
    );
    expect(el.shadowRoot.querySelector(".employee-card")).toBeNull();
  });
});
