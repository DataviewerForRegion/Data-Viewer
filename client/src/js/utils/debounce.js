/**
 * @file Debounce function - Execute function only once in specified wait time.
 * based on underscore.js
 * @param {function} func - Function to execute
 * @param {number} wait - Wait time in milliseconds
 *
*/
export default function debounce(func, wait, tag) {
  // Closure to preserve timeout
  let timeout;
  return function deb(...args) {
    const context = this;
    // const args = arguments;
    const later = function later() {
      tag.update();
      timeout = null;
      func.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
