// File: employee-management-app/src/components/employee-form.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fixture, html, nextFrame, oneEvent } from "@open-wc/testing"; // Keep OWC helpers for now

// REMOVE MOCK FUNCTION DEFINITIONS FROM HERE

// NOW DEFINE MOCKS USING THE FUNCTIONS INTERNALLY
vi.mock("../state/store.js", () => {
  // Define mock functions INSIDE the factory
  const mockAddEmployee = vi.fn();
  const mockUpdateEmployee = vi.fn();
  const mockGetEmployees = vi.fn();

  return {
    store: {
      addEmployee: mockAddEmployee,
      updateEmployee: mockUpdateEmployee,
      getEmployees: mockGetEmployees,
      subscribe: vi.fn(() => () => {}),
      getState: vi.fn(() => ({ employees: [] })),
    },
    // Expose mocks for use in tests if needed, carefully
    // We might need these later to reset/assert calls
    _mockAddEmployee: mockAddEmployee,
    _mockUpdateEmployee: mockUpdateEmployee,
    _mockGetEmployees: mockGetEmployees,
  };
});

// Mock Router INTERNALLY
vi.mock("@vaadin/router", () => {
  const internalMockGo = vi.fn(); // Create mock function inside the factory
  return {
    Router: class {
      static go = internalMockGo; // Assign internal mock
    },
    // We cannot easily export internalMockGo for direct checking in tests
    // Tests will need to spy on Router.go after import if needed.
  };
});

// Import the component definition AFTER mocks are set up
import "./employee-form.js";
import { Router } from "@vaadin/router"; // Import the Router class AFTER it has been mocked
// Import the MOCKED store module to access the exported mocks
import {
  _mockAddEmployee,
  _mockUpdateEmployee,
  _mockGetEmployees,
} from "../state/store.js";
import { t } from "../localization/localization.js"; // For labels

// Sample employee data for editing
const editEmployeeData = {
  id: "edit-id-123",
  firstName: "Existing",
  lastName: "User",
  dateOfEmployment: "2022-05-10",
  dateOfBirth: "1985-11-22",
  phoneNumber: "999-888-7777",
  email: "existing.user@example.com",
  department: "Analytics",
  position: "Senior",
};

describe("EmployeeForm", () => {
  let element;
  let routerGoSpy; // To hold the spy for Router.go
  // We'll use the imported mocks directly now, no need for separate variables
  // let mockAddEmployee, mockUpdateEmployee, mockGetEmployees; // REMOVE THESE

  // Helper to get form elements
  const getFormElements = (el) => ({
    form: el.shadowRoot.querySelector("form"),
    firstNameInput: el.shadowRoot.querySelector("#firstName"),
    lastNameInput: el.shadowRoot.querySelector("#lastName"),
    dateOfEmploymentInput: el.shadowRoot.querySelector("#dateOfEmployment"),
    dateOfBirthInput: el.shadowRoot.querySelector("#dateOfBirth"),
    phoneNumberInput: el.shadowRoot.querySelector("#phoneNumber"),
    emailInput: el.shadowRoot.querySelector("#email"),
    departmentSelect: el.shadowRoot.querySelector("#department"),
    positionSelect: el.shadowRoot.querySelector("#position"),
    submitButton: el.shadowRoot.querySelector('button[type="submit"]'),
    cancelButton: el.shadowRoot.querySelector(".cancel-btn"),
    title: el.shadowRoot.querySelector("h2"),
    modal: el.shadowRoot.querySelector("confirmation-modal"), // For edit mode
  });

  // Reset mocks and clean up DOM before/after each test
  beforeEach(() => {
    // Reset the mocks imported from the mocked module
    vi.resetAllMocks(); // This should reset mocks created by vi.fn() inside the factory too
    // Re-spy on Router.go after reset
    routerGoSpy = vi.spyOn(Router, "go");
    // Use the imported mock function for setup
    _mockGetEmployees.mockReturnValue([editEmployeeData]);
  });

  afterEach(() => {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
    element = null;
    // Restore spies created with vi.spyOn
    vi.restoreAllMocks();
  });

  // --- Add Mode Tests ---

  it('should render correctly in "Add" mode', async () => {
    element = await fixture(html`<employee-form></employee-form>`);
    await element.updateComplete;
    const { title, submitButton, firstNameInput, lastNameInput } =
      getFormElements(element);

    expect(title.textContent).toBe(t("addNewEmployee"));
    expect(submitButton.textContent.trim()).toBe(t("add"));
    expect(firstNameInput.value).toBe("");
    expect(lastNameInput.value).toBe("");
    // Check default values for selects
    expect(element.shadowRoot.querySelector("#department").value).toBe("Tech");
    expect(element.shadowRoot.querySelector("#position").value).toBe("Junior");
  });

  it("should update internal state on input change", async () => {
    element = await fixture(html`<employee-form></employee-form>`);
    await element.updateComplete;
    const { firstNameInput } = getFormElements(element);
    const testValue = "Ada";

    firstNameInput.value = testValue;
    firstNameInput.dispatchEvent(new Event("input")); // Simulate input event
    await element.updateComplete;

    // Access internal state (usually discouraged, but necessary here)
    expect(element._firstName).toBe(testValue);
  });

  it('should call store.addEmployee and navigate on valid submit in "Add" mode', async () => {
    element = await fixture(html`<employee-form></employee-form>`);
    await element.updateComplete;
    const {
      form,
      submitButton,
      firstNameInput,
      lastNameInput,
      dateOfEmploymentInput,
      dateOfBirthInput,
      phoneNumberInput,
      emailInput,
      departmentSelect,
      positionSelect,
    } = getFormElements(element);

    // Fill form with valid data
    firstNameInput.value = "New";
    lastNameInput.value = "Employee";
    dateOfEmploymentInput.value = "2024-01-01";
    dateOfBirthInput.value = "1995-01-01";
    phoneNumberInput.value = "123-456-7890"; // Matches pattern (simple version)
    emailInput.value = "new.employee@example.com";
    departmentSelect.value = "Tech";
    positionSelect.value = "Junior";

    // Dispatch input events (important for component state updates)
    firstNameInput.dispatchEvent(new Event("input"));
    lastNameInput.dispatchEvent(new Event("input"));
    dateOfEmploymentInput.dispatchEvent(new Event("input"));
    dateOfBirthInput.dispatchEvent(new Event("input"));
    phoneNumberInput.dispatchEvent(new Event("input"));
    emailInput.dispatchEvent(new Event("input"));
    departmentSelect.dispatchEvent(new Event("input"));
    positionSelect.dispatchEvent(new Event("input"));
    await element.updateComplete;

    // Mock checkValidity to return true for this test
    const formSpy = vi.spyOn(form, "checkValidity").mockReturnValue(true);

    submitButton.click();
    await element.updateComplete; // Wait for potential async operations

    expect(formSpy).toHaveBeenCalled();
    // Use the imported mock for assertions
    expect(_mockAddEmployee).toHaveBeenCalledTimes(1);
    expect(_mockAddEmployee).toHaveBeenCalledWith({
      firstName: "New",
      lastName: "Employee",
      dateOfEmployment: "2024-01-01",
      dateOfBirth: "1995-01-01",
      phoneNumber: "123-456-7890",
      email: "new.employee@example.com",
      department: "Tech",
      position: "Junior",
    });
    expect(routerGoSpy).toHaveBeenCalledWith("/employees");

    formSpy.mockRestore();
  });

  it('should show validation and not submit if form is invalid in "Add" mode', async () => {
    // Temporarily mock alert for this test
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    element = await fixture(html`<employee-form></employee-form>`);
    await element.updateComplete;
    const { form, firstNameInput } = getFormElements(element);

    // Leave required field (firstName) empty
    firstNameInput.value = "";
    firstNameInput.dispatchEvent(new Event("input"));
    await element.updateComplete;

    // Spy on form's reportValidity
    // Let the actual checkValidity run; it should be false due to empty firstName
    const formReportSpy = vi
      .spyOn(form, "reportValidity")
      .mockImplementation(() => {}); // Prevent actual browser popup

    // Create a mock event object
    const mockEvent = {
      preventDefault: vi.fn(),
      target: form, // Pass the actual form element
    };

    // Call the handler directly with the mock event
    element._handleSubmit(mockEvent);
    await element.updateComplete;

    // Assert that preventDefault was called, and the invalid path was taken
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith(
      expect.stringContaining(t("requiredField"))
    ); // Check alert
    expect(formReportSpy).toHaveBeenCalled(); // Check reportValidity was called
    expect(element._showValidation).toBe(true); // Check internal state flag
    // Use the imported mock for assertions
    expect(_mockAddEmployee).not.toHaveBeenCalled();
    expect(routerGoSpy).not.toHaveBeenCalled();

    formReportSpy.mockRestore();
    alertSpy.mockRestore();
  });

  // --- Edit Mode Tests ---

  it('should render correctly in "Edit" mode and pre-fill data', async () => {
    // Simulate router location for edit mode
    const location = { params: { id: editEmployeeData.id } };
    element = await fixture(
      html`<employee-form .location=${location}></employee-form>`
    );
    // Wait for Lit's update cycle AND potentially the async loading logic
    await element.updateComplete;
    await nextFrame(); // Add extra wait for async loading/setting
    await element.updateComplete;

    const {
      title,
      submitButton,
      firstNameInput,
      lastNameInput,
      emailInput,
      departmentSelect,
      positionSelect,
    } = getFormElements(element);

    // Use the imported mock for assertions
    expect(_mockGetEmployees).toHaveBeenCalledTimes(1); // Ensure data fetch was attempted
    expect(title.textContent).toBe(t("editEmployee"));
    expect(submitButton.textContent.trim()).toBe(t("update"));
    expect(firstNameInput.value).toBe(editEmployeeData.firstName);
    expect(lastNameInput.value).toBe(editEmployeeData.lastName);
    expect(emailInput.value).toBe(editEmployeeData.email);
    expect(departmentSelect.value).toBe(editEmployeeData.department);
    expect(positionSelect.value).toBe(editEmployeeData.position);
    // Check other fields...
    expect(element.shadowRoot.querySelector("#dateOfEmployment").value).toBe(
      editEmployeeData.dateOfEmployment
    );
    expect(element.shadowRoot.querySelector("#dateOfBirth").value).toBe(
      editEmployeeData.dateOfBirth
    );
    expect(element.shadowRoot.querySelector("#phoneNumber").value).toBe(
      editEmployeeData.phoneNumber
    );
  });

  it('should show confirmation modal on valid submit in "Edit" mode', async () => {
    const location = { params: { id: editEmployeeData.id } };
    element = await fixture(
      html`<employee-form .location=${location}></employee-form>`
    );
    await element.updateComplete;
    await nextFrame();
    await element.updateComplete;

    const { form, submitButton } = getFormElements(element);

    // Assume form is valid (or fill it and mock validity)
    const formSpy = vi.spyOn(form, "checkValidity").mockReturnValue(true);

    submitButton.click();
    await element.updateComplete;

    const modal = getFormElements(element).modal;
    expect(modal).toBeDefined(); // Modal should now exist in the DOM
    expect(element._showUpdateModal).toBe(true); // Check internal state
    // Use the imported mock for assertions
    expect(_mockUpdateEmployee).not.toHaveBeenCalled(); // Not called yet
    expect(routerGoSpy).not.toHaveBeenCalled();

    formSpy.mockRestore();
  });

  it("should call store.updateEmployee and navigate on modal confirmation", async () => {
    const location = { params: { id: editEmployeeData.id } };
    element = await fixture(
      html`<employee-form .location=${location}></employee-form>`
    );
    // Need multiple waits for initial load and potential state updates
    await element.updateComplete;
    await nextFrame();
    await element.updateComplete;

    const { form, submitButton } = getFormElements(element);

    // Make a minor change to test update data
    element.shadowRoot.querySelector("#firstName").value = "Updated Name";
    element.shadowRoot
      .querySelector("#firstName")
      .dispatchEvent(new Event("input"));
    await element.updateComplete;

    // Mock form validity
    const formSpy = vi.spyOn(form, "checkValidity").mockReturnValue(true);

    // Trigger submit to show modal
    submitButton.click();
    await element.updateComplete;

    // Find the modal and simulate confirm click
    const modalElement = getFormElements(element).modal;
    expect(modalElement).toBeDefined();
    const confirmButton = modalElement.shadowRoot.querySelector(".confirm-btn");
    expect(confirmButton).toBeDefined();

    confirmButton.click();
    await element.updateComplete; // Wait for updates after modal confirmation

    // Use the imported mock for assertions
    expect(_mockUpdateEmployee).toHaveBeenCalledTimes(1);
    // Check updated data payload (only changed field + others)
    expect(_mockUpdateEmployee).toHaveBeenCalledWith(
      editEmployeeData.id,
      expect.objectContaining({
        firstName: "Updated Name", // Changed value
        lastName: editEmployeeData.lastName, // Original value
        // ... check other fields if necessary
      })
    );
    expect(routerGoSpy).toHaveBeenCalledWith("/employees");

    formSpy.mockRestore();
  });

  it("should close modal and not update/navigate on modal cancellation", async () => {
    const location = { params: { id: editEmployeeData.id } };
    element = await fixture(
      html`<employee-form .location=${location}></employee-form>`
    );
    await element.updateComplete;
    await nextFrame();
    await element.updateComplete;

    const { form, submitButton } = getFormElements(element);

    // Mock form validity
    const formSpy = vi.spyOn(form, "checkValidity").mockReturnValue(true);

    // Trigger submit to show modal
    submitButton.click();
    await element.updateComplete;

    // Find the modal and simulate cancel click
    const modalElement = getFormElements(element).modal;
    expect(modalElement).toBeDefined();
    const cancelButton = modalElement.shadowRoot.querySelector(".cancel-btn");
    expect(cancelButton).toBeDefined();

    cancelButton.click();
    await element.updateComplete;

    // Check modal is hidden and no actions taken
    expect(getFormElements(element).modal).toBeNull(); // Modal should be removed
    expect(element._showUpdateModal).toBe(false);
    // Use the imported mock for assertions
    expect(_mockUpdateEmployee).not.toHaveBeenCalled();
    expect(routerGoSpy).not.toHaveBeenCalled();

    formSpy.mockRestore();
  });

  // --- General Tests ---

  it("should navigate to employee list on cancel button click", async () => {
    element = await fixture(html`<employee-form></employee-form>`); // Add mode is fine
    await element.updateComplete;
    const { cancelButton } = getFormElements(element);

    cancelButton.click();
    await element.updateComplete;

    expect(routerGoSpy).toHaveBeenCalledWith("/employees");
  });
});
