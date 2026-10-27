/* menu.js — фильтр меню кофейни: кофе, чай, десерты, без лактозы */
(function () {
  'use strict';

  var chips = document.querySelectorAll('.chip[data-filter]');
  var items = document.querySelectorAll('.menu-item');
  var empty = document.getElementById('menu-empty');
  if (!chips.length) return;

  function applyFilter(value) {
    var shown = 0;
    items.forEach(function (item) {
      var tags = item.dataset.tags.split(' ');
      var visible = value === 'all' || tags.indexOf(value) !== -1;
      item.hidden = !visible;
      if (visible) shown += 1;
    });
    empty.hidden = shown > 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
      applyFilter(chip.dataset.filter);
    });
  });
})();
