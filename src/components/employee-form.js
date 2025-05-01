import { LitElement, html, css } from "lit";
import { Router } from "@vaadin/router";
import { store } from "../state/store.js";
import "./confirmation-modal.js"; // Import the modal

class EmployeeForm extends LitElement {
  static properties = {
    location: { type: Object }, // Provided by Vaadin Router
    _employee: { state: true }, // Holds the employee data being edited
    _isEditMode: { state: true },
    // Form field states
    _firstName: { state: true },
    _lastName: { state: true },
    _dateOfEmployment: { state: true },
    _dateOfBirth: { state: true },
    _phoneNumber: { state: true },
    _email: { state: true },
    _department: { state: true },
    _position: { state: true },
    _isLoading: { state: true },
    _showUpdateModal: { state: true }, // State for update confirmation modal
    _pendingUpdateData: { state: true }, // Data waiting for confirmation
  };

  constructor() {
    super();
    this._isEditMode = false;
    this._employee = null;
    this._isLoading = false;
    this._showUpdateModal = false; // Initialize modal state
    this._pendingUpdateData = null;
    this._resetFormFields();
  }

  _resetFormFields(employee = null) {
    this._firstName = employee?.firstName || "";
    this._lastName = employee?.lastName || "";
    this._dateOfEmployment = employee?.dateOfEmployment || "";
    this._dateOfBirth = employee?.dateOfBirth || "";
    this._phoneNumber = employee?.phoneNumber || "";
    this._email = employee?.email || "";
    this._department = employee?.department || "Tech"; // Default value
    this._position = employee?.position || "Junior"; // Default value
  }

  willUpdate(changedProperties) {
    // Detect when router location changes, specifically the ID param
    if (changedProperties.has("location")) {
      const employeeId = this.location?.params?.id;
      this._isEditMode = !!employeeId;
      if (this._isEditMode) {
        this._loadEmployeeData(employeeId);
      } else {
        this._employee = null;
        this._resetFormFields(); // Reset for Add mode
      }
    }
  }

  _loadEmployeeData(id) {
    this._isLoading = true;
    // Simulate async fetch if needed, but store is synchronous for now
    const employee = store.getEmployees().find((emp) => emp.id === id);
    if (employee) {
      this._employee = employee;
      this._resetFormFields(employee);
    } else {
      console.error(`Employee with ID ${id} not found.`);
      // Optionally navigate back or show an error message
      Router.go("/employees");
    }
    this._isLoading = false;
  }

  _handleInput(event) {
    const { name, value } = event.target;
    switch (name) {
      case "firstName":
        this._firstName = value;
        break;
      case "lastName":
        this._lastName = value;
        break;
      case "dateOfEmployment":
        this._dateOfEmployment = value;
        break;
      case "dateOfBirth":
        this._dateOfBirth = value;
        break;
      case "phoneNumber":
        this._phoneNumber = value;
        break;
      case "email":
        this._email = value;
        break;
      case "department":
        this._department = value;
        break;
      case "position":
        this._position = value;
        break;
    }
  }

  _handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    if (!form.checkValidity()) {
      // Basic HTML5 validation failed
      alert("Please fill out all required fields correctly.");
      form.reportValidity(); // Show browser validation messages
      return;
    }

    const employeeData = {
      firstName: this._firstName.trim(),
      lastName: this._lastName.trim(),
      dateOfEmployment: this._dateOfEmployment,
      dateOfBirth: this._dateOfBirth,
      phoneNumber: this._phoneNumber.trim(),
      email: this._email.trim(),
      department: this._department,
      position: this._position,
    };

    if (this._isEditMode) {
      // Store data and show custom confirmation modal for updates
      this._pendingUpdateData = employeeData;
      this._showUpdateModal = true;
    } else {
      // Add directly for new employees
      try {
        store.addEmployee(employeeData);
        Router.go("/employees"); // Navigate back after add
      } catch (error) {
        // Handle potential errors from the store (like duplicate email)
        // The store currently uses alert(), but a more robust system could be used.
        console.error("Error adding employee:", error);
      }
    }
  }

  _handleCancel() {
    Router.go("/employees");
  }

  // --- Modal Handlers ---
  _confirmUpdate() {
    if (this._employee && this._pendingUpdateData) {
      try {
        store.updateEmployee(this._employee.id, this._pendingUpdateData);
        this._closeUpdateModal();
        Router.go("/employees");
      } catch (error) {
        console.error("Error updating employee:", error);
        this._closeUpdateModal(); // Close modal even if store update failed (store alerts)
      }
    } else {
      console.error("Missing data for update confirmation.");
      this._closeUpdateModal();
    }
  }

  _cancelUpdate() {
    this._closeUpdateModal();
  }

  _closeUpdateModal() {
    this._showUpdateModal = false;
    this._pendingUpdateData = null;
  }

  static styles = css`
    :host {
      display: block;
      padding: 1rem;
      max-width: 600px;
      margin: 1rem auto;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    h2 {
      margin-top: 0;
      margin-bottom: 1.5rem;
      color: var(--primary-color, #ff6200);
      text-align: center;
    }
    form {
      display: grid;
      grid-template-columns: 1fr 1fr; /* Two columns */
      gap: 1rem 1.5rem; /* Row and column gap */
    }
    label {
      font-weight: 500;
      margin-bottom: 0.25rem;
      display: block;
      color: #333;
      font-size: 0.9em;
    }
    input,
    select {
      width: 100%;
      padding: 0.6rem 0.8rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 1em;
      box-sizing: border-box; /* Include padding in width */
    }
    input:focus,
    select:focus {
      outline: none;
      border-color: var(--primary-color, #ff6200);
      box-shadow: 0 0 0 2px var(--secondary-color, #ffb587);
    }
    /* Span fields across both columns if needed */
    .form-field-full {
      grid-column: 1 / -1;
    }
    .form-actions {
      grid-column: 1 / -1; /* Span full width */
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #eee;
    }
    button {
      padding: 0.7rem 1.5rem;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      font-weight: 500;
      font-size: 1em;
      transition: opacity 0.2s;
    }
    button:hover {
      opacity: 0.8;
    }
    button[type="submit"] {
      background-color: var(--primary-color, #ff6200);
      color: white;
    }
    .cancel-btn {
      background-color: #eee;
      color: #333;
      border: 1px solid #ccc;
    }
    /* Basic validation styling */
    input:invalid {
      border-color: #dc3545; /* Red border for invalid */
    }
  `;

  render() {
    const title = this._isEditMode ? "Edit Employee" : "Add New Employee";

    if (this._isLoading) {
      return html`<p>Loading employee data...</p>`;
    }

    const updateMessage = this._pendingUpdateData
      ? `Are you sure you want to update the record for ${this._pendingUpdateData.firstName} ${this._pendingUpdateData.lastName}?`
      : "Are you sure you want to update this record?"; // Fallback

    return html`
      <h2>${title}</h2>
      <form @submit=${this._handleSubmit}>
        <div class="form-field">
          <label for="firstName">First Name</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            .value=${this._firstName}
            @input=${this._handleInput}
          />
        </div>

        <div class="form-field">
          <label for="lastName">Last Name</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            .value=${this._lastName}
            @input=${this._handleInput}
          />
        </div>

        <div class="form-field">
          <label for="dateOfEmployment">Date of Employment</label>
          <input
            id="dateOfEmployment"
            name="dateOfEmployment"
            type="date"
            required
            .value=${this._dateOfEmployment}
            @input=${this._handleInput}
          />
        </div>

        <div class="form-field">
          <label for="dateOfBirth">Date of Birth</label>
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            required
            .value=${this._dateOfBirth}
            @input=${this._handleInput}
          />
        </div>

        <div class="form-field form-field-full">
          <label for="phoneNumber">Phone Number</label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            pattern="^s*(?:+?(d{1,3}))?[-. (]*(d{3})[-. )]*(d{3})[-. ]*(d{4})(?: *x(d+))?s*$"
            title="Enter a
          valid phone number (e.g., +1(555)123-4567)"
            required
            .value=${this._phoneNumber}
            @input=${this._handleInput}
          />
        </div>

        <div class="form-field form-field-full">
          <label for="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            .value=${this._email}
            @input=${this._handleInput}
          />
        </div>

        <div class="form-field">
          <label for="department">Department</label>
          <select
            id="department"
            name="department"
            required
            .value=${this._department}
            @input=${this._handleInput}
          >
            <option value="Analytics">Analytics</option>
            <option value="Tech">Tech</option>
          </select>
        </div>

        <div class="form-field">
          <label for="position">Position</label>
          <select
            id="position"
            name="position"
            required
            .value=${this._position}
            @input=${this._handleInput}
          >
            <option value="Junior">Junior</option>
            <option value="Medior">Medior</option>
            <option value="Senior">Senior</option>
          </select>
        </div>

        <div class="form-actions">
          <button type="button" class="cancel-btn" @click=${this._handleCancel}>
            Cancel
          </button>
          <button type="submit">
            ${this._isEditMode ? "Update" : "Add"} Employee
          </button>
        </div>
      </form>

      <!-- Render update confirmation modal conditionally -->
      ${this._showUpdateModal
        ? html`
            <confirmation-modal
              .message=${updateMessage}
              confirmLabel="Update"
              @confirm=${this._confirmUpdate}
              @cancel=${this._cancelUpdate}
            >
            </confirmation-modal>
          `
        : ""}
    `;
  }
}

customElements.define("employee-form", EmployeeForm);
