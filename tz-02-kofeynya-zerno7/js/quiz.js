/* quiz.js — тест «Какой курс вам подходит» на главной. Правила подсчёта: docs/quiz.md */
(function () {
  'use strict';

  var form = document.getElementById('quiz-form');
  if (!form) return;

  // Порядок курсов: при равенстве баллов побеждает тот, что раньше в списке
  var ORDER = ['barista_basic', 'latte_art', 'alternative', 'corporate'];

  var RESULTS = {
    barista_basic: { title: 'Бариста с нуля', text: '5 занятий по 3 часа, 14 900 ₽. Научитесь готовить эспрессо и напитки с молоком и сможете работать за стойкой.' },
    latte_art: { title: 'Латте-арт', text: '3 занятия, 8 900 ₽. Сердце, тюльпан и розетта на капучино — для тех, кто уже умеет готовить эспрессо.' },
    alternative: { title: 'Альтернативное заваривание', text: '2 занятия, 5 900 ₽. Воронка, аэропресс и кемекс — вкусный кофе дома без кофемашины.' },
    corporate: { title: 'Корпоративный мастер-класс', text: 'Для команды до 12 человек, 24 000 ₽. Обучим персонал вашего кафе.' }
  };

  // SCORES[вопрос][вариант] — сколько баллов получает каждый курс
  var SCORES = [
    [{ barista_basic: 2 }, { latte_art: 2 }, { alternative: 2 }, { corporate: 3 }],
    [{ barista_basic: 1 }, { latte_art: 2 }, { alternative: 1 }, { corporate: 1 }],
    [{ barista_basic: 2 }, { latte_art: 1 }, { alternative: 2 }, { corporate: 2 }],
    [{ barista_basic: 1 }, { latte_art: 1 }, { alternative: 1 }, { corporate: 3 }]
  ];

  var steps = form.querySelectorAll('.quiz-step');
  var nextBtn = document.getElementById('quiz-next');
  var backBtn = document.getElementById('quiz-back');
  var hint = document.getElementById('quiz-hint');
  var resultBox = document.getElementById('quiz-result');
  var current = 0;

  function showStep(index) {
    steps.forEach(function (step, i) { step.hidden = i !== index; });
    backBtn.hidden = index === 0;
    nextBtn.textContent = index === steps.length - 1 ? 'Показать результат' : 'Дальше';
    hint.hidden = true;
  }

  function answerOf(index) {
    var checked = steps[index].querySelector('input:checked');
    return checked ? Number(checked.value) : null;
  }

  function calculate() {
    var totals = { barista_basic: 0, latte_art: 0, alternative: 0, corporate: 0 };
    for (var q = 0; q < steps.length; q++) {
      var points = SCORES[q][answerOf(q)];
      Object.keys(points).forEach(function (course) { totals[course] += points[course]; });
    }
    var best = ORDER[0];
    ORDER.forEach(function (course) { if (totals[course] > totals[best]) best = course; });
    return best;
  }

  function showResult() {
    var course = calculate();
    steps.forEach(function (step) { step.hidden = true; });
    nextBtn.hidden = true;
    backBtn.hidden = true;
    document.getElementById('quiz-result-title').textContent = RESULTS[course].title;
    document.getElementById('quiz-result-text').textContent = RESULTS[course].text;
    document.getElementById('quiz-result-link').href = 'contacts.html?course=' + course;
    resultBox.hidden = false;
    window.zernoAnalytics.track('quiz_complete', { quiz_result: course });
  }

  nextBtn.addEventListener('click', function () {
    if (answerOf(current) === null) { hint.hidden = false; return; }
    if (current < steps.length - 1) { current += 1; showStep(current); }
    else { showResult(); }
  });

  backBtn.addEventListener('click', function () {
    if (current > 0) { current -= 1; showStep(current); }
  });

  document.getElementById('quiz-restart').addEventListener('click', function () {
    form.reset();
    current = 0;
    resultBox.hidden = true;
    nextBtn.hidden = false;
    showStep(0);
  });

  form.addEventListener('submit', function (e) { e.preventDefault(); });
})();
