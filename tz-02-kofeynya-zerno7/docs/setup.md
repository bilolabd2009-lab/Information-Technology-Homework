# Пошаговая инструкция: что сделать в своих аккаунтах

Код сайта, приёмник, реестр и документы уже готовы. Ниже — то, что можно сделать только в ваших аккаунтах (GitHub, Vercel, Google, соцсети, ManyChat, DataLens). Порядок совпадает с этапами раздела 9 ТЗ.

Каждый раз, когда меняете файлы, делайте коммит с понятным сообщением — в ТЗ нужно не меньше 10 коммитов (сейчас их уже больше).

---

## 0. Что заменить в коде

Ищите по всему проекту (VS Code: `Ctrl+Shift+H` — «Заменить в файлах»):

| Найти | Заменить на | Где |
|---|---|---|
| `G-XXXXXXXXXX` | идентификатор вашего ресурса GA4 (шаг 2) | все 9 HTML-файлов |
| `ВСТАВЬТЕ_ID_РАЗВЁРТЫВАНИЯ` — целиком строку `https://script.google.com/macros/s/ВСТАВЬТЕ_ID_РАЗВЁРТЫВАНИЯ/exec` | URL веб-приложения Apps Script (шаг 3) | `js/form.js` |
| `ВСТАВЬТЕ_ID_ТАБЛИЦЫ` | ID таблицы «Zerno7 — Leads» | `apps-script/Code.gs` (в редакторе Apps Script) |
| `https://www.instagram.com/zerno7_coffee/`, `https://vk.com/zerno7_coffee`, `https://t.me/zerno7_coffee`, `https://www.youtube.com/@zerno7_coffee` | адреса созданных вами аккаунтов | подвал всех страниц, thanks.html |
| `https://tz-02-kofeynya-zerno7.vercel.app` | ваш адрес на Vercel, если он другой | все HTML (canonical, og:url, og:image), `docs/utm.csv` |
| `blogger1_nick`, `blogger2_nick` | ники двух однокурсников латиницей | `docs/utm.csv`, лист `utm` |

Если адрес Vercel получился другим, пересоздайте QR-код и афишу: `python3 tools/make_files.py <папка репозитория> https://ваш-адрес.vercel.app` (папка `tools` лежит в архиве рядом с репозиторием; нужен Python с `pip install qrcode reportlab pillow`). Без Python — сделайте QR полной ссылки U-12 в любом генераторе QR и сохраните как `docs/qr-u-12.png`.

---

## 1. Этап «Сайт» (день 4): GitHub и Vercel

1. На github.com → **New repository** → имя `tz-02-kofeynya-zerno7`, **Public**, без README и .gitignore → Create.
2. В папке репозитория (в нём уже есть история коммитов):
   ```bash
   git remote add origin https://github.com/<ваш-логин>/tz-02-kofeynya-zerno7.git
   git push -u origin main
   ```
   Если хотите, чтобы коммиты были от вашего имени: `git config user.name "Фамилия Имя"` и `git config user.email "почта@github"` — для следующих коммитов.
3. vercel.com → войти через GitHub → **Add New → Project** → импортировать `tz-02-kofeynya-zerno7`. Framework Preset: **Other**, Build Command — пусто, Output Directory — пусто (корень). **Deploy**.
4. Адрес вида `tz-02-kofeynya-zerno7.vercel.app` впишите в `README.md`. Каждый `git push` в `main` теперь обновляет сайт сам.
5. Lighthouse: Chrome → открыть главную на Vercel → F12 → вкладка **Lighthouse** → Mode: Navigation, Device: **Mobile**, категории Performance, Accessibility, SEO → Analyze. Снимок отчёта → `screens/lighthouse/index-mobile.png`. Нужно: Performance ≥ 70, Accessibility ≥ 90, SEO ≥ 90.

---

## 2. Этап «Аналитика» (день 8): GA4

1. analytics.google.com → **Admin → Create → Property**: название `ЗЕРНО 7 — сайт`, часовой пояс **(GMT+03:00) Moscow**, валюта **Russian Ruble (RUB)**.
2. **Data streams → Web**: URL сайта на Vercel, имя потока «Сайт Vercel». В **Enhanced measurement** включено всё, в том числе **Form interactions** и **File downloads**.
3. Скопируйте **Measurement ID** `G-…` и замените `G-XXXXXXXXXX` во всех 9 HTML-файлах (шаг 0). Коммит, push.
4. **Admin → Custom definitions → Create custom dimension**, Scope: **Event**, 7 штук: `button_name`, `page_section`, `course_name`, `quiz_result`, `lead_course`, `bean_name`, `messenger`. Dimension name и Event parameter — одинаковые.
5. **Admin → Events** (или **Key events → New key event**): отметьте ключевыми `generate_lead`, `contact_click`, `messenger_click`. Больше ничего ключевым не отмечайте; если GA4 сам отметил `purchase` или другое — снимите.
6. **DebugView:** установите расширение Chrome **Google Analytics Debugger**, включите его, откройте сайт. **Admin → DebugView**. Вызовите по очереди все 20 событий (таблица — `docs/events.md`), раскройте параметры и сохраните снимок в `screens/ga4/<имя_события>.png`, например `screens/ga4/view_course.png`.
   - Если `form_submit` не приходит, поставьте `MANUAL_FORM_SUBMIT = true` в `js/analytics.js`.
   - `generate_lead` придёт только после шага 3 (приёмник).
7. Доступ Заказчику: **Admin → Property access management → + → Add users** → e-mail Заказчика, роль **Viewer**. Впишите e-mail в README.

---

## 3. Этап «Заявки» (день 11): Google Таблица и Apps Script

1. Google Таблицы → новая таблица, название **Zerno7 — Leads**. ID — часть адреса между `/d/` и `/edit`.
2. **Расширения → Apps Script** → вставьте весь `apps-script/Code.gs`, впишите `SPREADSHEET_ID`, сохраните.
3. Выберите функцию **setupSheet** → **Выполнить** → разрешите доступ. Появится лист `leads` с заголовками, выпадающими списками (course, start_month, status) и подсветкой: пустые обязательные ячейки — жёлтым, повторный `request_id` — красным.
4. Проверка из редактора: функция **testDoPost** → Выполнить. В журнале первый ответ `{"ok":true…}`, второй — `duplicate_request_id`. Тестовую строку удалите.
5. **Развернуть → Новое развёртывание → Тип: Веб-приложение**. Выполнять как: **я**; У кого есть доступ: **все**. Скопируйте URL `…/exec` и вставьте в `js/form.js` вместо заглушки. Коммит, push.
   - После любых правок кода: **Развернуть → Управление развёртываниями → карандаш → Версия: новая** — URL останется тем же.
6. Отправьте заявку с сайта: через 1–2 секунды должна появиться строка с метками и статусом `new`, вы попадёте на thanks.html с номером заявки.
7. **Настройки доступа** таблицы: e-mail Заказчика → **Читатель**.
8. Статусы: одну тестовую заявку проведите `new → contacted → prepaid → paid`, другую закройте `lost`.

### Лист `utm` (реестр ссылок)

1. В той же таблице: **Файл → Импорт → Загрузить** `docs/utm.csv` → **Вставить новый лист**, переименуйте лист в `utm`.
2. В ячейку `P1` впишите адрес сайта без слэша в конце, например `https://tz-02-kofeynya-zerno7.vercel.app`.
3. В `J2` (полная ссылка) вставьте формулу и протяните до `J13`:
   ```
   =СЦЕПИТЬ($P$1;"/";I2;"?utm_source=";D2;"&utm_medium=";E2;"&utm_campaign=";F2;"&utm_content=";G2;"&utm_term=";H2)
   ```
   Ссылки вручную не набираются — только формулой.
4. Короткие ссылки для ВКонтакте и Telegram (U-05…U-08): vk.com/cc или clck.ru. Откройте короткую ссылку — в адресной строке должны остаться все пять меток; снимок → `screens/utm/short-u-05.png` и т. д.
5. По мере публикаций заполняйте «адрес публикации» и «дату публикации». В конце: **Файл → Скачать → CSV** → замените `docs/utm.csv`.

---

## 4. Этап «Каналы» (день 15): соцсети и ManyChat

1. Создайте от имени кофейни (не личные страницы): профессиональный аккаунт Instagram (Автор или Бизнес), сообщество ВКонтакте (+ товар «Курс бариста» в разделе «Товары»), Telegram-канал, YouTube-канал. Если какая-то соцсеть недоступна — замените на Дзен, TikTok или Pinterest и укажите замену в реестре.
2. Сначала внесите ссылку в реестр, затем публикуйте. Готовые тексты публикаций — `docs/posts.md`.
3. Два однокурсника публикуют ваши ссылки U-10 и U-11 у себя и переходят по ним. Их ники — в `utm_source`.
4. **Проверка каждой ссылки (5.5):** открыть публикацию в инкогнито или с другого телефона → нажать ссылку → снимок адресной строки с метками (`screens/utm/u-01.png`…) → GA4 **Reports → Realtime**: карточка Session source показывает ваш `utm_source` → для U-01, U-05, U-07, U-09, U-10, U-11, U-12 отправить заявку с именем «Тест U-05» и т. п.
5. Через 24–48 часов: **Reports → Acquisition → Traffic acquisition**, группировка Session source / medium — не меньше 6 разных пар. Снимок → `screens/utm/traffic-acquisition.png`.

### ManyChat (раздел 7)

1. manychat.com → войти через Facebook → подключить Instagram (профессиональный аккаунт). Опубликуйте Reel «Сердце на капучино за 30 секунд».
2. **Automation → New Automation**, имя `IG · Barista Dec 2026 · Latte Reel`.
3. Триггер **Instagram → User comments on your Post or Reel → Specific Post or Reel** → выбрать Reel → **Keywords: ЛАТТЕ**.
4. **Reply to comment** — включить, три варианта (ManyChat выберет случайный):
   - Отправили гид в личные сообщения ☕
   - Проверьте директ — там пошаговый гид
   - Готово! Гид и промокод уже в сообщениях
5. **Send DM:** «Привет! Это «Зерно 7». Держите пошаговый гид: как нарисовать сердце на капучино дома. Внутри промокод на курс латте-арта.» + кнопка **Открыть гид** → URL — полная ссылка U-02 из реестра.
6. Вторая ветка (новый триггер в той же автоматизации или вторая автоматизация на тот же Reel): ключевое слово **ЗЕРНО** → сообщение «Зерно, на котором мы снимали это видео, и ещё 5 сортов нашей обжарки — по кнопке ниже.» + кнопка **Выбрать зерно** → ссылка U-03.
7. **Set Live**. Со второго аккаунта Instagram напишите комментарии `ЛАТТЕ` и `ЗЕРНО` с паузой не меньше 2 минут. Снимки каждого шага → `screens/instagram/`. Сообщение может прийти в папку «Запросы».
8. Нажмите кнопку в сообщении → отправьте заявку → в таблице `utm_source=instagram` и нужный `utm_content`, в Realtime — `generate_lead`.

---

## 5. Этап «Отчёты» (день 19)

Период во всех отчётах — **Custom**: от первой проверки до дня сдачи. Снимки — в `screens/reports/` и `screens/explore/` под именами из ТЗ (8.1).

**Reports (8.1):** snapshot с Compare → Preceding period; User acquisition (First user source / medium); Traffic acquisition (Session source / medium + Secondary dimension Session campaign, второй снимок — Session manual ad content); Engagement → Landing page + Session source; Pages and screens; Events (5 событий); Key events с разбивкой; Tech → Device category. Два сравнения в Traffic acquisition (`Session source exactly matches instagram` и `(direct)`) → `comparison.png`. **Share this report → Download file → CSV** → `docs/reports/traffic-acquisition.csv`.

**Library:** Reports → Library → Create new collection «ЗЕРНО 7» → Create new report → Create detail report «Кампания barista_dec_2026» (Dimensions: Session source / medium, Session campaign, Session manual ad content; Metrics: Sessions, Engagement rate, Key events) → добавить в коллекцию → **Publish**. Снимок `library.png`.

**Explore (8.2):** названия начинаются с «ЗЕРНО 7 ·». Сегменты: Session segment «Instagram Sessions» (Session source exactly matches instagram) и «Direct Sessions» (Session source exactly matches (direct)). Исследования: Свободная форма (+ вторая вкладка с сегментами), Воронка 5 шагов (Open → копия Closed → Breakdown Session source → третья вкладка Device category, сегменты), Воронка со временем (form_start within 10 minutes после cta_click), Путь (Starting point: page latte-guide.html, 3 шага по Page title), Обратный путь (Ending point: generate_lead, 3 шага по Event name). На каждом снимке виден значок качества данных справа вверху. Таблицу свободной формы: **Export → CSV** → `docs/reports/free-form.csv`.

**Атрибуция и оповещение (8.3):** Admin → **Attribution settings** — запишите модель и окно в записку. Home → Insights → **Create** custom insight: ежедневно, сегмент Session source = instagram, Sessions decreased by more than 50 %, e-mail — ваш. Снимок `custom-insight.png`.

**DataLens (8.4):** datalens.yandex.ru (вход Яндекс ID).
1. Из свободной формы выгрузите данные в Google Таблицу «Zerno7 — Leads» на листы `ga4_traffic` (дата, source, medium, campaign, content, сеансы, активные пользователи) и `ga4_leads` (дата, source, campaign, generate_lead). Удалите служебные строки и строку «Общий итог». Значения `(direct)` → `direct`, `(not set)` → `not_set`, `(none)` → `none` (так их пишет форма).
2. **Подключения → Google Sheets** → эта таблица. **Датасеты:** GA4 (ga4_traffic + ga4_leads, связь по дате, source, campaign) и Заявки (лист `leads`). В датасете заявок поля `name`, `phone`, `email` удалите или скройте.
3. **Дашборд «ЗЕРНО 7 — barista_dec_2026»**, 3 вкладки:
   - **Трафик:** индикаторы «Сеансы», «Активные пользователи», «generate_lead»; линия сеансов по дням; таблица источников и кампаний; селекторы периода и источника.
   - **Заявки:** индикаторы «Всего заявок» (COUNTD(request_id)), «Новые» (статус new), «Оплатил курс» (статус paid); столбчатая по статусам; заявки по источникам и по дням; селектор статуса.
   - **Кампании:** таблица: сеансы и generate_lead из GA4, заявки из таблицы, заявки в статусе paid — связь только по source, campaign и дате.
   На каждой вкладке закрепите селектор периода и проверьте, что он меняет все виджеты (настройки связей).
4. Доступ к воркбуку: роль **Просмотр** для Заказчика, публичную ссылку не создавать. Снимки вкладок → `screens/datalens/`.

Затем заполните `docs/report.md` числами из отчётов.

---

## 6. Сдача (день 21)

- Отладка выключена: в `gtag('config', …)` нет `debug_mode: true` (в этом коде его нет — режим отладки включается расширением).
- `README.md` заполнен: все ссылки, `G-…`, e-mail Заказчика, строки «Не получилось» и «Нейросеть использовалась для».
- Все снимки на месте (`screens/…`), `docs/utm.csv` и `docs/report.md` актуальны.
- Подготовка к испытаниям — `docs/acceptance.md`.
