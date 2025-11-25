# Week 8 Assignment

**Логин:** `c5803a15-0cfc-4719-ab77-c604044c9c5a`

## Деплой на Render.com

1. Зарегистрируйтесь на [render.com](https://render.com)
2. Создайте новый **Web Service**
3. Подключите GitHub репозиторий или загрузите код
4. Настройки деплоя:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Нажмите **Create Web Service**
6. Render автоматически предоставит HTTPS

После деплоя приложение будет доступно по адресу: `https://your-app.onrender.com`

## Локальное тестирование

```bash
npm install
npm start
```

Приложение запустится на `http://localhost:3000`

## Маршруты

### 1. GET /login/
Возвращает логин в виде текста.

**Пример:**
```bash
curl https://your-app.onrender.com/login/
```

**Ответ:**
```
c5803a15-0cfc-4719-ab77-c604044c9c5a
```

### 2. POST /render/
Принимает JSON с `random2` и `random3`, загружает pug-шаблон по URL из параметра `addr`, рендерит и возвращает HTML.

**Пример:**
```bash
curl -H 'Content-Type: application/json' \
  'https://your-app.onrender.com/render/?addr=http://kodaktor.ru/j/unsafe_0ebdb' \
  -d '{"random2":"0.4433","random3":"0.1199"}'
```

### 3. GET /wordpress/
Возвращает мок WordPress с постом (ID=1, title=логин).

**Примеры:**
```bash
# Главная страница
curl https://your-app.onrender.com/wordpress/

# REST API - получить пост с ID=1
curl https://your-app.onrender.com/wordpress/wp-json/wp/v2/posts/1
```

**REST API ответ:**
```json
{
  "id": 1,
  "title": {"rendered": "c5803a15-0cfc-4719-ab77-c604044c9c5a"},
  "content": {"rendered": "<p>Post with login c5803a15-0cfc-4719-ab77-c604044c9c5a</p>"},
  "status": "publish"
}
```

## Структура проекта

```
.
├── app.js          # Основная логика приложения
├── index.js        # Точка входа
├── package.json    # Зависимости
└── README.md       # Документация
```

Минимальная конфигурация — только 4 файла!

