/* form.js — форма заявки на contacts.html: проверка полей, UTM-метки, отправка в Apps Script */
(function () {
  'use strict';

  // Адрес веб-приложения Apps Script (Развернуть → Веб-приложение → URL)
  var ENDPOINT = 'https://script.google.com/macros/s/ВСТАВЬТЕ_ID_РАЗВЁРТЫВАНИЯ/exec';

  var form = document.getElementById('lead-form');
  if (!form) return;
  var els = form.elements; // поля формы по атрибуту name

  var COURSES = ['barista_basic', 'latte_art', 'alternative', 'corporate'];
  var MONTHS = ['dec_2026', 'jan_2027', 'feb_2027'];
  var submitBtn = document.getElementById('f-submit');
  var statusBox = document.getElementById('form-status');
  var analytics = window.zernoAnalytics;

  /* ---------- Номер заявки: REQ- + UUID ---------- */
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
  els.request_id.value = 'REQ-' + uuid();

  /* ---------- UTM-метки: из адреса страницы или из sessionStorage ---------- */
  function readUtm() {
    var saved = {};
    try { saved = JSON.parse(sessionStorage.getItem('zerno7_utm')) || {}; } catch (e) { saved = {}; }
    var query = new URLSearchParams(window.location.search);
    function pick(key) { return (query.get(key) || saved[key] || '').slice(0, 200); }
    return {
      utm_source: pick('utm_source') || 'direct',
      utm_medium: pick('utm_medium') || 'none',
      utm_campaign: pick('utm_campaign') || 'not_set',
      utm_content: pick('utm_content') || 'not_set'
    };
  }
  var utm = readUtm();
  Object.keys(utm).forEach(function (key) { els[key].value = utm[key]; });

  /* ---------- Курс и месяц из ссылки: contacts.html?course=latte_art&month=dec_2026 ---------- */
  var params = new URLSearchParams(window.location.search);
  if (COURSES.indexOf(params.get('course')) !== -1) els.course.value = params.get('course');
  if (MONTHS.indexOf(params.get('month')) !== -1) els.start_month.value = params.get('month');

  /* ---------- Проверка полей ---------- */
  // +7 (900) 123-45-67, 8 900 123 45 67, 9001234567 → +79001234567
  function normalizePhone(value) {
    var digits = value.replace(/\D/g, '');
    if (digits.length === 11 && (digits[0] === '7' || digits[0] === '8')) return '+7' + digits.slice(1);
    if (digits.length === 10) return '+7' + digits;
    return value.trim();
  }

  function validate() {
    var errors = [];
    var name = els.name.value.trim();
    var phone = normalizePhone(els.phone.value);
    var email = els.email.value.trim();

    if (!name) errors.push({ field: 'name', type: 'required', text: 'Введите имя' });
    else if (name.length < 2 || name.length > 60) errors.push({ field: 'name', type: 'length', text: 'Имя — от 2 до 60 символов' });

    if (!els.phone.value.trim()) errors.push({ field: 'phone', type: 'required', text: 'Введите номер телефона' });
    else if (!/^\+7\d{10}$/.test(phone)) errors.push({ field: 'phone', type: 'format', text: 'Номер в формате +7 и 10 цифр, например +7 900 123-45-67' });

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.push({ field: 'email', type: 'format', text: 'Проверьте e-mail: пример — name@mail.ru' });

    if (COURSES.indexOf(els.course.value) === -1) errors.push({ field: 'course', type: 'required', text: 'Выберите курс' });
    if (MONTHS.indexOf(els.start_month.value) === -1) errors.push({ field: 'start_month', type: 'required', text: 'Выберите месяц старта' });
    if (!els.consent.checked) errors.push({ field: 'consent', type: 'consent', text: 'Без согласия на обработку данных мы не сможем принять заявку' });

    return errors;
  }

  function showError(field, text) {
    var input = els[field];
    var box = document.getElementById('err-' + field);
    input.setAttribute('aria-invalid', 'true');
    box.textContent = text;
    box.hidden = false;
  }

  function clearError(field) {
    els[field].removeAttribute('aria-invalid');
    document.getElementById('err-' + field).hidden = true;
  }

  ['name', 'phone', 'email', 'course', 'start_month', 'consent'].forEach(function (field) {
    var eventName = els[field].tagName === 'SELECT' || els[field].type === 'checkbox' ? 'change' : 'input';
    els[field].addEventListener(eventName, function () { clearError(field); });
  });

  function setSending(isSending) {
    submitBtn.disabled = isSending;
    submitBtn.textContent = isSending ? 'Отправляем…' : 'Отправить заявку';
  }

  function serverFail(errorType, message) {
    statusBox.textContent = message;
    statusBox.hidden = false;
    analytics.track('form_error', { field_name: 'form', error_type: errorType });
    setSending(false);
  }

  /* ---------- Отправка ---------- */
  form.addEventListener('submit', function (event) {
    event.preventDefault(); // без перезагрузки страницы
    analytics.trackFormSubmit(form.id);
    statusBox.hidden = true;

    var errors = validate();
    if (errors.length) {
      errors.forEach(function (err) {
        showError(err.field, err.text);
        analytics.track('form_error', { field_name: err.field, error_type: err.type });
      });
      els[errors[0].field].focus();
      return;
    }

    var data = {
      request_id: els.request_id.value,
      name: els.name.value.trim(),
      phone: normalizePhone(els.phone.value),
      email: els.email.value.trim(),
      course: els.course.value,
      start_month: els.start_month.value,
      utm_source: els.utm_source.value,
      utm_medium: els.utm_medium.value,
      utm_campaign: els.utm_campaign.value,
      utm_content: els.utm_content.value,
      consent: true
    };

    setSending(true);
    // text/plain — «простой» запрос, Apps Script принимает его без CORS-ошибки
    fetch(ENDPOINT, { method: 'POST', body: JSON.stringify(data) })
      .then(function (response) { return response.json(); })
      .then(function (answer) {
        // duplicate_request_id: прошлая попытка уже записана, ответ на неё потерялся
        if (answer.ok === true || answer.error === 'duplicate_request_id') {
          try { sessionStorage.setItem('zerno7_request_id', data.request_id); } catch (e) { /* не страшно */ }
          analytics.track('generate_lead', { lead_course: data.course, lead_source: data.utm_source }, function () {
            window.location.href = 'thanks.html';
          });
        } else {
          serverFail('server', 'Заявка не отправлена (' + (answer.error || 'ошибка') + '). Проверьте поля или позвоните: +7 (900) 207-07-77.');
        }
      })
      .catch(function () {
        serverFail('server', 'Не удалось связаться с сервером. Проверьте интернет и попробуйте ещё раз или позвоните: +7 (900) 207-07-77.');
      });
  });
})();
