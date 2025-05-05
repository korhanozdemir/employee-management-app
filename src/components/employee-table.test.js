// File: employee-management-app/src/components/employee-table.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Import the component definition
import "./employee-table.js";
// Import t for labels/titles
import { t } from "../localization/localization.js";

// Mock employee data
const mockEmployees = [
  {
    id: "1",
    firstName: "Table",
    lastName: "Tester",
    dateOfEmployment: "2023-01-15",
    dateOfBirth: "1990-05-20",
    phoneNumber: "111-222-3333",
    email: "table.tester@example.com",
    department: "QA",
    position: "Tester",
  },
  {
    id: "2",
    firstName: "Another",
    lastName: "Entry",
    dateOfEmployment: "2022-08-01",
    dateOfBirth: "1992-11-30",
    phoneNumber: "444-555-6666",
    email: "another.entry@example.com",
    department: "Dev",
    position: "Dev",
  },
];

// Expected formatted dates (MM/DD/YYYY via toLocaleDateString in the component)
// Note: This format depends on the locale of the test environment (usually en-US)
// We'll format them here for comparison, assuming en-US-like locale.
const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    // Mimic the component's formatting logic for comparison
    const date = new Date(dateString);
    const utcDate = new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    );
    return utcDate.toLocaleDateString("en-US", {
      // Specify locale for consistency
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return dateString;
  }
};

const expectedFormattedDate1Emp = formatDate(mockEmployees[0].dateOfEmployment); // '01/15/2023'
const expectedFormattedDate1Birth = formatDate(mockEmployees[0].dateOfBirth); // '05/20/1990'
const expectedFormattedDate2Emp = formatDate(mockEmployees[1].dateOfEmployment); // '08/01/2022'
const expectedFormattedDate2Birth = formatDate(mockEmployees[1].dateOfBirth); // '11/30/1992'

describe("EmployeeTable", () => {
  let element;

  // Helper to get elements
  const getElements = (el) => ({
    table: el.shadowRoot.querySelector("table"),
    headerCheckbox: el.shadowRoot.querySelector(
      'thead th input[type="checkbox"]'
    ),
    rows: Array.from(el.shadowRoot.querySelectorAll("tbody tr")),
    getCell: (row, index) => row?.querySelectorAll("td")[index],
    getRowCheckbox: (row) => row?.querySelector('td input[type="checkbox"]'),
    getEditButton: (row) => row?.querySelector(".actions button.icon-edit"),
    getDeleteButton: (row) => row?.querySelector(".actions button.icon-delete"),
    getNoResultsRow: () => el.shadowRoot.querySelector(".no-results-row"),
  });

  // Setup: Create element and add to body before each test
  beforeEach(async () => {
    element = document.createElement("employee-table");
    document.body.appendChild(element);
    // Initial wait might still be needed depending on component internals
    await element.updateComplete;
  });

  // Teardown: Remove element after each test
  afterEach(() => {
    document.body.removeChild(element);
    element = null;
  });

  it("should render the correct number of rows based on the employees prop", async () => {
    element.employees = mockEmployees;
    await element.updateComplete; // Wait for render
    const { rows, getNoResultsRow } = getElements(element);
    expect(rows.length).toBe(mockEmployees.length);
    expect(getNoResultsRow()).toBeNull();
  });

  it('should render a "no results" message when employees array is empty', async () => {
    element.employees = [];
    await element.updateComplete; // Wait for render
    const { rows, getNoResultsRow } = getElements(element);
    expect(rows.length).toBe(1); // The row containing the message
    expect(getNoResultsRow()).toBeDefined();
    expect(getNoResultsRow().textContent).toContain(t("noEmployeesFound"));
  });

  it("should display employee data accurately in cells", async () => {
    element.employees = mockEmployees;
    await element.updateComplete; // Wait for render
    const { rows, getCell } = getElements(element);

    // Check first row
    const emp1 = mockEmployees[0];
    const row1 = rows[0];
    expect(row1).toBeDefined(); // Add check if row exists
    expect(getCell(row1, 1)?.textContent.trim()).toBe(emp1.firstName);
    expect(getCell(row1, 2)?.textContent.trim()).toBe(emp1.lastName);
    expect(getCell(row1, 3)?.textContent.trim()).toBe(
      expectedFormattedDate1Emp
    );
    expect(getCell(row1, 4)?.textContent.trim()).toBe(
      expectedFormattedDate1Birth
    );
    expect(getCell(row1, 5)?.textContent.trim()).toBe(emp1.phoneNumber);
    expect(getCell(row1, 6)?.textContent.trim()).toBe(emp1.email);
    expect(getCell(row1, 7)?.textContent.trim()).toBe(emp1.department);
    expect(getCell(row1, 8)?.textContent.trim()).toBe(emp1.position);

    // Check second row
    const emp2 = mockEmployees[1];
    const row2 = rows[1];
    expect(row2).toBeDefined();
    expect(getCell(row2, 1)?.textContent.trim()).toBe(emp2.firstName);
    expect(getCell(row2, 2)?.textContent.trim()).toBe(emp2.lastName);
    expect(getCell(row2, 3)?.textContent.trim()).toBe(
      expectedFormattedDate2Emp
    );
    // ... check other cells for row 2 if needed
  });

  it("should reflect selectedIds in row checkboxes", async () => {
    element.employees = mockEmployees;
    element.selectedIds = new Set([mockEmployees[1].id]); // Select the second employee
    await element.updateComplete; // Wait for render
    const { rows, getRowCheckbox } = getElements(element);

    expect(getRowCheckbox(rows[0])?.checked).toBe(false);
    expect(getRowCheckbox(rows[1])?.checked).toBe(true);
  });

  it("should reflect header checkbox state (checked)", async () => {
    element.isSelectAllChecked = true;
    element.isSelectAllIndeterminate = false;
    await element.updateComplete;
    const { headerCheckbox } = getElements(element);
    expect(headerCheckbox.checked).toBe(true);
    expect(headerCheckbox.indeterminate).toBe(false);
  });

  it("should reflect header checkbox state (indeterminate)", async () => {
    element.isSelectAllChecked = false;
    element.isSelectAllIndeterminate = true;
    await element.updateComplete;
    const { headerCheckbox } = getElements(element);
    expect(headerCheckbox.checked).toBe(false);
    expect(headerCheckbox.indeterminate).toBe(true);
  });

  it("should reflect header checkbox state (unchecked)", async () => {
    element.isSelectAllChecked = false;
    element.isSelectAllIndeterminate = false;
    await element.updateComplete;
    const { headerCheckbox } = getElements(element);
    expect(headerCheckbox.checked).toBe(false);
    expect(headerCheckbox.indeterminate).toBe(false);
  });

  it('should dispatch "row-selection-change" event on row checkbox click', async () => {
    element.employees = mockEmployees;
    element.selectedIds = new Set();
    await element.updateComplete; // Wait for render
    const { rows, getRowCheckbox } = getElements(element);
    const checkbox = getRowCheckbox(rows[0]);
    expect(checkbox).toBeDefined();
    const targetEmployeeId = mockEmployees[0].id;
    const listener = vi.fn();
    element.addEventListener("row-selection-change", (e) => listener(e.detail));

    checkbox.click(); // Check the box
    await element.updateComplete;

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({
      employeeId: targetEmployeeId,
      isChecked: true,
    });

    checkbox.click(); // Uncheck the box
    await element.updateComplete;

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenCalledWith({
      employeeId: targetEmployeeId,
      isChecked: false,
    });
  });

  it('should dispatch "select-all-change" event on header checkbox click', async () => {
    element.isSelectAllChecked = false;
    element.isSelectAllIndeterminate = false;
    await element.updateComplete;
    const { headerCheckbox } = getElements(element);
    const listener = vi.fn();
    element.addEventListener("select-all-change", (e) => listener(e.detail));

    headerCheckbox.click(); // Check the box
    await element.updateComplete;

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ isChecked: true });

    // No need to simulate state update, just click again
    headerCheckbox.click();
    await element.updateComplete;

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenCalledWith({ isChecked: false });
  });

  it('should dispatch "edit-employee" event on edit button click', async () => {
    element.employees = mockEmployees;
    await element.updateComplete; // Wait for render
    const { rows, getEditButton } = getElements(element);
    const editButton = getEditButton(rows[0]);
    expect(editButton).toBeDefined();
    const targetEmployeeId = mockEmployees[0].id;
    const listener = vi.fn();
    element.addEventListener("edit-employee", (e) => listener(e.detail));

    editButton.click();
    await element.updateComplete;

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ employeeId: targetEmployeeId });
  });

  it('should dispatch "delete-employee" event on delete button click', async () => {
    element.employees = mockEmployees;
    await element.updateComplete; // Wait for render
    const { rows, getDeleteButton } = getElements(element);
    const deleteButton = getDeleteButton(rows[1]); // Test on second row
    expect(deleteButton).toBeDefined();
    const targetEmployeeId = mockEmployees[1].id;
    const listener = vi.fn();
    element.addEventListener("delete-employee", (e) => listener(e.detail));

    deleteButton.click();
    await element.updateComplete;

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ employeeId: targetEmployeeId });
  });
});
