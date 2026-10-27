# Таблица событий GA4

Все вызовы `gtag('event', …)` — одна строка: `js/analytics.js:37` (функция `track`).
Кнопки описаны атрибутами `data-event` и `data-*` в HTML; `analytics.js` ловит клик и отправляет событие.
Ниже для каждого события — где оно срабатывает (файл:строка).

## Автоматические (расширенная статистика, без кода)

| № | Событие | Когда | Параметры (пример) |
|---|---|---|---|
| 1 | `page_view` | Открытие любой страницы | page_location: `https://…/courses.html`, page_title: `Курсы бариста…` |
| 2 | `scroll` | Прокрутка до 90 % | percent_scrolled: `90` |
| 3 | `click` | Переход по внешней ссылке (Telegram, WhatsApp, соцсети, Яндекс Карты) | link_url: `https://t.me/zerno7_school`, outbound: `true` |
| 4 | `file_download` | Скачивание PDF (`files/program-barista.pdf`, `files/latte-guide.pdf`) | file_name: `/files/latte-guide.pdf`, file_extension: `pdf` |
| 5 | `form_start` | Первое взаимодействие с формой `lead-form` | form_id: `lead-form` |
| 6 | `form_submit` | Отправка формы `lead-form` | form_id: `lead-form` |

> Если `form_submit` не появляется в DebugView (форма отправляется через fetch), включите `MANUAL_FORM_SUBMIT = true` в `js/analytics.js` — тогда его отправит `form.js`.

## Свои события

| № | Событие | Метка | Когда | Где отправляется | Параметры (пример) |
|---|---|---|---|---|---|
| 7 | `generate_lead` | ключевое | Приёмник ответил ok: true | `js/form.js:147` | lead_course: `latte_art`, lead_source: `instagram` |
| 8 | `cta_click` |  | Клик по кнопке заявки | `beans.html:169`, `courses.html:91`, `courses.html:107`, `courses.html:122`, `courses.html:138`, `index.html:73` и ещё 4 | button_name: `hero_signup`, page_section: `hero` |
| 9 | `view_course` |  | Клик по карточке курса | `courses.html:77`, `courses.html:95`, `courses.html:111`, `courses.html:126`, `index.html:89`, `index.html:100` и ещё 2 | course_name: `barista_basic` |
| 10 | `select_course_date` |  | Кнопка «Выбрать поток» (поток без мест не отправляет) | `js/courses.js:57` | course_name: `latte_art`, start_date: `2026-12-07` |
| 11 | `quiz_complete` |  | Показ результата теста | `js/quiz.js:65` | quiz_result: `barista_basic` |
| 12 | `menu_filter` |  | Клик по фильтру меню | `menu.html:76`, `menu.html:77`, `menu.html:78`, `menu.html:79`, `menu.html:80` | filter_value: `lactose_free` |
| 13 | `bean_view` |  | Клик по карточке сорта | `beans.html:77`, `beans.html:89`, `beans.html:101`, `beans.html:113`, `beans.html:125`, `beans.html:137` | bean_name: `kenya_nyeri`, roast_level: `light` |
| 14 | `promo_copy` |  | Кнопка «Скопировать» промокод | `latte-guide.html:137` | promo_code: `LATTE10` |
| 15 | `contact_click` | ключевое | Клик по телефону или e-mail | `404.html:60`, `404.html:86`, `404.html:87`, `beans.html:60`, `beans.html:182`, `beans.html:183` и ещё 24 | contact_type: `phone` / `email`, page_section: `header` |
| 16 | `messenger_click` | ключевое | Кнопка Telegram или WhatsApp | `contacts.html:139`, `contacts.html:140` | messenger: `telegram` / `whatsapp` |
| 17 | `social_click` |  | Ссылка на соцсеть в подвале или на thanks.html | `404.html:92`, `404.html:93`, `404.html:94`, `404.html:95`, `beans.html:188`, `beans.html:189` и ещё 34 | network: `instagram`, page_section: `footer` / `thanks` |
| 18 | `form_error` |  | Форма не отправлена: ошибка поля или приёмника | `js/form.js:105`, `js/form.js:119` | field_name: `phone`, error_type: `required` / `format` / `length` / `consent` / `server` |
| 19 | `map_open` | по выбору | Ссылка «Открыть в Яндекс Картах» | `menu.html:122` | map_service: `yandex_maps` |
| 20 | `gallery_view` | по выбору | Открытие фото в галерее | `index.html:232`, `index.html:235`, `index.html:238`, `index.html:241`, `index.html:244`, `index.html:247` | photo_index: `3` |

## Пользовательские параметры (Admin → Custom definitions, Event scope)

button_name, page_section, course_name, quiz_result, lead_course, bean_name, messenger.

## Ключевые события (Admin → Events → Key events)

generate_lead, contact_click, messenger_click — других ключевых нет.

## Что не отправляется

Имя, телефон и e-mail в GA4 не передаются: в событиях только курс, источник и номер блока. Номер заявки хранится в sessionStorage, а не в адресе страницы.
