// File: employee-management-app/src/components/employee-list.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fixture, html, nextFrame, oneEvent } from "@open-wc/testing";

// Remove top-level mock function definitions

vi.mock("../state/store.js", () => {
  // Define mock functions INSIDE the factory
  const mockGetEmployees = vi.fn();
  const mockDeleteEmployee = vi.fn();
  const mockDeleteEmployees = vi.fn();
  const mockSubscribe = vi.fn();

  let state = { employees: [] }; // Internal mock state
  let listeners = [];

  mockGetEmployees.mockImplementation(() => state.employees);
  mockSubscribe.mockImplementation((listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  });

  const _simulateStateUpdate = (newState) => {
    state = { ...state, ...newState };
    const currentState = { ...state }; // Create a copy to pass
    // Pass the updated state to the listener
    listeners.forEach((l) => l(currentState));
  };

  const _resetStoreState = () => {
    state = { employees: [] };
    listeners = [];
    mockGetEmployees.mockClear();
    mockDeleteEmployee.mockClear();
    mockDeleteEmployees.mockClear();
    mockSubscribe.mockClear();
  };

  return {
    store: {
      getEmployees: mockGetEmployees,
      deleteEmployee: mockDeleteEmployee,
      deleteEmployees: mockDeleteEmployees,
      subscribe: mockSubscribe,
      getState: () => state,
    },
    // Expose helpers AND mocks for tests
    _simulateStoreUpdate: _simulateStateUpdate,
    _resetStoreState: _resetStoreState,
    _mockGetEmployees: mockGetEmployees,
    _mockDeleteEmployee: mockDeleteEmployee,
    _mockDeleteEmployees: mockDeleteEmployees,
    _mockSubscribe: mockSubscribe,
  };
});

// Mock Router internal function
vi.mock("@vaadin/router", () => {
  // Define mock function INSIDE the factory
  const mockRouterGo = vi.fn();
  return {
    Router: class {
      static go = mockRouterGo;
    },
    // Expose mock if needed for assertions
    _mockRouterGo: mockRouterGo,
  };
});

// Import the component AFTER mocks are set up
import "./employee-list.js";
// Import helpers and MOCKS from the mocked store module
import {
  store,
  _simulateStoreUpdate,
  _resetStoreState,
  _mockGetEmployees,
  _mockDeleteEmployee,
  _mockDeleteEmployees,
  _mockSubscribe,
} from "../state/store.js";
// Import Router and potentially the exposed mock function
import { Router, _mockRouterGo } from "@vaadin/router";
import { t } from "../localization/localization.js";

// Sample employee data
const mockEmployees = Array.from({ length: 15 }, (_, i) => ({
  id: `${i + 1}`,
  firstName: `First${i + 1}`,
  lastName: `Last${i + 1}`,
  dateOfEmployment: `2023-01-${15 + i}`,
  dateOfBirth: `1990-05-${20 + i}`,
  phoneNumber: `111-222-33${String(i + 10).padStart(2, "0")}`,
  email: `first${i + 1}.last${i + 1}@example.com`,
  department: i % 2 === 0 ? "Tech" : "Analytics",
  position: i % 3 === 0 ? "Junior" : i % 3 === 1 ? "Medior" : "Senior",
}));

const ITEMS_PER_PAGE = 8; // Ensure this matches component

describe("EmployeeList", () => {
  let element;
  // We might need to reference the imported router mock later
  // const routerGoMock = _mockRouterGo; // Example if needed for assertions

  // Helper to find common elements
  const getElements = (el) => ({
    searchInput: el.shadowRoot.querySelector(".search-input"),
    viewToggleButtons: el.shadowRoot.querySelectorAll(".view-toggle button"),
    tableViewButton: el.shadowRoot.querySelector(".view-toggle .icon-table"),
    listViewButton: el.shadowRoot.querySelector(".view-toggle .icon-list"),
    employeeTable: el.shadowRoot.querySelector("employee-table"),
    employeeCardGrid: el.shadowRoot.querySelector(".list-view-grid"),
    paginationControls: el.shadowRoot.querySelector("pagination-controls"),
    noResultsMessage: el.shadowRoot.querySelector(".no-results"),
    bulkDeleteButton: el.shadowRoot.querySelector(".delete-selected-btn"),
  });

  beforeEach(() => {
    _resetStoreState(); // Reset mock store state (uses internal mocks now)
    vi.resetAllMocks(); // Reset Vitest mocks (will clear _mockRouterGo automatically)
    // Set initial store state using the imported mock
    _mockGetEmployees.mockReturnValue(mockEmployees);
  });

  afterEach(() => {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
    element = null;
  });

  it("should render the initial layout with table view by default", async () => {
    element = await fixture(html`<employee-list></employee-list>`);
    await element.updateComplete;
    await nextFrame(); // Wait for potential async rendering
    await element.updateComplete;

    const { searchInput, tableViewButton, employeeTable, paginationControls } =
      getElements(element);

    expect(searchInput).toBeDefined();
    expect(tableViewButton).toBeDefined();
    expect(employeeTable).toBeDefined();
    expect(paginationControls).toBeDefined();
    expect(getElements(element).employeeCardGrid).toBeNull(); // List view grid shouldn't exist
    // Use imported mock for assertion
    expect(_mockSubscribe).toHaveBeenCalled(); // Check store subscription
  });

  it("should display employees from the store in the table view", async () => {
    element = await fixture(html`<employee-list></employee-list>`);
    await element.updateComplete;
    await nextFrame();
    await element.updateComplete;
    await nextFrame();

    const table = getElements(element).employeeTable;
    expect(table).toBeDefined();
    // Check if the table received the first page of employees
    expect(table.employees).toEqual(mockEmployees.slice(0, ITEMS_PER_PAGE));
    // Or check rendered rows within the table component if possible/necessary
  });

  it("should display no results message when store has no employees", async () => {
    // Use imported mock for setup
    _mockGetEmployees.mockReturnValue([]); // Override setup for this test
    element = await fixture(html`<employee-list></employee-list>`);
    // Add extra waits after fixture creation for initial render with empty data
    await element.updateComplete;
    await nextFrame();
    await element.updateComplete;
    await nextFrame(); // Potentially need two cycles for render logic

    const { noResultsMessage } = getElements(element);
    expect(noResultsMessage).toBeDefined();
  });

  it("should update the view when the store updates", async () => {
    // Start with component rendered (beforeEach sets mock store)
    element = await fixture(html`<employee-list></employee-list>`);
    await element.updateComplete;
    await nextFrame();
    await element.updateComplete;
    await nextFrame();

    // Initially, first page of employees SHOULD be present
    expect(getElements(element).employeeTable).toBeDefined();
    expect(element._getCurrentPageEmployees()).toEqual(
      mockEmployees.slice(0, ITEMS_PER_PAGE)
    );

    // Now, manually change the component's state and trigger update
    element._employees = []; // Set internal state directly
    element.requestUpdate(); // Trigger update cycle
    await element.updateComplete;
    await nextFrame();
    await element.updateComplete;
    await nextFrame();

    // Check that the view updated to 'no results'
    expect(getElements(element).noResultsMessage).toBeDefined();

    // Now, set state back and trigger update
    element._employees = mockEmployees; // Set internal state directly
    element.requestUpdate(); // Trigger update cycle
    await element.updateComplete;
    await nextFrame();
    await element.updateComplete;
    await nextFrame();

    // Check that the table is back and has data (first page)
    const table = getElements(element).employeeTable;
    expect(table).toBeDefined();
    expect(table.employees).toEqual(mockEmployees.slice(0, ITEMS_PER_PAGE));
    expect(getElements(element).noResultsMessage).toBeNull();
  });

  it("should toggle between table and list view", async () => {
    element = await fixture(html`<employee-list></employee-list>`);
    await element.updateComplete;
    await nextFrame();
    await element.updateComplete;
    await nextFrame();

    const { tableViewButton, listViewButton } = getElements(element);

    // Initial state: Table view active
    expect(tableViewButton.classList.contains("active")).toBe(true);
    expect(listViewButton.classList.contains("active")).toBe(false);
    expect(getElements(element).employeeTable).toBeDefined();
    expect(getElements(element).employeeCardGrid).toBeNull();

    // Click List View button
    listViewButton.click();
    await element.updateComplete;
    await nextFrame();
    await element.updateComplete;
    await nextFrame();

    // Check List view state
    expect(
      getElements(element).tableViewButton.classList.contains("active")
    ).toBe(false);
    expect(
      getElements(element).listViewButton.classList.contains("active")
    ).toBe(true);
    expect(getElements(element).employeeTable).toBeNull();
    expect(getElements(element).employeeCardGrid).toBeDefined();
    // Check if cards are rendered inside the grid (first page)
    const cards = element.shadowRoot.querySelectorAll("employee-card");
    expect(cards.length).toBe(ITEMS_PER_PAGE);

    // Click Table View button
    tableViewButton.click();
    await element.updateComplete;
    await nextFrame();
    await element.updateComplete;
    await nextFrame();

    // Check Table view state again
    expect(
      getElements(element).tableViewButton.classList.contains("active")
    ).toBe(true);
    expect(
      getElements(element).listViewButton.classList.contains("active")
    ).toBe(false);
    expect(getElements(element).employeeTable).toBeDefined();
    expect(getElements(element).employeeCardGrid).toBeNull();
  });

  it("should filter employees based on search term", async () => {
    element = await fixture(html`<employee-list></employee-list>`);
    await element.updateComplete;
    await nextFrame();
    await element.updateComplete;
    await nextFrame();

    const { searchInput } = getElements(element);

    // Initial state (first page of employees)
    expect(element._getCurrentPageEmployees().length).toBe(ITEMS_PER_PAGE);

    // Search for "First1"
    searchInput.value = "First1"; // Matches First1, First10-15
    searchInput.dispatchEvent(new Event("input"));
    await element.updateComplete;
    await nextFrame();
    await element.updateComplete;
    await nextFrame();

    // Check filtered results (7 employees match "First1")
    let table = getElements(element).employeeTable;
    expect(table).toBeDefined();
    expect(table.employees.length).toBe(7);
    expect(table.employees[0].firstName).toBe("First1");
    expect(element._getCurrentPageEmployees().length).toBe(7);
    expect(element._getCurrentPageEmployees()[0].firstName).toBe("First1");

    // Search for "Last15"
    searchInput.value = "Last15";
    searchInput.dispatchEvent(new Event("input"));
    await element.updateComplete;
    await nextFrame();
    await element.updateComplete;
    await nextFrame();

    // Check filtered results (1 employee)
    table = getElements(element).employeeTable;
    expect(table).toBeDefined();
    expect(table.employees.length).toBe(1);
    expect(table.employees[0].lastName).toBe("Last15");
    expect(element._getCurrentPageEmployees().length).toBe(1);
    expect(element._getCurrentPageEmployees()[0].lastName).toBe("Last15");

    // Search for term matching nothing
    searchInput.value = "NonExistent";
    searchInput.dispatchEvent(new Event("input"));
    await element.updateComplete;
    await nextFrame();
    await element.updateComplete;
    await nextFrame();

    // Check no results
    expect(getElements(element).noResultsMessage).toBeDefined();

    // Clear search
    searchInput.value = "";
    searchInput.dispatchEvent(new Event("input"));
    await element.updateComplete;
    await nextFrame();
    await element.updateComplete;
    await nextFrame();

    // Check first page of results back
    table = getElements(element).employeeTable;
    expect(getElements(element).noResultsMessage).toBeNull();
    expect(table).toBeDefined();
    expect(table.employees.length).toBe(ITEMS_PER_PAGE);
    expect(element._getCurrentPageEmployees().length).toBe(ITEMS_PER_PAGE);
  });

  it("should handle pagination correctly", async () => {
    // Ensure we have enough employees for multiple pages
    _mockGetEmployees.mockReturnValue(mockEmployees);
    element = await fixture(html`<employee-list></employee-list>`);
    await element.updateComplete;
    await nextFrame();
    await element.updateComplete;
    await nextFrame();

    let table = getElements(element).employeeTable;
    let pagination = getElements(element).paginationControls;
    const totalPages = Math.ceil(mockEmployees.length / ITEMS_PER_PAGE);

    // Initial state: Page 1
    expect(table.employees.length).toBe(ITEMS_PER_PAGE);
    expect(table.employees[0].id).toBe("1");
    expect(pagination.currentPage).toBe(1);
    expect(pagination.totalPages).toBe(totalPages); // Should be 2

    // Find next button using title attribute
    const nextButton = pagination.shadowRoot.querySelector(
      `button[title="${t("nextPage")}"]`
    );
    expect(nextButton).toBeDefined();

    // Click next page
    nextButton.click();
    await element.updateComplete;
    await nextFrame();
    await element.updateComplete;
    await nextFrame();

    // Check state: Page 2
    table = getElements(element).employeeTable; // Re-query elements
    pagination = getElements(element).paginationControls;
    expect(pagination.currentPage).toBe(2);
    expect(table.employees.length).toBe(mockEmployees.length - ITEMS_PER_PAGE); // 15 - 8 = 7
    expect(table.employees[0].id).toBe(`${ITEMS_PER_PAGE + 1}`); // Should be ID 9

    // Find previous button using title attribute
    const prevButton = pagination.shadowRoot.querySelector(
      `button[title="${t("previousPage")}"]`
    );
    expect(prevButton).toBeDefined();

    // Click previous page
    prevButton.click();
    await element.updateComplete;
    await nextFrame();
    await element.updateComplete;
    await nextFrame();

    // Check state: Page 1
    table = getElements(element).employeeTable;
    pagination = getElements(element).paginationControls;
    expect(pagination.currentPage).toBe(1);
    expect(table.employees.length).toBe(ITEMS_PER_PAGE);
    expect(table.employees[0].id).toBe("1");

    // TODO: Add test for clicking specific page number if buttons are available
  });

  it("should handle edit action from table view", async () => {
    element = await fixture(html`<employee-list></employee-list>`);
    await element.updateComplete; // Initial render
    await nextFrame();
    await element.updateComplete;
    await nextFrame();

    const table = getElements(element).employeeTable;
    expect(table).toBeDefined();

    // Find the edit button using its class within the first row
    const editButton = table.shadowRoot.querySelector(
      "tbody tr:first-child .actions .icon-edit" // Use class selector
    );
    expect(editButton).toBeDefined();

    editButton.click();

    // Check if Router.go was called
    expect(_mockRouterGo).toHaveBeenCalledWith("/edit-employee/1");
  });

  it("should show delete confirmation modal from table view", async () => {
    element = await fixture(html`<employee-list></employee-list>`);
    await element.updateComplete;
    await nextFrame();
    await element.updateComplete;
    await nextFrame();

    const table = getElements(element).employeeTable;
    expect(table).toBeDefined();

    // Find the delete button using its class within the first row
    const deleteButton = table.shadowRoot.querySelector(
      "tbody tr:first-child .actions .icon-delete" // Use class selector
    );
    expect(deleteButton).toBeDefined();

    deleteButton.click();
    await element.updateComplete; // Wait for modal state change
    await nextFrame();
    await element.updateComplete;
    await nextFrame();

    // Check if the modal is shown
    const modal = element.shadowRoot.querySelector("confirmation-modal");
    expect(modal).toBeDefined();
    expect(element._showDeleteModal).toBe(true); // Check internal state
  });

  it("should handle edit action from list view", async () => {
    element = await fixture(html`<employee-list></employee-list>`);
    await element.updateComplete;
    await nextFrame();
    await element.updateComplete;
    await nextFrame();

    // Switch to list view
    const { listViewButton } = getElements(element);
    listViewButton.click();
    await element.updateComplete;
    await nextFrame();
    await element.updateComplete;
    await nextFrame();

    const grid = getElements(element).employeeCardGrid;
    expect(grid).toBeDefined();

    // Find the first card and its edit button using its class
    const card = element.shadowRoot.querySelector("employee-card");
    expect(card).toBeDefined();
    const editButton = card.shadowRoot.querySelector(".card-actions .btn-edit"); // Use class selector
    expect(editButton).toBeDefined();

    editButton.click();

    // Check if Router.go was called
    expect(_mockRouterGo).toHaveBeenCalledWith("/edit-employee/1");
  });

  it("should show delete confirmation modal from list view", async () => {
    element = await fixture(html`<employee-list></employee-list>`);
    await element.updateComplete;
    await nextFrame();
    await element.updateComplete;
    await nextFrame();

    // Switch to list view
    const { listViewButton } = getElements(element);
    listViewButton.click();
    await element.updateComplete;
    await nextFrame();
    await element.updateComplete;
    await nextFrame();

    const grid = getElements(element).employeeCardGrid;
    expect(grid).toBeDefined();

    // Find the first card and its delete button using its class
    const card = element.shadowRoot.querySelector("employee-card");
    expect(card).toBeDefined();
    const deleteButton = card.shadowRoot.querySelector(
      ".card-actions .btn-delete"
    ); // Use class selector
    expect(deleteButton).toBeDefined();

    deleteButton.click();
    await element.updateComplete; // Wait for modal state change
    await nextFrame();
    await element.updateComplete;
    await nextFrame();

    // Check if the modal is shown
    const modal = element.shadowRoot.querySelector("confirmation-modal");
    expect(modal).toBeDefined();
    expect(element._showDeleteModal).toBe(true); // Check internal state
  });

  // --- More tests to add: Bulk Delete ---

  it("should handle bulk delete actions", async () => {
    element = await fixture(html`<employee-list></employee-list>`);
    await element.updateComplete;
    await nextFrame();
    await element.updateComplete;
    await nextFrame();

    let { bulkDeleteButton } = getElements(element);
    let table = getElements(element).employeeTable;

    // 1. Initially disabled
    expect(bulkDeleteButton.disabled).toBe(true);

    // 2. Select All
    const selectAllCheckbox = table.shadowRoot.querySelector(
      'thead input[type="checkbox"]'
    );
    expect(selectAllCheckbox).toBeDefined();
    selectAllCheckbox.click();
    await element.updateComplete;
    await nextFrame();
    await element.updateComplete;
    await nextFrame();

    bulkDeleteButton = getElements(element).bulkDeleteButton; // Re-query
    expect(bulkDeleteButton.disabled).toBe(false);
    // Optional: Check count if displayed, e.g.,
    // expect(bulkDeleteButton.textContent).toContain(`(${ITEMS_PER_PAGE})`);

    // 3. Deselect All
    selectAllCheckbox.click();
    await element.updateComplete;
    await nextFrame();
    await element.updateComplete;
    await nextFrame();
    bulkDeleteButton = getElements(element).bulkDeleteButton; // Re-query
    expect(bulkDeleteButton.disabled).toBe(true);

    // 4. Select Some
    const firstRowCheckbox = table.shadowRoot.querySelector(
      'tbody tr:first-child input[type="checkbox"]'
    );
    const secondRowCheckbox = table.shadowRoot.querySelector(
      'tbody tr:nth-child(2) input[type="checkbox"]'
    );
    expect(firstRowCheckbox).toBeDefined();
    expect(secondRowCheckbox).toBeDefined();

    firstRowCheckbox.click();
    secondRowCheckbox.click();
    await element.updateComplete;
    await nextFrame();
    await element.updateComplete;
    await nextFrame();

    bulkDeleteButton = getElements(element).bulkDeleteButton; // Re-query
    expect(bulkDeleteButton.disabled).toBe(false);
    // Optional: Check count if displayed, e.g.,
    // expect(bulkDeleteButton.textContent).toContain("(2)");

    // 5. Click Bulk Delete Button
    bulkDeleteButton.click();
    await element.updateComplete;
    await nextFrame();
    await element.updateComplete;
    await nextFrame();

    // 6. Check Bulk Delete Modal
    const modal = element.shadowRoot.querySelector("confirmation-modal");
    expect(modal).toBeDefined();
    expect(element._showBulkDeleteModal).toBe(true); // Check internal state
    // Check the ACTUAL set used by the component (_selectedIds)
    expect(element._selectedIds.size).toBe(2);
  });
});
