import { LitElement, html, css } from "lit";

class NavMenu extends LitElement {
  static styles = css`
    :host {
      display: block;
    } /* Ensure it takes up layout space */
    nav {
      display: flex;
      gap: 1rem; /* Spacing between links */
    }
    a {
      text-decoration: none;
      color: var(--link-color, #333); /* Use a variable, default to dark gray */
      padding: 0.5rem;
      border-radius: 4px;
      transition: background-color 0.2s ease-in-out;
      font-weight: 500;
    }
    a:hover,
    a:focus {
      background-color: rgba(0, 0, 0, 0.05);
      color: var(--link-hover-color, #000);
      outline: none;
    }
    /* TODO: Add an 'active' class later based on router state for styling */
  `;

  render() {
    // Using standard <a> tags for Vaadin Router links
    return html`
      <nav>
        <a href="/employees">View Employees</a>
        <a href="/add-employee">Add Employee</a>
      </nav>
    `;
  }
}

customElements.define("nav-menu", NavMenu);
