# bolt-admin

Админка в стиле bolt.new: список проектов и редактор, где код запускается прямо в браузере через [WebContainer API](https://webcontainers.io). Построена на Angular 17.

Живая версия: https://ivanm696.github.io/bolt-admin/

## Возможности

- **Список проектов**: создание, открытие и удаление. Проекты хранятся в `localStorage` браузера и сохраняются после перезагрузки.
- **Редактор**: вкладки `index.js` и `package.json`, сохранение.
- **Запуск**: кнопка «Запустить» выполняет `npm install` (при первом запуске или после ручной установки) и `npm start`.
- **Терминал**: вывод npm и сервера в реальном времени.
- **Предпросмотр**: когда сервер поднимается, его страница открывается во вкладке.

Пример по умолчанию: Express-сервер, который отвечает JSON на `/`.

## Требования

- Node.js 20 или новее
- Современный браузер на Chromium (Chrome, Edge): WebContainer работает только в нём

## Установка и запуск

```bash
npm ci
npm start        # режим разработки: http://localhost:4200
```

Сборка продакшн-версии:

```bash
npx ng build --base-href /bolt-admin/
```

Результат лежит в `dist/`.

## Структура

```
app/
  app.module.ts               # маршруты (hash-роутинг), импорты
  app.component.*             # шапка и <router-outlet>
  projects-list.component.*   # список проектов
  project-editor.component.*  # редактор, запуск, терминал, предпросмотр
  project.model.ts            # модель проекта
  project.service.ts          # хранение проектов в localStorage
  webcontainer.service.ts     # boot WebContainer, запись файлов, запуск процессов
  webcontainer.config.ts      # публичный clientId для auth.init
public/
  coi-serviceworker.js       # service worker для cross-origin isolation (GitHub Pages)
.github/workflows/pages.yml  # сборка и деплой на GitHub Pages при пуше в main
```

## Деплой на GitHub Pages

1. В Settings → Pages выберите **Source: GitHub Actions**.
2. Каждый пуш в `main` запускает `.github/workflows/pages.yml`: `npm ci`, сборка с `--base-href /bolt-admin/` и публикация `dist/`.

## Важные детали

- **Изоляция страницы.** WebContainer требует `crossOriginIsolated`. GitHub Pages не даёт выставлять заголовки COOP/COEP, поэтому `public/coi-serviceworker.js` выставляет их через service worker. При первом открытии страница один раз перезагружается.
- **Авторизация WebContainer.** `auth.init` вызывается один раз при старте (`webcontainer.service.ts`). clientId публичный (OAuth с PKCE), секретов в проекте нет.
- **Разрешённые домены.** Если в консоли появляется ошибка «not available from this referrer», домен сайта нужно добавить в разрешённые у клиента WebContainer API.
- **Хранение.** Проекты лежат только в браузере текущего пользователя. Если localStorage недоступен, данные хранятся в памяти и пропадут после перезагрузки.
- **Hash-роутинг.** Адреса вида `#/projects/<id>`, потому что GitHub Pages не отдаёт прямые ссылки на вложенные пути.

## Ограничения

- Нет серверной части: все проекты и файлы живут в браузере.
- Для `npm install` нужен доступ в интернет и к реестру npm.
- В редакторе нет подсветки синтаксиса и автодополнения.

## Лицензия

Не указана.
