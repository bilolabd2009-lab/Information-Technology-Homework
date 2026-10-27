/**
 * Приёмник заявок «Зерно 7» — веб-приложение Google Apps Script.
 * Принимает заявку с формы сайта (POST, JSON) и дописывает строку в лист leads
 * таблицы «Zerno7 — Leads». Ответ: {"ok": true} или {"ok": false, "error": "..."}.
 *
 * Установка (подробно — docs/setup.md, шаг 3):
 * 1. Таблица «Zerno7 — Leads» → Расширения → Apps Script → вставить этот код.
 * 2. SPREADSHEET_ID можно не вписывать: без него берётся таблица, к которой привязан скрипт.
 * 3. Запустить setupSheet() один раз — создаст заголовки, списки и подсветку.
 * 4. Развернуть → Новое развёртывание → Веб-приложение:
 *    «Выполнять как: я», «Доступ: все». Полученный URL вставить в js/form.js.
 */

// Пусто — берётся таблица, из которой открыт редактор (Расширения → Apps Script)
const SPREADSHEET_ID = '';
const SHEET_NAME = 'leads';

const HEADERS = ['request_id', 'created_at', 'name', 'phone', 'email', 'course', 'start_month',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'status'];
const COURSES = ['barista_basic', 'latte_art', 'alternative', 'corporate'];
const MONTHS = ['dec_2026', 'jan_2027', 'feb_2027'];
const STATUSES = ['new', 'contacted', 'prepaid', 'paid', 'lost'];
const MAX_LENGTH = 200;

/* ---------------- Приём заявки ---------------- */

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // две заявки одновременно не запишутся в одну строку

    const data = parseRequest_(e);
    const error = validate_(data);
    if (error) return json_({ ok: false, error: error });

    const sheet = getSheet_();
    if (isDuplicate_(sheet, data.request_id)) {
      return json_({ ok: false, error: 'duplicate_request_id' });
    }

    sheet.appendRow([
      data.request_id,
      new Date(),            // created_at ставит приёмник
      data.name,
      data.phone,
      data.email,
      data.course,
      data.start_month,
      data.utm_source,
      data.utm_medium,
      data.utm_campaign,
      data.utm_content,
      'new'                  // status из браузера игнорируется
    ]);
    return json_({ ok: true, request_id: data.request_id });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'server_error' });
  } finally {
    lock.releaseLock();
  }
}

// Проверка, что приёмник работает: открыть URL веб-приложения в браузере
function doGet() {
  return json_({ ok: true, service: 'zerno7-leads' });
}

/* ---------------- Вспомогательные функции ---------------- */

// Тело запроса: JSON (основной вариант) или обычные поля формы
function parseRequest_(e) {
  let raw = {};
  if (e && e.postData && e.postData.contents) {
    try {
      raw = JSON.parse(e.postData.contents);
    } catch (err) {
      raw = e.parameter || {};
    }
  } else if (e && e.parameter) {
    raw = e.parameter;
  }

  const text = function (key) {
    return raw[key] === undefined || raw[key] === null ? '' : String(raw[key]).trim();
  };

  return {
    request_id: text('request_id'),
    name: text('name'),
    phone: text('phone'),
    email: text('email'),
    course: text('course'),
    start_month: text('start_month'),
    utm_source: text('utm_source') || 'direct',
    utm_medium: text('utm_medium') || 'none',
    utm_campaign: text('utm_campaign') || 'not_set',
    utm_content: text('utm_content') || 'not_set',
    consent: raw.consent === true || raw.consent === 'true' || raw.consent === 'on'
  };
}

// Возвращает код ошибки или null, если заявка правильная
function validate_(d) {
  const fields = ['request_id', 'name', 'phone', 'email', 'course', 'start_month',
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
  for (let i = 0; i < fields.length; i++) {
    if (d[fields[i]].length > MAX_LENGTH) return fields[i] + '_too_long';
  }
  if (!d.request_id) return 'request_id_required';
  if (!/^REQ-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(d.request_id)) return 'request_id_format';
  if (!d.name) return 'name_required';
  if (d.name.length < 2 || d.name.length > 60) return 'name_length';
  if (!d.phone) return 'phone_required';
  if (!/^\+7\d{10}$/.test(d.phone)) return 'phone_format';
  if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) return 'email_format';
  if (COURSES.indexOf(d.course) === -1) return 'course_invalid';
  if (MONTHS.indexOf(d.start_month) === -1) return 'start_month_invalid';
  if (!d.consent) return 'consent_required';
  return null;
}

function getSheet_() {
  const sheet = openSpreadsheet_().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Нет листа ' + SHEET_NAME + ': запустите setupSheet()');
  return sheet;
}

// Есть ли уже строка с таким request_id (ищем в столбце A целую ячейку)
function isDuplicate_(sheet, requestId) {
  const found = sheet.getRange('A:A').createTextFinder(requestId).matchEntireCell(true).findNext();
  return found !== null;
}

function openSpreadsheet_() {
  return SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------------- Настройка таблицы (запустить один раз вручную) ---------------- */

function setupSheet() {
  const ss = openSpreadsheet_();
  ss.setSpreadsheetTimeZone('Europe/Moscow');
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  const rows = 1000;

  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold').setBackground('#F6EFE6');
  sheet.setFrozenRows(1);

  // Текстовый формат: «+79001234567» не превратится в число, «=...» — в формулу
  sheet.getRange(2, 1, rows, HEADERS.length).setNumberFormat('@');
  sheet.getRange(2, 2, rows, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');

  // Выпадающие списки: другое значение отклоняется
  const list = function (values) {
    return SpreadsheetApp.newDataValidation().requireValueInList(values, true).setAllowInvalid(false).build();
  };
  sheet.getRange(2, 6, rows, 1).setDataValidation(list(COURSES));   // F course
  sheet.getRange(2, 7, rows, 1).setDataValidation(list(MONTHS));    // G start_month
  sheet.getRange(2, 12, rows, 1).setDataValidation(list(STATUSES)); // L status

  // Условное форматирование
  const rules = [];
  // повторяющийся request_id — красным
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=AND($A2<>"",COUNTIF($A:$A,$A2)>1)')
    .setBackground('#F4C7C3').setFontColor('#B3261E')
    .setRanges([sheet.getRange('A2:A' + (rows + 1))]).build());
  // пустая обязательная ячейка в заполненной строке — жёлтым (email необязателен)
  const required = ['A', 'B', 'C', 'D', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  required.forEach(function (col) {
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND(COUNTA($A2:$L2)>0,' + col + '2="")')
      .setBackground('#FFF2B3')
      .setRanges([sheet.getRange(col + '2:' + col + (rows + 1))]).build());
  });
  sheet.setConditionalFormatRules(rules);
  sheet.autoResizeColumns(1, HEADERS.length);
}

/* Ручная проверка приёмника из редактора: Выполнить → testDoPost.
   Первая отправка запишет строку, вторая с тем же request_id вернёт ошибку. */
function testDoPost() {
  const body = {
    request_id: 'REQ-00000000-0000-4000-8000-000000000001', name: 'Тест редактора', phone: '+79001234567',
    email: '', course: 'barista_basic', start_month: 'dec_2026', utm_source: 'test', utm_medium: 'none',
    utm_campaign: 'not_set', utm_content: 'not_set', consent: true
  };
  const e = { postData: { contents: JSON.stringify(body) }, parameter: {} };
  console.log(doPost(e).getContent());
  console.log(doPost(e).getContent()); // ожидается duplicate_request_id
}
