// Runs in <head>, before the page paints, on every page of the site: the app
// (inlined by src/app/layout.tsx) and the standalone articles (inlined by
// scripts/apply-article-chrome.py). Plain ES5, no build step.
//
// It decides the theme once, so the page never flashes the wrong colours:
// a choice made with the toggle wins; otherwise the system setting decides.
(function () {
  var KEY = 'theme';
  var root = document.documentElement;
  var system = window.matchMedia('(prefers-color-scheme: dark)');

  function chosen() {
    try {
      var value = localStorage.getItem(KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch (error) {
      return null; // storage blocked: follow the system setting
    }
  }

  function apply() {
    root.setAttribute('data-theme', chosen() || (system.matches ? 'dark' : 'light'));
  }

  apply();

  // Follow the system if it changes, unless the reader has chosen for themselves.
  system.addEventListener('change', function () {
    if (!chosen()) apply();
  });

  // One listener serves every toggle on the page, however it was rendered.
  document.addEventListener('click', function (event) {
    var toggle = event.target.closest && event.target.closest('[data-theme-toggle]');
    if (!toggle) return;
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(KEY, next);
    } catch (error) {
      /* the choice still applies to this page */
    }
    root.setAttribute('data-theme', next);
  });
})();
