/* analytics.js — все вызовы gtag('event', ...) сайта «Зерно 7».
   Кнопки и ссылки описываются атрибутами data-event и data-* в HTML,
   а этот файл находит их и отправляет событие в Google Analytics 4. */
(function () {
  'use strict';

  // Включите (true), если автоматическое событие form_submit не приходит в DebugView
  var MANUAL_FORM_SUBMIT = false;

  // Параметры, которые разрешено брать из data-атрибутов (имя в snake_case)
  var ALLOWED_PARAMS = [
    'button_name', 'page_section', 'course_name', 'start_date', 'filter_value',
    'bean_name', 'roast_level', 'promo_code', 'contact_type', 'messenger',
    'network', 'map_service', 'photo_index'
  ];

  // Отправить событие в GA4. callback вызывается после отправки (или через 1,2 с)
  function track(eventName, params, callback) {
    var data = {};
    Object.keys(params || {}).forEach(function (key) {
      var value = params[key];
      if (value !== undefined && value !== null && value !== '') {
        data[key] = String(value).slice(0, 100); // значение не длиннее 100 символов
      }
    });

    if (typeof callback === 'function') {
      var called = false;
      var finish = function () {
        if (!called) { called = true; callback(); }
      };
      data.event_callback = finish;
      setTimeout(finish, 1200); // если GA заблокирован, всё равно продолжаем
    }

    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, data);
    } else if (data.event_callback) {
      data.event_callback();
    }
  }

  // data-button-name="hero_signup" → { button_name: "hero_signup" }
  function paramsFromElement(el) {
    var params = {};
    Object.keys(el.dataset).forEach(function (key) {
      var snake = key.replace(/[A-Z]/g, function (letter) { return '_' + letter.toLowerCase(); });
      if (ALLOWED_PARAMS.indexOf(snake) !== -1) params[snake] = el.dataset[key];
    });
    return params;
  }

  // Один обработчик кликов на весь документ: работает и для кнопок, созданных скриптом
  document.addEventListener('click', function (event) {
    var el = event.target.closest('[data-event]');
    if (!el) return;
    if (el.disabled || el.getAttribute('aria-disabled') === 'true') return; // поток без мест
    track(el.dataset.event, paramsFromElement(el));
  });

  // form_submit вручную — только если автоматический не работает
  function trackFormSubmit(formId) {
    if (MANUAL_FORM_SUBMIT) track('form_submit', { form_id: formId });
  }

  // Доступ для других скриптов: form.js, quiz.js
  window.zernoAnalytics = { track: track, trackFormSubmit: trackFormSubmit };
})();
