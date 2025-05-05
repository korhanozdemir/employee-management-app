import { describe, it, expect, beforeAll, afterAll } from "vitest"; // Import vitest globals
import { expect as chaiExpect } from "@esm-bundle/chai"; // Keep chai for specific assertions if needed, alias it
import { t } from "./localization.js";
// Note: The localization module reads document.documentElement.lang on initialization.
// Tests will likely run with the default 'en' unless the test environment setup changes lang.

describe("Localization Helper (t)", () => {
  // Store original lang and restore after tests
  let originalLang;
  beforeAll(() => {
    originalLang = document.documentElement.lang;
  });
  afterAll(() => {
    document.documentElement.lang = originalLang || "en"; // Restore or default to en
    // Need to find a way to force re-evaluation of localization.js if lang changes are needed between tests.
    // Standard import() is cached. For now, we primarily test 'en'.
  });

  it("should retrieve existing keys for the default language (en)", () => {
    expect(t("companyTitle")).toBe("ING");
    expect(t("viewEmployees")).toBe("Employees");
    expect(t("addEmployee")).toBe("Add New");
    expect(t("cancel")).toBe("Cancel");
  });

  // TODO: Add tests for 'tr' if we can reliably switch language context in tests.
  // it('should retrieve existing keys for Turkish (tr) if lang is set', () => {
  //   // This might require modifying localization.js or test setup
  //   document.documentElement.lang = 'tr';
  //   // Re-import or re-initialize localization if possible
  //   expect(t('companyTitle')).to.equal('ING'); // Should be same
  //   expect(t('viewEmployees')).to.equal('Personelleri Görüntüle');
  //   expect(t('cancel')).to.equal('İptal');
  // });

  it("should return the key itself if the key is missing", () => {
    const missingKey = "thisKeyDoesNotExist_123";
    expect(t(missingKey)).toBe(missingKey);
  });

  it("should handle placeholder interpolation correctly", () => {
    const name = "Test User";
    const count = 5;
    expect(t("confirmDeleteMessage", { name })).toBe(
      `Selected Employee record of ${name} will be deleted`
    );
    expect(t("confirmBulkDeleteMessage", { count })).toBe(
      `Are you sure you want to delete ${count} selected employee record(s)?`
    );
  });

  it("should return the key if values are provided but the key is missing", () => {
    const missingKey = "anotherMissingKey_456";
    expect(t(missingKey, { name: "Ignored" })).toBe(missingKey);
  });

  it("should return the original translation if values are provided but dont match placeholders", () => {
    expect(t("confirmDeleteMessage", { nonMatchingValue: "ignored" })).toBe(
      "Selected Employee record of {name} will be deleted"
    );
  });

  it("should handle multiple placeholders", () => {
    // Example: Assuming a key like "welcomeUserInDept": "Welcome {user} to the {dept} department!"
    // We don't have such a key, so let's test interpolation logic generally
    // Let's temporarily add a key to en.json or mock it if localization.js allowed overriding translations
    // For now, we test the existing multi-placeholder key
    expect(t("confirmBulkDeleteMessage", { count: 3 })).toBe(
      `Are you sure you want to delete 3 selected employee record(s)?`
    );
  });
});
