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

// jsdom doesn't implement the Pointer Events capture methods at all —
// Radix UI's components (e.g. Select) call these internally for their
// pointer-driven interactions.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
}

// jsdom doesn't implement layout at all, so this is a no-op there —
// Radix's Select calls it when scrolling a selected item into view.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
