import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import sinon from "sinon";
import { store } from "./store.js";

// Helper to capture the initial state of the store for resetting
const captureInitialState = () => {
  let state = store.getState();
  // Need a deep clone to avoid modifying the original initial state later
  return JSON.parse(JSON.stringify(state));
};

let initialState = captureInitialState();

// Helper function to reset the store state
const resetStoreState = () => {
  const stateToRestore = JSON.parse(JSON.stringify(initialState));
  let currentState = store.getState();
  currentState.employees = stateToRestore.employees;
  // Cannot easily reset nextId or listeners without store modification
};

describe("Store", () => {
  beforeEach(() => {
    resetStoreState();
    vi.resetAllMocks();
  });

  it("should have initial mock employees", () => {
    const employees = store.getEmployees();
    expect(employees).toBeInstanceOf(Array);
    expect(employees.length).toBeGreaterThan(0);
    expect(employees[0]).toHaveProperty("id");
    expect(employees[0]).toHaveProperty("firstName");
  });

  it("should add a new employee", () => {
    const initialLength = store.getEmployees().length;
    const newEmployeeData = {
      firstName: "Test",
      lastName: "User",
      dateOfEmployment: "2024-01-01",
      dateOfBirth: "1999-12-31",
      phoneNumber: "111-222-3333",
      email: "test.user@example.com",
      department: "TestDept",
      position: "Tester",
    };
    store.addEmployee(newEmployeeData);
    const employees = store.getEmployees();
    const addedEmployee = employees.find(
      (emp) => emp.email === "test.user@example.com"
    );

    expect(employees.length).toBe(initialLength + 1);
    expect(addedEmployee).toBeDefined();
    expect(addedEmployee.firstName).toBe("Test");
    expect(addedEmployee).toHaveProperty("id");
  });

  it("should prevent adding an employee with a duplicate email", () => {
    const initialLength = store.getEmployees().length;
    const duplicateEmployee = {
      firstName: "Another",
      lastName: "John",
      email: "john.doe@example.com",
    };

    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    store.addEmployee(duplicateEmployee);

    const employees = store.getEmployees();
    expect(employees.length).toBe(initialLength);
    expect(alertSpy.mock.calls.length).toBe(1);
    expect(alertSpy).toHaveBeenCalledWith(
      expect.stringContaining("already exists")
    );

    alertSpy.mockRestore();
  });

  it("should update an existing employee", () => {
    const employeeToUpdate = store.getEmployees()[0];
    const updatedData = {
      firstName: "Johnny",
      position: "Lead Tester",
    };
    store.updateEmployee(employeeToUpdate.id, updatedData);
    const updatedEmployee = store
      .getEmployees()
      .find((emp) => emp.id === employeeToUpdate.id);

    expect(updatedEmployee.firstName).toBe("Johnny");
    expect(updatedEmployee.position).toBe("Lead Tester");
    expect(updatedEmployee.lastName).toBe(employeeToUpdate.lastName);
  });

  it("should prevent updating an employee if email duplicates another existing one", () => {
    const employeeToUpdate = store.getEmployees()[0];
    const existingEmail = store.getEmployees()[1].email;
    const originalFirstName = employeeToUpdate.firstName;
    const originalEmail = employeeToUpdate.email;

    const updatedData = {
      email: existingEmail,
    };

    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    store.updateEmployee(employeeToUpdate.id, updatedData);

    const employeeAfterAttempt = store
      .getEmployees()
      .find((emp) => emp.id === employeeToUpdate.id);

    expect(alertSpy.mock.calls.length).toBe(1);
    expect(alertSpy).toHaveBeenCalledWith(
      expect.stringContaining("already exists")
    );
    expect(employeeAfterAttempt.email).toBe(originalEmail);
    expect(employeeAfterAttempt.firstName).toBe(originalFirstName);

    alertSpy.mockRestore();
  });

  it("should delete an employee", () => {
    const initialLength = store.getEmployees().length;
    const employeeToDelete = store.getEmployees()[1];
    store.deleteEmployee(employeeToDelete.id);
    const employees = store.getEmployees();
    const deletedEmployee = employees.find(
      (emp) => emp.id === employeeToDelete.id
    );

    expect(employees.length).toBe(initialLength - 1);
    expect(deletedEmployee).toBeUndefined();
  });

  it("should notify listeners on state change", () => {
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    expect(listener).toHaveBeenCalledTimes(1);

    store.deleteEmployee(store.getEmployees()[0].id);
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();

    store.addEmployee({
      firstName: "Temp",
      lastName: "Listener",
      email: "temp.listener@example.com",
    });

    expect(listener).toHaveBeenCalledTimes(2);
  });
});
