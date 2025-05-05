import { LitElement, html, css } from "lit";
import { Router } from "@vaadin/router";
import { store } from "../state/store.js";
import "./confirmation-modal.js"; // Import the modal
import { t } from "../localization/localization.js"; // Import t

class EmployeeForm extends LitElement {
  static properties = {
    location: { type: Object },
    _employee: { state: true },
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
    _showUpdateModal: { state: true },
    _pendingUpdateData: { state: true },
    _showValidation: { state: true },
  };

  constructor() {
    super();
    this._isEditMode = false;
    this._employee = null;
    this._isLoading = false;
    this._showUpdateModal = false;
    this._pendingUpdateData = null;
    this._showValidation = false;
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
        this._resetFormFields();
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
      // Mark that validation styles should be shown now
      this._showValidation = true;
      alert(t("requiredField"));
      form.reportValidity();
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
        Router.go("/employees");
      } catch (error) {
        // Handle potential errors from the store (like duplicate email)
        // The store currently uses alert(), but a more robust system could be used.
        // Ensure validation styles are shown even if store errors occur after submit attempt
        this._showValidation = true;
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
        this._closeUpdateModal();
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
      font-size: 14px;
    }
    h2 {
      margin-top: 0;
      margin-bottom: 1.5rem;
      color: var(--primary-color);
      text-align: center;
      font-size: 1.6rem;
    }
    form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem 1.5rem;
    }
    label {
      font-weight: 500;
      margin-bottom: 0.25rem;
      display: block;
      color: #333;
      font-size: 14px;
    }
    input,
    select {
      width: 100%;
      padding: 0.6rem 0.8rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
    }
    input:focus,
    select:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px var(--secondary-color);
    }
    /* Span fields across both columns if needed */
    .form-field-full {
      grid-column: 1 / -1;
    }
    .form-actions {
      grid-column: 1 / -1;
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
      font-size: 14px;
      transition: opacity 0.2s;
    }
    button:hover {
      opacity: 0.8;
    }
    button[type="submit"] {
      background-color: var(--primary-color);
      color: white;
    }
    .cancel-btn {
      background-color: #eee;
      color: #333;
      border: 1px solid #ccc;
    }
  `;

  render() {
    const title = this._isEditMode ? t("editEmployee") : t("addNewEmployee");

    if (this._isLoading) {
      return html`<p>${t("loading")}</p>`;
    }

    const updateMessage = this._pendingUpdateData
      ? t("confirmUpdateMessage", {
          name: `${this._pendingUpdateData.firstName} ${this._pendingUpdateData.lastName}`,
        })
      : t("confirmGeneric");

    return html`
      <div ?show-validation=${this._showValidation}>
        <h2>${title}</h2>
        <form @submit=${this._handleSubmit}>
          <div class="form-field">
            <label for="firstName">${t("firstName")}</label>
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
            <label for="lastName">${t("lastName")}</label>
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
            <label for="dateOfEmployment">${t("dateOfEmployment")}</label>
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
            <label for="dateOfBirth">${t("dateOfBirth")}</label>
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
            <label for="phoneNumber">${t("phoneNumber")}</label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              pattern="^s*(?:+?(d{1,3}))?[-.s(]*(d{3})[-.s)]*(d{3})[-.s]*(d{4})(?: *x(d+))?s*$"
              title="Enter a valid phone number (e.g., +1 (555) 123-4567 Ext. 123)"
              required
              .value=${this._phoneNumber}
              @input=${this._handleInput}
            />
          </div>

          <div class="form-field form-field-full">
            <label for="email">${t("emailAddress")}</label>
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
            <label for="department">${t("department")}</label>
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
            <label for="position">${t("position")}</label>
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
            <button
              type="button"
              class="cancel-btn"
              @click=${this._handleCancel}
            >
              ${t("cancel")}
            </button>
            <button type="submit">
              ${this._isEditMode ? t("update") : t("add")}
            </button>
          </div>
        </form>
      </div>

      ${this._showUpdateModal
        ? html`
            <confirmation-modal
              .message=${updateMessage}
              confirmLabel=${t("update")}
              cancelLabel=${t("cancel")}
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
