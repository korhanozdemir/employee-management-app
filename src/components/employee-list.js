import { LitElement, html, css } from "lit";
import { map } from "lit/directives/map.js"; // Import the map directive
import { store } from "../state/store.js"; // Import the store
import { classMap } from "lit/directives/class-map.js"; // Import classMap
import { Router } from "@vaadin/router"; // Import Router for navigation
import "./confirmation-modal.js"; // Import the modal component

const ITEMS_PER_PAGE = 8; // Define how many items per page, like in mockup

class EmployeeList extends LitElement {
  static properties = {
    _employees: { state: true }, // Internal reactive state
    _viewMode: { state: true }, // Add state for view mode ('table' or 'list')
    _currentPage: { state: true }, // Current page number (1-based)
    _searchTerm: { state: true }, // State for the search term
    _showDeleteModal: { state: true }, // State to show/hide delete modal
    _employeeToDeleteId: { state: true }, // ID of employee pending deletion
    // Add properties for search, pagination, view mode later
  };

  constructor() {
    super();
    this._employees = [];
    this._viewMode = "table"; // Default to table view
    this._currentPage = 1; // Start at page 1
    this._searchTerm = ""; // Initialize search term
    this._showDeleteModal = false; // Modal initially hidden
    this._employeeToDeleteId = null;
    this._unsubscribe = null;
  }

  connectedCallback() {
    super.connectedCallback();
    // Subscribe to store updates
    this._unsubscribe = store.subscribe((state) => {
      this._employees = state.employees;
      // Reset to page 1 if employees change (e.g., after delete/add/search)
      // We might refine this logic later based on specific actions
      this._currentPage = 1;
    });
    // Initial fetch in case the component connects after the first state emission
    // (subscribe callback already handles this, but good practice)
    this._employees = store.getEmployees();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Unsubscribe from store updates to prevent memory leaks
    if (this._unsubscribe) {
      this._unsubscribe();
    }
  }

  static styles = css`
    :host {
      display: block;
      padding: 1rem;
    }
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    h2 {
      margin: 0;
      color: var(--primary-color, #ff6200);
    }
    .controls {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-grow: 1; /* Allow search to grow */
      justify-content: flex-end;
    }
    .search-input {
      padding: 0.5rem 0.8rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 0.95em;
      min-width: 200px; /* Give it some base width */
      flex-grow: 1; /* Allow it to take available space */
      max-width: 350px;
    }
    .view-toggle button {
      background: none;
      border: none;
      padding: 0.5rem;
      cursor: pointer;
      font-size: 1.5em; /* Make icons larger */
      color: #ccc; /* Default inactive color */
      transition: color 0.2s ease-in-out;
      line-height: 1; /* Align icons better */
    }
    .view-toggle button.active {
      color: var(--primary-color, #ff6200); /* Active color */
    }
    .view-toggle button:hover {
      color: var(--secondary-color, #ffb587);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow like mockup */
      background-color: #fff;
      border-radius: 8px; /* Rounded corners */
      overflow: hidden; /* Ensures radius applies to content */
    }
    th,
    td {
      padding: 0.8rem 1rem;
      text-align: left;
      border-bottom: 1px solid #eee; /* Light separator lines */
      vertical-align: middle;
    }
    th {
      background-color: #f8f9fa; /* Light header background */
      font-weight: 600;
      font-size: 0.9em;
      color: #555;
    }
    tr:last-child td {
      border-bottom: none;
    }
    tr:hover td {
      background-color: #f1f1f1;
    }
    .actions button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.2rem;
      margin: 0 0.3rem;
      color: var(--primary-color, #ff6200);
      font-size: 1.1em;
    }
    .actions button:hover {
      opacity: 0.7;
    }
    /* Placeholder for icons */
    .icon-edit::before {
      content: "✏️";
    }
    .icon-delete::before {
      content: "🗑️";
    }
    /* Placeholder icons for view toggle */
    .icon-table::before {
      content: "▦";
    }
    .icon-list::before {
      content: "≡";
    }
    /* TODO: Add styles for list view items when implemented */
    .list-view-placeholder {
      padding: 2rem;
      text-align: center;
      border: 1px dashed #ccc;
      margin-top: 1rem;
      color: #777;
    }
    /* TODO: Add styles for list view, search, pagination */
    /* --- Pagination Styles --- */
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 2rem;
      padding: 1rem 0;
      user-select: none; /* Prevent text selection */
    }
    .pagination button,
    .pagination .page-number {
      background-color: #fff;
      border: 1px solid #ddd;
      color: var(--primary-color, #ff6200);
      padding: 0.5rem 1rem;
      margin: 0 0.25rem;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.2s, color 0.2s, border-color 0.2s;
      font-weight: 500;
      min-width: 40px; /* Ensure buttons have some width */
      text-align: center;
    }
    .pagination button:hover:not(:disabled),
    .pagination .page-number:hover {
      background-color: var(--secondary-color, #ffb587);
      border-color: var(--secondary-color, #ffb587);
      color: #fff;
    }
    .pagination button:disabled {
      cursor: not-allowed;
      opacity: 0.5;
      color: #aaa;
      background-color: #f5f5f5;
    }
    .pagination span {
      margin: 0 1rem;
      font-weight: 500;
      color: #555;
    }
    .pagination .page-number.active {
      background-color: var(--primary-color, #ff6200);
      border-color: var(--primary-color, #ff6200);
      color: white;
      cursor: default;
    }
    .pagination .ellipsis {
      padding: 0.5rem 0.5rem;
      color: #aaa;
      cursor: default;
      border: none;
      background: none;
    }
    /* --- List View Styles --- */
    .list-view {
      display: grid;
      gap: 1rem;
      margin-top: 1rem;
      /* Adjust columns based on screen size */
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }
    .employee-card {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 1rem 1.5rem;
      display: flex;
      flex-direction: column; /* Stack content vertically */
      gap: 0.5rem; /* Space between items */
      border-left: 5px solid var(--primary-color, #ff6200); /* Accent border */
    }
    .employee-card header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .employee-card h3 {
      margin: 0;
      font-size: 1.2em;
      color: #333;
    }
    .employee-card .info {
      font-size: 0.95em;
      color: #555;
      line-height: 1.4;
    }
    .employee-card .info strong {
      color: #333;
      margin-right: 0.3em;
    }
    /* Use existing .actions styles for buttons inside card */
    .employee-card .actions {
      margin-top: 0.5rem;
      align-self: flex-end; /* Push actions to the right */
    }
  `;

  _handleSearchInput(event) {
    this._searchTerm = event.target.value;
    this._currentPage = 1; // Reset to first page on search
  }

  _setViewMode(mode) {
    this._viewMode = mode;
    this._currentPage = 1; // Reset page when changing view
  }

  _handleEdit(employeeId) {
    // Use Router.go to navigate to the edit page
    Router.go(`/edit-employee/${employeeId}`);
  }

  _handleDelete(employeeId) {
    // Set state to show the modal and store the ID
    this._employeeToDeleteId = employeeId;
    this._showDeleteModal = true;
  }

  _confirmDelete() {
    if (this._employeeToDeleteId) {
      store.deleteEmployee(this._employeeToDeleteId);
    }
    this._closeDeleteModal();
  }

  _cancelDelete() {
    this._closeDeleteModal();
  }

  _closeDeleteModal() {
    this._showDeleteModal = false;
    this._employeeToDeleteId = null;
  }

  // --- Pagination Logic ---

  get _filteredEmployees() {
    if (!this._searchTerm) {
      return this._employees;
    }
    const term = this._searchTerm.toLowerCase();
    return this._employees.filter((emp) => {
      return (
        emp.firstName.toLowerCase().includes(term) ||
        emp.lastName.toLowerCase().includes(term) ||
        emp.email.toLowerCase().includes(term) ||
        emp.department.toLowerCase().includes(term) ||
        emp.position.toLowerCase().includes(term)
      );
    });
  }

  _getTotalPages() {
    return Math.ceil(this._filteredEmployees.length / ITEMS_PER_PAGE);
  }

  _getCurrentPageEmployees() {
    const startIndex = (this._currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return this._filteredEmployees.slice(startIndex, endIndex);
  }

  _goToPage(pageNumber) {
    const totalPages = this._getTotalPages();
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      this._currentPage = pageNumber;
    }
  }

  _goToPrevPage() {
    this._goToPage(this._currentPage - 1);
  }

  _goToNextPage() {
    this._goToPage(this._currentPage + 1);
  }

  /**
   * Generates an array of page numbers/ellipses to display.
   * Logic: Show first, last, current, and 1 neighbor on each side, with ellipses.
   */
  _getPageNumbers() {
    const total = this._getTotalPages();
    const current = this._currentPage;
    const delta = 1; // How many neighbors to show around current page
    const range = [];

    if (total <= 1) return [];

    // Always show first page
    range.push(1);

    // Ellipsis after first page?
    if (current > delta + 2) {
      range.push("...");
    }

    // Pages around current page
    let start = Math.max(2, current - delta);
    let end = Math.min(total - 1, current + delta);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // Ellipsis before last page?
    if (current < total - delta - 1) {
      range.push("...");
    }

    // Always show last page (if different from first)
    if (total > 1) {
      range.push(total);
    }

    // Remove duplicates that might occur if ranges overlap (e.g., total = 5)
    return [...new Set(range)];
  }

  // --- Template Partials ---

  _renderTableView() {
    const currentPageEmployees = this._getCurrentPageEmployees();
    return html`
      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                disabled
                title="Select all - Not implemented"
              />
            </th>
            <!-- Placeholder checkbox -->
            <th>First Name</th>
            <th>Last Name</th>
            <th>Date of Employment</th>
            <th>Date of Birth</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Department</th>
            <th>Position</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${map(
            currentPageEmployees,
            (emp) => html`
              <tr>
                <td>
                  <input
                    type="checkbox"
                    disabled
                    title="Select row - Not implemented"
                  />
                </td>
                <!-- Placeholder checkbox -->
                <td>${emp.firstName}</td>
                <td>${emp.lastName}</td>
                <td>${emp.dateOfEmployment}</td>
                <!-- TODO: Format date -->
                <td>${emp.dateOfBirth}</td>
                <!-- TODO: Format date -->
                <td>${emp.phoneNumber}</td>
                <td>${emp.email}</td>
                <td>${emp.department}</td>
                <td>${emp.position}</td>
                <td class="actions">
                  <!-- Use buttons or links for actions -->
                  <button
                    @click=${() => this._handleEdit(emp.id)}
                    title="Edit"
                    class="icon-edit"
                  ></button>
                  <button
                    @click=${() => this._handleDelete(emp.id)}
                    title="Delete"
                    class="icon-delete"
                  ></button>
                </td>
              </tr>
            `
          )}
          ${currentPageEmployees.length === 0
            ? html`<tr>
                <td
                  colspan="10"
                  style="text-align: center; padding: 2rem; color: #777;"
                >
                  No employees match your search criteria.
                </td>
              </tr>`
            : ""}
        </tbody>
      </table>
    `;
  }

  _renderListView() {
    const currentPageEmployees = this._getCurrentPageEmployees();

    if (currentPageEmployees.length === 0) {
      return html`<div class="list-view-placeholder">
        No employees match your search criteria.
      </div>`;
    }

    return html`
      <div class="list-view">
        ${map(
          currentPageEmployees,
          (emp) => html`
            <div class="employee-card">
              <header>
                <h3>${emp.firstName} ${emp.lastName}</h3>
                <div class="actions">
                  <button
                    @click=${() => this._handleEdit(emp.id)}
                    title="Edit"
                    class="icon-edit"
                  ></button>
                  <button
                    @click=${() => this._handleDelete(emp.id)}
                    title="Delete"
                    class="icon-delete"
                  ></button>
                </div>
              </header>
              <div class="info">
                <div><strong>Position:</strong> ${emp.position}</div>
                <div><strong>Department:</strong> ${emp.department}</div>
                <div>
                  <strong>Email:</strong>
                  <a href="mailto:${emp.email}">${emp.email}</a>
                </div>
                <div><strong>Phone:</strong> ${emp.phoneNumber}</div>
                <!-- Optionally add more fields like DoB, Employment Date -->
              </div>
            </div>
          `
        )}
      </div>
    `;
  }

  _renderPagination() {
    const totalPages = this._getTotalPages();
    if (totalPages <= 1) return ""; // Don't show pagination if only one page

    const pageNumbers = this._getPageNumbers();

    return html`
      <div class="pagination">
        <button
          @click=${this._goToPrevPage}
          ?disabled=${this._currentPage === 1}
          title="Previous Page"
        >
          &lt;
        </button>

        ${map(pageNumbers, (page) =>
          page === "..."
            ? html`<span class="ellipsis">...</span>`
            : html`
                <button
                  class="page-number ${this._currentPage === page
                    ? "active"
                    : ""}"
                  @click=${() => this._goToPage(page)}
                  ?disabled=${this._currentPage === page}
                >
                  ${page}
                </button>
              `
        )}

        <button
          @click=${this._goToNextPage}
          ?disabled=${this._currentPage === totalPages}
          title="Next Page"
        >
          &gt;
        </button>
      </div>
    `;
  }

  render() {
    const tableViewClasses = { active: this._viewMode === "table" };
    const listViewClasses = { active: this._viewMode === "list" };

    // Find the employee name for the modal message
    const employeeToDelete = this._employeeToDeleteId
      ? this._employees.find((emp) => emp.id === this._employeeToDeleteId)
      : null;
    const deleteMessage = employeeToDelete
      ? `Selected Employee record of ${employeeToDelete.firstName} ${employeeToDelete.lastName} will be deleted`
      : "Are you sure you want to delete this record?"; // Fallback

    return html`
      <div class="list-header">
        <h2>Employee List</h2>
        <div class="controls">
          <input
            type="search"
            class="search-input"
            placeholder="Search employees..."
            .value=${this._searchTerm}
            @input=${this._handleSearchInput}
          />
          <div class="view-toggle">
            <button
              title="Table View"
              class="icon-table ${classMap(tableViewClasses)}"
              @click=${() => this._setViewMode("table")}
            ></button>
            <button
              title="List View"
              class="icon-list ${classMap(listViewClasses)}"
              @click=${() => this._setViewMode("list")}
            ></button>
          </div>
        </div>
      </div>

      ${this._viewMode === "table"
        ? this._renderTableView()
        : this._renderListView()}
      ${this._renderPagination()}

      <!-- Render modal conditionally -->
      ${this._showDeleteModal
        ? html`
            <confirmation-modal
              .message=${deleteMessage}
              @confirm=${this._confirmDelete}
              @cancel=${this._cancelDelete}
            >
            </confirmation-modal>
          `
        : ""}
    `;
  }
}

customElements.define("employee-list", EmployeeList);
