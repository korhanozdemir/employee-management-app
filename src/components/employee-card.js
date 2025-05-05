import { LitElement, html, css } from "lit";
import { t } from "../localization/localization.js"; // Import t for labels

// Helper for month names
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

class EmployeeCard extends LitElement {
  static properties = {
    employee: { type: Object },
  };

  constructor() {
    super();
    this.employee = {};
  }

  // --- Date Formatting Helper (Updated for "DD Mon YYYY") ---
  _formatDate(dateString) {
    if (!dateString || !dateString.includes("-")) return dateString || ""; // Basic check and return empty/original
    try {
      // Split the date string and create a UTC date directly
      const parts = dateString.split("-");
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const day = parseInt(parts[2], 10);

      // Validate parts
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        console.error("Invalid date parts:", dateString);
        return dateString;
      }

      // Create date object representing midnight UTC for that date
      const date = new Date(Date.UTC(year, month, day));

      // Now extract parts from the UTC date object
      // No longer need the potentially problematic local timezone date
      const displayDay = date.getUTCDate();
      const displayMonth = MONTH_NAMES[date.getUTCMonth()];
      const displayYear = date.getUTCFullYear();

      return `${displayDay} ${displayMonth} ${displayYear}`;
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return dateString; // Return original string on error
    }
  }

  _handleEditClick() {
    this.dispatchEvent(
      new CustomEvent("edit-employee", {
        detail: { employeeId: this.employee.id },
        bubbles: true,
        composed: true,
      })
    );
  }

  _handleDeleteClick() {
    this.dispatchEvent(
      new CustomEvent("delete-employee", {
        detail: { employeeId: this.employee.id },
        bubbles: true,
        composed: true,
      })
    );
  }

  static styles = css`
    :host {
      display: block;
      font-family: sans-serif;
      font-size: 14px;
      color: #333;
      --card-padding: 1.5rem;
      /* REMOVED card-specific color overrides for primary, danger, success */
      /* Rely on inherited --primary-color: #ff6200 or define globally */
      /* Example grey variables retained for card elements */
      --grey-color: #6c757d;
      --light-grey-color: #adb5bd;
      --avatar-bg: #e9ecef;
      --card-bg: #ffffff;
      --border-color: #eee;
    }

    .employee-card {
      background-color: var(--card-bg);
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      padding: var(--card-padding);
      display: flex;
      flex-direction: column;
      height: 100%;
      box-sizing: border-box;
      transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
    }
    .employee-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .avatar-placeholder {
      width: 55px;
      height: 55px;
      border-radius: 50%;
      background-color: var(--avatar-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border: 2px solid var(--card-bg);
      box-shadow: 0 0 0 1px var(--border-color);
    }
    .avatar-icon {
      width: 30px;
      height: 30px;
      opacity: 0.5;
      color: var(--grey-color);
    }

    .name-position {
      flex-grow: 1;
    }
    .name-position h3 {
      margin: 0 0 0.1rem 0;
      font-size: 1.15rem;
      font-weight: 600;
      color: #212529;
    }
    .name-position span {
      font-size: 0.9rem;
      color: var(--primary-color);
      font-weight: 500;
    }

    .card-details {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 0.8rem 1rem;
      margin-bottom: 1.5rem;
      flex-grow: 1;
      align-items: center;
    }

    .detail-key {
      color: var(--grey-color);
      font-weight: 500;
      font-size: 0.9rem;
      text-align: right;
    }

    .detail-value {
      color: #333;
      font-weight: 400;
      font-size: 0.9rem;
      word-break: break-word;
      text-align: left;
    }
    .detail-value a {
      color: inherit;
      text-decoration: none;
    }
    .detail-value a:hover {
      text-decoration: underline;
      font-weight: 500;
      font-size: 0.9rem; /* Slightly larger button text */
      transition: background-color 0.2s, box-shadow 0.2s, color 0.2s;
      line-height: 1; /* Ensure text is centered */
      border: 1px solid transparent; /* Add border for layout consistency */
    }

    hr.card-divider {
      border: none;
      border-top: 1px solid var(--border-color);
      margin: 0 0 1.5rem 0;
    }

    .card-actions {
      display: flex;
      justify-content: space-between;
      gap: 0.8rem;
    }
    .card-actions button {
      padding: 0.6rem 1.4rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.9rem;
      transition: background-color 0.2s, box-shadow 0.2s, color 0.2s,
        opacity 0.2s;
      line-height: 1;
      border: none;
      color: white;
    }

    .card-actions .btn-edit {
      background-color: var(--secondary-color);
    }
    .card-actions .btn-edit:hover {
      background-color: var(--primary-color);
    }

    .card-actions .btn-delete {
      background-color: var(--light-grey-color);
    }
    .card-actions .btn-delete:hover {
      background-color: var(--grey-color);
    }
  `;

  render() {
    if (!this.employee || !this.employee.id) {
      return html``;
    }

    return html`
      <div class="employee-card">
        <div class="card-header">
          <div class="avatar-placeholder">
            <img
              src="/icons/user-icon.png"
              alt="User Icon"
              class="avatar-icon"
            />
          </div>
          <div class="name-position">
            <h3>${this.employee.firstName} ${this.employee.lastName}</h3>
            <span>${this.employee.position}</span>
          </div>
          <!-- Mockup status -->
        </div>

        <div class="card-details">
          <span class="detail-key">Email:</span>
          <span class="detail-value"
            ><a href="mailto:${this.employee.email}"
              >${this.employee.email}</a
            ></span
          >

          <span class="detail-key">Phone:</span>
          <span class="detail-value">${this.employee.phoneNumber}</span>

          <span class="detail-key">Department:</span>
          <span class="detail-value">${this.employee.department}</span>

          <span class="detail-key">Joined:</span>
          <span class="detail-value"
            >${this._formatDate(this.employee.dateOfEmployment)}</span
          >
        </div>

        <hr class="card-divider" />

        <div class="card-actions">
          <button class="btn-edit" @click=${this._handleEditClick}>Edit</button>
          <button class="btn-delete" @click=${this._handleDeleteClick}>
            Delete
          </button>
        </div>
      </div>
    `;
  }
}

customElements.define("employee-card", EmployeeCard);
