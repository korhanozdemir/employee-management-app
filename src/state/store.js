// Simple in-memory store for employee data

let state = {
  employees: [
    {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      dateOfEmployment: "2023-01-15",
      dateOfBirth: "1990-05-20",
      phoneNumber: "123-456-7890",
      email: "john.doe@example.com",
      department: "Tech",
      position: "Senior",
    },
    {
      id: "2",
      firstName: "Jane",
      lastName: "Smith",
      dateOfEmployment: "2022-08-01",
      dateOfBirth: "1992-11-30",
      phoneNumber: "987-654-3210",
      email: "jane.smith@example.com",
      department: "Analytics",
      position: "Medior",
    },
    {
      id: "3",
      firstName: "Peter",
      lastName: "Jones",
      dateOfEmployment: "2023-03-10",
      dateOfBirth: "1988-02-25",
      phoneNumber: "555-111-2222",
      email: "peter.jones@example.com",
      department: "Tech",
      position: "Junior",
    },
    {
      id: "4",
      firstName: "Maria",
      lastName: "Garcia",
      dateOfEmployment: "2021-11-20",
      dateOfBirth: "1995-07-12",
      phoneNumber: "555-333-4444",
      email: "maria.garcia@example.com",
      department: "Analytics",
      position: "Senior",
    },
    {
      id: "5",
      firstName: "Chen",
      lastName: "Li",
      dateOfEmployment: "2023-05-01",
      dateOfBirth: "1993-09-05",
      phoneNumber: "555-555-6666",
      email: "chen.li@example.com",
      department: "Tech",
      position: "Medior",
    },
    {
      id: "6",
      firstName: "Fatima",
      lastName: "Khan",
      dateOfEmployment: "2022-02-18",
      dateOfBirth: "1991-12-19",
      phoneNumber: "555-777-8888",
      email: "fatima.khan@example.com",
      department: "Analytics",
      position: "Junior",
    },
    {
      id: "7",
      firstName: "David",
      lastName: "Miller",
      dateOfEmployment: "2023-07-01",
      dateOfBirth: "1985-04-01",
      phoneNumber: "555-999-0000",
      email: "david.miller@example.com",
      department: "Tech",
      position: "Senior",
    },
    {
      id: "8",
      firstName: "Sophia",
      lastName: "Davis",
      dateOfEmployment: "2022-10-05",
      dateOfBirth: "1994-06-22",
      phoneNumber: "555-222-1111",
      email: "sophia.davis@example.com",
      department: "Analytics",
      position: "Medior",
    },
    {
      id: "9",
      firstName: "Michael",
      lastName: "Brown",
      dateOfEmployment: "2023-09-15",
      dateOfBirth: "1989-03-14",
      phoneNumber: "555-444-3333",
      email: "michael.brown@example.com",
      department: "Tech",
      position: "Junior",
    },
    {
      id: "10",
      firstName: "Olivia",
      lastName: "Wilson",
      dateOfEmployment: "2021-06-01",
      dateOfBirth: "1996-10-08",
      phoneNumber: "555-666-5555",
      email: "olivia.wilson@example.com",
      department: "Analytics",
      position: "Senior",
    },
  ],
};

let nextId = 11;
const listeners = new Set();

// --- Private helper functions ---

function _updateState(newState) {
  state = { ...state, ...newState };
  _notifyListeners();
}

function _notifyListeners() {
  listeners.forEach((listener) => listener(state));
}

// --- Public API ---

export const store = {
  /**
   * Subscribes a listener function to state changes.
   * @param {Function} listener - The callback function to execute on state change.
   * @returns {Function} - An unsubscribe function.
   */
  subscribe(listener) {
    listeners.add(listener);
    listener(state); // Immediately notify with current state
    return () => {
      listeners.delete(listener);
    };
  },

  /**
   * Gets the current state.
   * @returns {object} The current state.
   */
  getState() {
    return state;
  },

  /**
   * Gets the current list of employees.
   * @returns {Array} The list of employees.
   */
  getEmployees() {
    return state.employees;
  },

  /**
   * Adds a new employee.
   * @param {object} employeeData - Data for the new employee (excluding id).
   */
  addEmployee(employeeData) {
    if (!employeeData || !employeeData.email) {
      console.error("Store: Cannot add employee without data or email.");
      return; // Basic validation
    }
    if (state.employees.some((emp) => emp.email === employeeData.email)) {
      console.warn(
        `Store: Employee with email ${employeeData.email} already exists.`
      );
      alert(`Error: Employee with email ${employeeData.email} already exists.`); // Simple feedback
      return;
    }

    const newEmployee = {
      ...employeeData,
      id: String(nextId++),
    };
    _updateState({ employees: [...state.employees, newEmployee] });
  },

  /**
   * Updates an existing employee.
   * @param {string} id - The ID of the employee to update.
   * @param {object} updatedData - The data to update.
   */
  updateEmployee(id, updatedData) {
    if (
      updatedData.email &&
      state.employees.some(
        (emp) => emp.id !== id && emp.email === updatedData.email
      )
    ) {
      console.warn(
        `Store: Another employee with email ${updatedData.email} already exists.`
      );
      alert(
        `Error: Another employee with email ${updatedData.email} already exists.`
      ); // Simple feedback
      return;
    }

    const updatedEmployees = state.employees.map((emp) =>
      emp.id === id ? { ...emp, ...updatedData, id } : emp
    );
    _updateState({ employees: updatedEmployees });
  },

  /**
   * Deletes an employee by ID.
   * @param {string} id - The ID of the employee to delete.
   */
  deleteEmployee(id) {
    const updatedEmployees = state.employees.filter((emp) => emp.id !== id);
    _updateState({ employees: updatedEmployees });
  },
};
