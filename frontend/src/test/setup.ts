import "@testing-library/jest-dom";

// jsdom parses <dialog> but doesn't implement showModal()/close() at all
// (https://github.com/jsdom/jsdom/issues/3294) — every real browser does.
// Polyfill just enough for tests to exercise components that use it.
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
}
