# React 19 + Vite + TypeScript Scaffold

Каркас проекта с:

- React 19
- Vite
- TypeScript
- CSS Modules (БЭМ-нейминг)
- Radix UI Primitives
- Vitest + Testing Library
- ESLint 10 (Flat Config)
- Zustand
- Biome
- фирменная палитра в CSS-переменных (`src/styles/palette.css`)

## Запуск

```bash
npm install
npm run dev
```

## Полезные команды

```bash
npm run lint
npm run lint:fix
npm run format
npm run format:check
npm run check
npm run test
npm run build
```

## OAuth (Authorization Code + PKCE)

1. Скопируйте переменные окружения из примера:

```bash
cp .env.example .env
```

2. Укажите значения вашего OAuth-провайдера:

- `VITE_OAUTH_AUTHORIZE_URL` - authorize endpoint
- `VITE_OAUTH_TOKEN_URL` - token endpoint
- `VITE_OAUTH_CLIENT_ID` - публичный client id
- `VITE_OAUTH_REDIRECT_URI` - callback URL (например, `http://localhost:5173`)
- `VITE_OAUTH_SCOPE` - список scope через пробел

3. Добавьте `VITE_OAUTH_REDIRECT_URI` в список разрешённых redirect URI у провайдера.

После этого кнопка `Войти` запускает OAuth flow, а после callback приложение автоматически завершает обмен кода на токен и сохраняет сессию.
