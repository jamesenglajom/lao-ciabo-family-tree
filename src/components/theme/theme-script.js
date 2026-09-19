const THEME_INIT = `
(function () {
  try {
    var stored = localStorage.getItem("lct-theme");
    var theme = stored === "light" || stored === "dark" ? stored : "light";
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "light");
  }
})();
`;

/**
 * Sets the theme attribute before first paint to avoid a light/dark flash.
 * The brand default is light; a visitor's explicit choice is remembered.
 */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />;
}
