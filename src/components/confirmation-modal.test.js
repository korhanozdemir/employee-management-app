// File: employee-management-app/src/components/confirmation-modal.test.js
import { describe, it, expect, vi } from "vitest";
import { fixture, html, nextFrame } from "@open-wc/testing";

// Import the component definition
import "./confirmation-modal.js";
// Import t for default labels
import { t } from "../localization/localization.js";

describe("ConfirmationModal", () => {
  // Helper to get elements
  const getElements = (el) => ({
    overlay: el.shadowRoot.querySelector(".overlay"),
    modal: el.shadowRoot.querySelector(".modal"),
    title: el.shadowRoot.querySelector(".modal-title"),
    message: el.shadowRoot.querySelector(".modal p"),
    confirmButton: el.shadowRoot.querySelector(".confirm-btn"),
    cancelButton: el.shadowRoot.querySelector(".cancel-btn"),
    closeButton: el.shadowRoot.querySelector(".close-button"),
  });

  it("should render with default message and labels if none provided", async () => {
    const el = await fixture(html`<confirmation-modal></confirmation-modal>`);
    const {
      overlay,
      title,
      message,
      confirmButton,
      cancelButton,
      closeButton,
    } = getElements(el);

    // Assuming 'en' locale for defaults from t()
    const defaultTitle = t("confirmTitle") || t("confirmGeneric");
    const defaultMessage = t("confirmGeneric");
    const defaultConfirmLabel = t("proceed");
    const defaultCancelLabel = t("cancel");
    const defaultCloseTitle = t("close") || "Close";

    expect(overlay).toBeDefined();
    expect(title.textContent.trim()).toBe(defaultTitle);
    expect(message.textContent.trim()).toBe(defaultMessage);
    expect(confirmButton.textContent.trim()).toBe(defaultConfirmLabel);
    expect(cancelButton.textContent.trim()).toBe(defaultCancelLabel);
    expect(closeButton).toBeDefined();
    expect(closeButton.title).toBe(defaultCloseTitle);
  });

  it("should render with provided message and labels", async () => {
    const customMessage = "Are you absolutely sure?";
    const customConfirm = "Yes, Proceed!";
    const customCancel = "No, Go Back";
    const el = await fixture(html`
      <confirmation-modal
        .message=${customMessage}
        .confirmLabel=${customConfirm}
        .cancelLabel=${customCancel}
      ></confirmation-modal>
    `);
    const { message, confirmButton, cancelButton } = getElements(el);

    expect(message.textContent.trim()).toBe(customMessage);
    expect(confirmButton.textContent.trim()).toBe(customConfirm);
    expect(cancelButton.textContent.trim()).toBe(customCancel);
  });

  it('should dispatch "confirm" event when confirm button is clicked', async () => {
    const el = await fixture(html`<confirmation-modal></confirmation-modal>`);
    const { confirmButton } = getElements(el);
    const listener = vi.fn();
    el.addEventListener("confirm", listener);

    confirmButton.click();
    await nextFrame(); // Allow event propagation

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should dispatch "cancel" event when cancel button is clicked', async () => {
    const el = await fixture(html`<confirmation-modal></confirmation-modal>`);
    const { cancelButton } = getElements(el);
    const listener = vi.fn();
    el.addEventListener("cancel", listener);

    cancelButton.click();
    await nextFrame();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should dispatch "cancel" event when overlay is clicked', async () => {
    const el = await fixture(html`<confirmation-modal></confirmation-modal>`);
    const { overlay } = getElements(el);
    const listener = vi.fn();
    el.addEventListener("cancel", listener);

    overlay.click(); // Click directly on the overlay
    await nextFrame();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should dispatch "cancel" event when close button is clicked', async () => {
    const el = await fixture(html`<confirmation-modal></confirmation-modal>`);
    const { closeButton } = getElements(el);
    const listener = vi.fn();
    el.addEventListener("cancel", listener);

    closeButton.click();
    await nextFrame();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should not dispatch "cancel" event when clicking inside the modal content', async () => {
    const el = await fixture(html`<confirmation-modal></confirmation-modal>`);
    const { modal } = getElements(el); // Get the modal div itself
    const listener = vi.fn();
    el.addEventListener("cancel", listener);

    // Simulate a click within the modal's bounds, not on buttons/overlay
    modal.click();
    await nextFrame();

    expect(listener).not.toHaveBeenCalled();
  });
});
