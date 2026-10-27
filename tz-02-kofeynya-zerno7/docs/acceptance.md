# Подготовка к приёмке (раздел 10)

Перед приёмкой открыть: GA4 (DebugView и Realtime), таблицу «Zerno7 — Leads», ManyChat, DataLens. Включить расширение Google Analytics Debugger.

| № | Испытание | Что сделать / что показать |
|---|---|---|
| И-01 | Сайт | Chrome → F12 → значок телефона → ширина 375. Пройти все 9 страниц и меню (кнопка ☰). |
| И-02 | Тег | `Ctrl+U` на любой странице → в `<head>` строка `googletagmanager.com/gtag/js?id=G-…` с вашим ID. |
| И-03 | Контрольная заявка | Заказчик переходит по ссылке реестра и отправляет заявку «Приёмка ТЗ-02/2026» → строка в `leads` с метками строки реестра, в DebugView/Realtime — `generate_lead`. |
| И-04 | Ошибки формы | Пустой телефон → «Введите номер телефона»; «123» → «Номер в формате +7 и 10 цифр». В DebugView — `form_error` с `field_name=phone`, `error_type=required` / `format`. |
| И-05 | Повтор | Скрипт ниже в консоли браузера (F12 → Console) с `request_id` уже записанной заявки → ответ `duplicate_request_id`, новой строки нет. |
| И-06 | События | Где вызывается каждое событие — `docs/events.md`. |
| И-07 | Instagram | Заказчик пишет `ЛАТТЕ` под Reel → ответ в комментариях и Direct с кнопкой → ссылка совпадает с U-02. |
| И-08 | Короткая ссылка | Короткая ссылка U-05 → в адресе все 5 меток. |
| И-09 | DataLens | Вкладка «Кампании» → сменить период → меняются все виджеты; число заявок = строкам `leads` за тот же период. |
| И-10 | Статус | Заявку из И-03 перевести в `paid` → обновить дашборд → «Оплатил курс» +1. |
| И-11 | Отчёты | Пример: «С какой страницы входа из Instagram больше всего ключевых событий?» → Reports → Engagement → Landing page, фильтр/сравнение Session source = instagram, показатель Key events. |
| И-12 | Воронка | Открытая → закрытая: в закрытой меньше, потому что считаются только те, кто прошёл шаги по порядку с первого (`docs/report.md`, подсказки). |
| И-13 | Тест | Все первые варианты → «Бариста с нуля», в DebugView `quiz_complete` с `quiz_result=barista_basic` (`docs/quiz.md`). |

## Скрипт для И-05 (повторный запрос)

Вставьте URL приёмника и `request_id` из таблицы:

```js
fetch('https://script.google.com/macros/s/ВАШ_ID/exec', {
  method: 'POST',
  body: JSON.stringify({
    request_id: 'REQ-…из таблицы…', name: 'Повтор', phone: '+79001234567',
    course: 'barista_basic', start_month: 'dec_2026', consent: true
  })
}).then(r => r.json()).then(console.log);
// Ожидается: {ok: false, error: "duplicate_request_id"}
```

## Если Заказчик выберет фрагмент JS (3.1)

Самые короткие для объяснения: функция `track` в `js/analytics.js`, `normalizePhone` и `readUtm` в `js/form.js`, `calculate` в `js/quiz.js`, `seatsLabel` в `js/courses.js`. Каждая строка в этих файлах снабжена комментарием или говорящим именем — прочитайте их до приёмки.
