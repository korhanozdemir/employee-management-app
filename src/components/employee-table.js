import { LitElement, html, css } from "lit";
import { map } from "lit/directives/map.js";
import { t } from "../localization/localization.js";

class EmployeeTable extends LitElement {
  static properties = {
    employees: { type: Array },
    selectedIds: { type: Object },
    isSelectAllChecked: { type: Boolean },
    isSelectAllIndeterminate: { type: Boolean },
  };

  constructor() {
    super();
    this.employees = [];
    this.selectedIds = new Set();
    this.isSelectAllChecked = false;
    this.isSelectAllIndeterminate = false;
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }
    .table-container {
      overflow-x: auto;
      width: 100%;
    }
    @media (max-width: 1200px) {
      .table-container table {
        min-width: 800px;
      }
      .table-container th:nth-child(1),
      .table-container td:nth-child(1),
      .table-container th:nth-child(2),
      .table-container td:nth-child(2),
      .table-container th:nth-child(3),
      .table-container td:nth-child(3) {
        position: sticky;
        z-index: 1;
        background-color: #fff;
      }
      .table-container th:nth-child(1),
      .table-container td:nth-child(1) {
        left: 0;
        width: 60px;
        min-width: 60px;
      }
      .table-container th:nth-child(2),
      .table-container td:nth-child(2) {
        left: 60px;
        width: 150px;
        min-width: 150px;
      }
      .table-container th:nth-child(3),
      .table-container td:nth-child(3) {
        left: 145px;
        width: 150px;
        min-width: 150px;
      }
      .table-container tr:hover td:nth-child(1),
      .table-container tr:hover td:nth-child(2),
      .table-container tr:hover td:nth-child(3) {
        background-color: #f1f1f1;
      }
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      background-color: #fff;
      border-radius: 8px;
      font-size: 14px;
    }
    th,
    td {
      padding: 1rem 0.9rem;
      text-align: left;
      border-bottom: 1px solid #eee;
      vertical-align: middle;
      font-size: inherit;
      line-height: 1.4;
      white-space: nowrap;
      box-sizing: border-box;
    }
    th:not(:first-child):not(:last-child),
    td:not(:first-child):not(:last-child) {
      min-width: 80px;
    }
    th {
      background-color: #fff;
      font-weight: normal;
      color: var(--primary-color);
    }
    tr:last-child td {
      border-bottom: none;
    }
    tr:hover td {
      background-color: #f1f1f1;
    }
    th input[type="checkbox"],
    td input[type="checkbox"] {
      cursor: pointer;
      width: 16px;
      height: 16px;
      accent-color: var(--primary-color);
      vertical-align: middle;
    }
    .actions button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.2rem;
      margin: 0 0.3rem;
      line-height: 1;
      opacity: 0.7;
    }
    .actions button img {
      height: 14px;
      width: 14px;
      vertical-align: middle;
    }
    .actions button:hover {
      opacity: 1;
    }
    .no-results-row td {
      text-align: center;
      padding: 2rem;
      color: #777;
      border-bottom: none;
    }
    .bold {
      font-weight: 500;
      color: black;
    }
  `;

  _formatDate(dateString) {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const utcDate = new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate()
      );
      return utcDate.toLocaleDateString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return dateString;
    }
  }

  _handleEdit(employeeId) {
    this.dispatchEvent(
      new CustomEvent("edit-employee", { detail: { employeeId } })
    );
  }

  _handleDelete(employeeId) {
    this.dispatchEvent(
      new CustomEvent("delete-employee", { detail: { employeeId } })
    );
  }

  _handleRowCheckboxChange(event, employeeId) {
    const isChecked = event.target.checked;
    this.dispatchEvent(
      new CustomEvent("row-selection-change", {
        detail: { employeeId, isChecked },
      })
    );
  }

  _handleSelectAllChange(event) {
    const isChecked = event.target.checked;
    this.dispatchEvent(
      new CustomEvent("select-all-change", { detail: { isChecked } })
    );
  }

  render() {
    return html`
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  title=${t("selectAllOnPage")}
                  .checked=${this.isSelectAllChecked}
                  .indeterminate=${this.isSelectAllIndeterminate}
                  @change=${this._handleSelectAllChange}
                />
              </th>
              <th>${t("firstName")}</th>
              <th>${t("lastName")}</th>
              <th>${t("dateOfEmployment")}</th>
              <th>${t("dateOfBirth")}</th>
              <th>${t("phoneNumber")}</th>
              <th>${t("emailAddress")}</th>
              <th>${t("department")}</th>
              <th>${t("position")}</th>
              <th>${t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            ${this.employees.length === 0
              ? html`<tr class="no-results-row">
                  <td colspan="10">${t("noEmployeesFound")}</td>
                </tr>`
              : map(
                  this.employees,
                  (emp) => html`
                    <tr>
                      <td>
                        <input
                          type="checkbox"
                          title="Select ${emp.firstName} ${emp.lastName}"
                          .checked=${this.selectedIds.has(emp.id)}
                          @change=${(e) =>
                            this._handleRowCheckboxChange(e, emp.id)}
                        />
                      </td>
                      <td class="bold">${emp.firstName}</td>
                      <td class="bold">${emp.lastName}</td>
                      <td>${this._formatDate(emp.dateOfEmployment)}</td>
                      <td>${this._formatDate(emp.dateOfBirth)}</td>
                      <td>${emp.phoneNumber}</td>
                      <td>${emp.email}</td>
                      <td>${emp.department}</td>
                      <td>${emp.position}</td>
                      <td class="actions">
                        <button
                          @click=${() => this._handleEdit(emp.id)}
                          title=${t("editEmployee")}
                          class="icon-edit"
                        >
                          <img src="/icons/edit-icon.png" alt="Edit" />
                        </button>
                        <button
                          @click=${() => this._handleDelete(emp.id)}
                          title=${t("deleteEmployee")}
                          class="icon-delete"
                        >
                          <img src="/icons/delete-icon.png" alt="Delete" />
                        </button>
                      </td>
                    </tr>
                  `
                )}
          </tbody>
        </table>
      </div>
    `;
  }
}

customElements.define("employee-table", EmployeeTable);
