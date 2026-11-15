// Behaviour shared by every article. Loaded with `defer` by the chrome that
// scripts/apply-article-chrome.py adds. Everything here is an extra: without
// it the article reads the same, only without these two conveniences.
(function () {
  // "Back to top" appears once the reader is a couple of screens down.
  var toTop = document.querySelector('.to-top');
  if (toTop) {
    var update = function () {
      toTop.classList.toggle('is-visible', window.scrollY > window.innerHeight * 1.5);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    toTop.addEventListener('click', function (event) {
      event.preventDefault();
      var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' });
    });
  }

  // A "Copy" button on each code block, for the step-by-step guides.
  if (navigator.clipboard) {
    Array.prototype.forEach.call(document.querySelectorAll('article pre'), function (pre) {
      var wrap = document.createElement('div');
      wrap.className = 'code-block';
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(pre);

      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy-code';
      button.textContent = 'Copy';
      button.setAttribute('aria-label', 'Copy this code');
      button.addEventListener('click', function () {
        navigator.clipboard.writeText(pre.innerText).then(function () {
          button.textContent = 'Copied';
          setTimeout(function () {
            button.textContent = 'Copy';
          }, 2000);
        });
      });
      wrap.appendChild(button);
    });
  }
})();
