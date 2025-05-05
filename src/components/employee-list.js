import { LitElement, html, css } from "lit";
import { map } from "lit/directives/map.js"; // Import the map directive
import { store } from "../state/store.js"; // Import the store
import { classMap } from "lit/directives/class-map.js"; // Import classMap
import { Router } from "@vaadin/router"; // Import Router for navigation
import "./confirmation-modal.js"; // Import the modal component
import { t } from "../localization/localization.js"; // Import t
import "./employee-card.js"; // Import the new card component
import "./pagination-controls.js"; // Import the new pagination component
import "./employee-table.js"; // Import the new table component

const ITEMS_PER_PAGE = 8; // Define how many items per page, like in mockup

class EmployeeList extends LitElement {
  static properties = {
    _employees: { state: true },
    _viewMode: { state: true },
    _currentPage: { state: true },
    _searchTerm: { state: true },
    _showDeleteModal: { state: true },
    _employeeToDeleteId: { state: true },
    _selectedIds: { state: true },
    _showBulkDeleteModal: { state: true },
  };

  constructor() {
    super();
    this._employees = [];
    this._viewMode = "table";
    this._currentPage = 1;
    this._searchTerm = "";
    this._showDeleteModal = false;
    this._employeeToDeleteId = null;
    this._selectedIds = new Set();
    this._showBulkDeleteModal = false;
    this._unsubscribe = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._unsubscribe = store.subscribe((state) => {
      const oldEmployeeCount = this._employees.length;
      this._employees = state.employees;
      if (this._employees.length !== oldEmployeeCount) {
        this._selectedIds = new Set();
        const totalPages = this._getTotalPages();
        if (this._currentPage > totalPages && totalPages > 0) {
          this._currentPage = totalPages;
        } else if (totalPages === 0) {
          this._currentPage = 1;
        }
      }
    });
    this._employees = store.getEmployees();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._unsubscribe) {
      this._unsubscribe();
    }
  }

  static styles = css`
    :host {
      display: block;
      padding: 0 3rem;
      font-size: 14px;
    }
    @media (max-width: 600px) {
      :host {
        padding: 0 1rem;
      }
    }
    h2 {
      margin: 0;
      color: var(--primary-color);
      font-size: 24px;
      margin-bottom: 1.5rem;
      font-weight: 500;
    }
    .controls {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .search-input {
      padding: 0.5rem 0.8rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 11px;
      min-width: 150px;
      flex-basis: 200px;
      margin-left: auto;
    }
    .view-toggle button {
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      color: #ccc;
      transition: color 0.2s ease-in-out;
      line-height: 1;
      opacity: 0.6;
    }
    .view-toggle button img {
      height: 20px;
      width: 18px;
      vertical-align: middle;
    }
    .view-toggle .icon-list img {
      height: 24px;
      width: 24px;
    }
    .view-toggle button.active {
      color: var(--primary-color);
      opacity: 1;
    }
    .view-toggle button:hover {
      color: var(--secondary-color);
      opacity: 1;
    }
    .delete-selected-btn {
      padding: 0.4rem 0.6rem;
      border: 1px solid var(--secondary-color);
      background-color: transparent;
      color: var(--secondary-color);
      border-radius: 4px;
      cursor: pointer;
      font-size: 11px;
      font-weight: 500;
      transition: background-color 0.2s, color 0.2s, opacity 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }
    .delete-selected-btn img {
      height: 14px;
      width: 14px;
    }
    .delete-selected-btn:hover:not(:disabled) {
      background-color: var(--secondary-color-light-hover);
    }
    .delete-selected-btn:disabled {
      cursor: not-allowed;
      opacity: 0.4;
      border-color: #ddd;
      color: #aaa;
    }
    .list-view-placeholder {
      padding: 2rem;
      text-align: center;
      border: 1px dashed #ccc;
      margin-top: 1rem;
      color: #777;
    }
    .list-view-grid {
      display: grid;
      gap: 1.5rem;
      margin-top: 1rem;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    }
    .no-results {
      padding: 2rem;
      text-align: center;
      margin-top: 1rem;
      color: #777;
    }
  `;

  _handleSearchInput(event) {
    this._searchTerm = event.target.value;
    this._currentPage = 1;
    this._selectedIds = new Set();
  }

  _setViewMode(mode) {
    this._viewMode = mode;
    this._currentPage = 1;
    this._selectedIds = new Set();
  }

  _handleEdit(employeeId) {
    Router.go(`/edit-employee/${employeeId}`);
  }

  _handleDelete(employeeId) {
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

  _handleBulkDeleteClick() {
    if (this._selectedIds.size > 0) {
      this._showBulkDeleteModal = true;
    }
  }
  _confirmBulkDelete() {
    this._selectedIds.forEach((id) => {
      store.deleteEmployee(id);
    });
    this._closeBulkDeleteModal();
  }
  _cancelBulkDelete() {
    this._closeBulkDeleteModal();
  }
  _closeBulkDeleteModal() {
    this._showBulkDeleteModal = false;
  }

  _handleRowSelectionChange(event) {
    const { employeeId, isChecked } = event.detail;
    const updatedSelectedIds = new Set(this._selectedIds);
    if (isChecked) {
      updatedSelectedIds.add(employeeId);
    } else {
      updatedSelectedIds.delete(employeeId);
    }
    this._selectedIds = updatedSelectedIds;
  }

  _handleSelectAllChange(event) {
    const { isChecked } = event.detail;
    const currentPageIds = this._getCurrentPageEmployees().map((emp) => emp.id);
    const updatedSelectedIds = new Set(this._selectedIds);

    if (isChecked) {
      currentPageIds.forEach((id) => updatedSelectedIds.add(id));
    } else {
      currentPageIds.forEach((id) => updatedSelectedIds.delete(id));
    }
    this._selectedIds = updatedSelectedIds;
  }

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
    const count = this._filteredEmployees.length;
    return count === 0 ? 1 : Math.ceil(count / ITEMS_PER_PAGE);
  }

  _getCurrentPageEmployees() {
    const startIndex = (this._currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return this._filteredEmployees.slice(startIndex, endIndex);
  }

  _handlePageChange(event) {
    this._goToPage(event.detail.page);
  }

  _goToPage(pageNumber) {
    const totalPages = this._getTotalPages();
    if (
      pageNumber >= 1 &&
      pageNumber <= totalPages &&
      pageNumber !== this._currentPage
    ) {
      this._currentPage = pageNumber;
      this._selectedIds = new Set();
    }
  }

  _getHeaderCheckboxState() {
    const currentPageEmployees = this._getCurrentPageEmployees();
    if (currentPageEmployees.length === 0) {
      return { checked: false, indeterminate: false };
    }
    const currentPageIds = currentPageEmployees.map((emp) => emp.id);
    const selectedOnPageCount = currentPageIds.filter((id) =>
      this._selectedIds.has(id)
    ).length;

    return {
      checked: selectedOnPageCount === currentPageIds.length,
      indeterminate:
        selectedOnPageCount > 0 && selectedOnPageCount < currentPageIds.length,
    };
  }

  _renderListView() {
    const employeesToRender = this._getCurrentPageEmployees();

    if (employeesToRender.length === 0) {
      return html`<div class="no-results">${t("noEmployeesFound")}</div>`;
    }

    return html`
      <div class="list-view-grid">
        ${map(
          employeesToRender,
          (employee) => html`
            <employee-card
              .employee=${employee}
              @edit-employee=${(e) => this._handleEdit(e.detail.employeeId)}
              @delete-employee=${(e) => this._handleDelete(e.detail.employeeId)}
            ></employee-card>
          `
        )}
      </div>
    `;
  }

  render() {
    const tableViewClasses = { active: this._viewMode === "table" };
    const listViewClasses = { active: this._viewMode === "list" };
    const isAnythingSelected = this._selectedIds.size > 0;

    const employeeToDelete = this._employeeToDeleteId
      ? this._employees.find((emp) => emp.id === this._employeeToDeleteId)
      : null;
    const deleteMessage = employeeToDelete
      ? t("confirmDeleteMessage", {
          name: `${employeeToDelete.firstName} ${employeeToDelete.lastName}`,
        })
      : t("confirmGeneric");

    const bulkDeleteMessage = t("confirmBulkDeleteMessage", {
      count: this._selectedIds.size,
    });

    const headerCheckboxState = this._getHeaderCheckboxState();

    return html`
      <div class="list-header">
        <h2>${t("employeeList")}</h2>
        <div class="controls">
          <button
            class="delete-selected-btn"
            ?disabled=${!isAnythingSelected}
            @click=${this._handleBulkDeleteClick}
            title="${t("deleteSelectedTooltip", {
              count: this._selectedIds.size,
            })}"
          >
            <img src="/icons/delete-icon.png" alt="Delete" />
            (${this._selectedIds.size})
          </button>
          <input
            type="search"
            class="search-input"
            placeholder=${t("searchPlaceholder")}
            .value=${this._searchTerm}
            @input=${this._handleSearchInput}
          />
          <div class="view-toggle">
            <button
              title=${t("tableView")}
              class="icon-table ${classMap(tableViewClasses)}"
              @click=${() => this._setViewMode("table")}
            >
              <img src="/icons/table-icon.png" alt="Table View" />
            </button>
            <button
              title=${t("listView")}
              class="icon-list ${classMap(listViewClasses)}"
              @click=${() => this._setViewMode("list")}
            >
              <img src="/icons/list-icon.png" alt="List View" />
            </button>
          </div>
        </div>
      </div>

      ${this._viewMode === "table"
        ? html`
            <employee-table
              .employees=${this._getCurrentPageEmployees()}
              .selectedIds=${this._selectedIds}
              .isSelectAllChecked=${headerCheckboxState.checked}
              .isSelectAllIndeterminate=${headerCheckboxState.indeterminate}
              @edit-employee=${(e) => this._handleEdit(e.detail.employeeId)}
              @delete-employee=${(e) => this._handleDelete(e.detail.employeeId)}
              @row-selection-change=${this._handleRowSelectionChange}
              @select-all-change=${this._handleSelectAllChange}
            ></employee-table>
          `
        : this._renderListView()}

      <pagination-controls
        .currentPage=${this._currentPage}
        .totalPages=${this._getTotalPages()}
        @page-change=${this._handlePageChange}
      ></pagination-controls>

      ${this._showDeleteModal
        ? html`
            <confirmation-modal
              .message=${deleteMessage}
              confirmLabel=${t("proceed")}
              cancelLabel=${t("cancel")}
              @confirm=${this._confirmDelete}
              @cancel=${this._cancelDelete}
            >
            </confirmation-modal>
          `
        : ""}
      ${this._showBulkDeleteModal
        ? html`
            <confirmation-modal
              .message=${bulkDeleteMessage}
              confirmLabel="${t("deleteSelectedButtonLabel", {
                count: this._selectedIds.size,
              })}"
              cancelLabel=${t("cancel")}
              @confirm=${this._confirmBulkDelete}
              @cancel=${this._cancelBulkDelete}
            >
            </confirmation-modal>
          `
        : ""}
    `;
  }
}

customElements.define("employee-list", EmployeeList);
