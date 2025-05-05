import en from "../locales/en.json";
import tr from "../locales/tr.json";

const translations = {
  en,
  tr,
};

let currentLang = document.documentElement.lang || "en";
if (!translations[currentLang]) {
  console.warn(
    `Localization: Language "${currentLang}" not found, falling back to 'en'.`
  );
  currentLang = "en";
}

let currentTranslations = translations[currentLang];

/**
 * Gets the translated string for a given key.
 * Supports simple interpolation with {key}.
 *
 * @param {string} key - The translation key.
 * @param {object} [values] - Optional values for interpolation.
 * @returns {string} The translated string or the key itself if not found.
 */
export function t(key, values) {
  let translation = currentTranslations[key] || key;

  if (values && typeof translation === "string") {
    Object.keys(values).forEach((valueKey) => {
      const regex = new RegExp(`\\\{${valueKey}\\\}`, "g");
      translation = translation.replace(regex, values[valueKey]);
    });
  }

  return translation;
}
