/* courses.js — даты потоков и свободные места на странице «Курсы» */
(function () {
  'use strict';

  var box = document.getElementById('streams');
  if (!box) return;

  // Потоки и свободные места. Руководитель школы меняет числа здесь.
  var STREAMS = [
    { course: 'barista_basic', date: '2026-12-02', seats: 2 },
    { course: 'barista_basic', date: '2026-12-16', seats: 4 },
    { course: 'barista_basic', date: '2027-01-13', seats: 6 },
    { course: 'latte_art', date: '2026-12-07', seats: 3 },
    { course: 'latte_art', date: '2027-01-20', seats: 6 },
    { course: 'alternative', date: '2026-12-05', seats: 0 },
    { course: 'alternative', date: '2026-12-12', seats: 5 },
    { course: 'alternative', date: '2026-12-19', seats: 1 },
    { course: 'alternative', date: '2026-12-26', seats: 6 }
  ];

  var COURSES = [
    { id: 'barista_basic', title: 'Бариста с нуля' },
    { id: 'latte_art', title: 'Латте-арт' },
    { id: 'alternative', title: 'Альтернативное заваривание — каждую субботу' }
  ];

  var MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  var MONTH_CODES = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  // '2026-12-02' → '2 декабря 2026'
  function dateLabel(iso) {
    var p = iso.split('-');
    return Number(p[2]) + ' ' + MONTHS[Number(p[1]) - 1] + ' ' + p[0];
  }

  // '2026-12-02' → 'dec_2026' (значение для поля «Месяц старта»)
  function monthCode(iso) {
    var p = iso.split('-');
    return MONTH_CODES[Number(p[1]) - 1] + '_' + p[0];
  }

  // 1 место, 2 места, 5 мест
  function seatsLabel(n) {
    var last = n % 10, lastTwo = n % 100;
    if (last === 1 && lastTwo !== 11) return n + ' место';
    if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return n + ' места';
    return n + ' мест';
  }

  function renderStream(stream) {
    var li = document.createElement('li');
    li.className = 'stream';
    var html = '<span class="stream-date">' + dateLabel(stream.date) + '</span>';
    if (stream.seats > 0) {
      html += '<span class="seats">Свободно ' + seatsLabel(stream.seats) + ' из 6</span>' +
        '<a class="btn btn-primary" href="contacts.html?course=' + stream.course + '&month=' + monthCode(stream.date) + '"' +
        ' data-event="select_course_date" data-course-name="' + stream.course + '" data-start-date="' + stream.date + '">Выбрать поток</a>';
    } else {
      li.classList.add('is-full');
      html += '<span class="seats">Мест нет</span>' +
        '<button class="btn" type="button" disabled aria-disabled="true">Выбрать поток</button>';
    }
    li.innerHTML = html;
    return li;
  }

  box.innerHTML = '';
  COURSES.forEach(function (course) {
    var group = document.createElement('div');
    group.className = 'stream-group';
    group.innerHTML = '<h3>' + course.title + '</h3>';
    var list = document.createElement('ul');
    list.className = 'stream-list';
    STREAMS.filter(function (s) { return s.course === course.id; })
      .forEach(function (s) { list.appendChild(renderStream(s)); });
    group.appendChild(list);
    box.appendChild(group);
  });

  var corp = document.createElement('div');
  corp.className = 'stream-group';
  corp.innerHTML = '<h3>Корпоративный мастер-класс</h3><p>Дату и время согласуем с вашей командой.</p>' +
    '<a class="btn btn-ghost" href="contacts.html?course=corporate" data-event="cta_click" data-button-name="corporate_date" data-page-section="dates">Согласовать дату</a>';
  box.appendChild(corp);

  /* Карточка курса: клик по заголовку сворачивает и разворачивает программу */
  document.querySelectorAll('.course-full-head').forEach(function (head) {
    head.addEventListener('click', function () {
      var body = document.getElementById(head.getAttribute('aria-controls'));
      var expanded = head.getAttribute('aria-expanded') === 'true';
      head.setAttribute('aria-expanded', String(!expanded));
      body.hidden = expanded;
    });
  });
})();
