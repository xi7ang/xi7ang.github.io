// Async non-blocking Google Fonts loader
// Eliminates render-blocking ~3s LCP delay from synchronous stylesheet
(function() {
  var l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap';
  document.head.appendChild(l);
})();
