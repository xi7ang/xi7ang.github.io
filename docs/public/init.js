/* global window, document */
(function () {
  function fetchResources() {
    return fetch('/data/resources.json')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        window.__RESOURCES__ = d;
        document.dispatchEvent(new Event('resources-ready'));
      })
      .catch(function () {});
  }

  function fetchSearchIndex() {
    return fetch('/data/search-index.json')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        window.__SEARCH_INDEX__ = d;
        document.dispatchEvent(new Event('search-ready'));
      })
      .catch(function () {});
  }

  // If data already loaded (e.g. from a previous script), don't re-fetch
  if (!window.__RESOURCES__ || !window.__RESOURCES__.length) {
    fetchResources();
  }
  if (!window.__SEARCH_INDEX__) {
    fetchSearchIndex();
  }
})();
