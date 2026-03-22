# 🚀 Telegram Комбайн — Полный Roadmap разработки

> **Версия документа:** 1.0  
> **Последнее обновление:** Март 2024

---

## 📋 Оглавление

1. [Описание проекта](#1-описание-проекта)
2. [Технологический стек](#2-технологический-стек)
3. [Архитектура](#3-архитектура)
4. [Модели данных](#4-модели-данных)
5. [API Endpoints](#5-api-endpoints)
6. [UI Компоненты](#6-ui-компоненты)
7. [План разработки](#7-план-разработки)
8. [Интеграции](#8-интеграции)
9. [Безопасность](#9-безопасность)
10. [Деплой](#10-деплой)

---

## 1. Описание проекта

### 1.1 Что это

**Telegram Комбайн** — многофункциональный инструмент для автоматизации работы с Telegram:
- Управление множеством аккаунтов через TData
- Парсинг групп и участников
- AI-комментирование
- Инвайты и рассылки
- Прогрев аккаунтов

### 1.2 Ключевые принципы

| Принцип | Описание |
|---------|----------|
| **TData Only** | Работа только через TData файлы, без api_id/api_hash |
| **Проекты** | Полная изоляция данных между проектами |
| **Мульти-аккаунт** | Все операции поддерживают несколько аккаунтов |
| **AI Integration** | LLM для генерации контента |

### 1.3 Целевая аудитория

- SMM-специалисты
- Арбитражники трафика
- Маркетологи
- Комьюнити-менеджеры

---

## 2. Технологический стек

### 2.1 Frontend

```
Next.js 16 (App Router)
├── TypeScript 5
├── Tailwind CSS 4
├── shadcn/ui (New York style)
├── Lucide Icons
├── Framer Motion (анимации)
└── SWR (state management)
```

### 2.2 Backend

```
Next.js API Routes
├── Prisma ORM
├── SQLite (база данных)
├── z-ai-web-dev-sdk (LLM)
└── Socket.io (real-time)
```

### 2.3 Telegram Integration

```
Python Backend (mini-service)
├── Pyrogram / Telethon
├── TData processing
├── Session management
└── WebSocket → Next.js
```

### 2.4 Инфраструктура

```
Docker
├── Next.js container
├── Python container
└── SQLite volume
```

---

## 3. Архитектура

### 3.1 Общая схема

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Next.js Frontend (Port 3000)            │    │
│  │  ├── UI Components (shadcn/ui)                      │    │
│  │  ├── Pages (App Router)                             │    │
│  │  └── SWR Data Fetching                              │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/WS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER                           │
│                                                              │
│  ┌──────────────────────┐    ┌──────────────────────┐       │
│  │   Next.js API        │    │   Python Service     │       │
│  │   (Port 3000)        │◄──►│   (Port 3003)        │       │
│  │                      │    │                      │       │
│  │  ├── REST API        │    │  ├── Pyrogram        │       │
│  │  ├── Prisma ORM      │    │  ├── TData Handler   │       │
│  │  └── WebSocket       │    │  └── Task Queue      │       │
│  └──────────────────────┘    └──────────────────────┘       │
│              │                          │                    │
│              ▼                          ▼                    │
│  ┌──────────────────────────────────────────────────┐       │
│  │              SQLite Database                      │       │
│  │  ├── Projects                                     │       │
│  │  ├── Accounts                                     │       │
│  │  ├── Databases                                    │       │
│  │  └── Tasks                                        │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ MTProto
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    TELEGRAM SERVERS                          │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Mini-service архитектура

```
mini-services/
└── telegram-service/
    ├── index.ts           # Entry point
    ├── package.json       # Dependencies
    ├── src/
    │   ├── client.ts      # Pyrogram client
    │   ├── handlers/      # Event handlers
    │   ├── tasks/         # Task processors
    │   └── utils/         # Helpers
    └── data/
        └── tdata/         # TData storage
```

### 3.3 WebSocket протокол

```typescript
// Events: Server → Client
{
  type: 'task:progress',
  taskId: string,
  progress: number,
  status: 'running' | 'completed' | 'error'
}

{
  type: 'account:status',
  accountId: string,
  status: 'online' | 'offline' | 'warming'
}

{
  type: 'log:new',
  level: 'info' | 'warn' | 'error',
  message: string
}

// Events: Client → Server
{
  type: 'task:start',
  taskId: string
}

{
  type: 'task:pause',
  taskId: string
}
```

---

## 4. Модели данных

### 4.1 Prisma Schema

```prisma
// ==================== PROJECTS ====================

model Project {
  id          String     @id @default(cuid())
  name        String
  description String?
  color       String     @default("#8B5CF6")
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  
  accounts    Account[]
  databases   Database[]
  tasks       Task[]
  campaigns   Campaign[]
}

// ==================== ACCOUNTS ====================

model Account {
  id             String   @id @default(cuid())
  phone          String
  name           String
  status         String   @default("OFFLINE") // ONLINE, OFFLINE, LIMITED, WARMING
  folder         String   @default("WORK")    // WORK, ADMINS, PERSONAL
  
  // TData
  tdataPath      String?
  sessionString  String?  // Извлечённая сессия
  
  // Proxy
  proxyType      String?  // socks5, socks4, http
  proxyHost      String?
  proxyPort      String?
  proxyUser      String?
  proxyPassword  String?
  
  // Stats
  messagesSent   Int      @default(0)
  invitesSent    Int      @default(0)
  commentsPosted Int      @default(0)
  lastActiveAt   DateTime?
  
  // Warmup
  warmupProgress Int?
  warmupDays     Int?
  trustScore     Int      @default(25)
  
  // Relations
  projectId      String
  project        Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@unique([projectId, phone])
}

// ==================== DATABASES (Parsed Data) ====================

model Database {
  id          String   @id @default(cuid())
  name        String
  source      String   // @channel_name or link
  type        String   // MEMBERS, GROUPS
  count       Int      @default(0)
  data        String?  // JSON array of parsed items
  
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// ==================== TASKS ====================

model Task {
  id          String   @id @default(cuid())
  name        String
  type        String   // PARSING, INVITING, MESSAGING, WARMUP, COMMENTING
  status      String   @default("PAUSED") // RUNNING, PAUSED, COMPLETED, ERROR
  
  // Progress
  progress    Int      @default(0)
  target      Int      @default(0)
  completed   Int      @default(0)
  speed       String?
  eta         String?
  
  // Config (JSON)
  config      String?
  
  // Error
  error       String?
  
  // Relations
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  accountId   String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// ==================== CAMPAIGNS ====================

model Campaign {
  id          String   @id @default(cuid())
  name        String
  type        String   // COMMENTING, MESSAGING, INVITING
  
  // Settings (JSON)
  settings    String   // Channel IDs, account IDs, templates, etc.
  
  // AI Settings
  useAI       Boolean  @default(true)
  style       String?  // supportive, questioning, opinion, humor, provocative, expert
  emotion     String?  // neutral, positive, enthusiastic, curious, skeptical
  
  // Stats
  total       Int      @default(0)
  completed   Int      @default(0)
  errors      Int      @default(0)
  
  status      String   @default("DRAFT") // DRAFT, RUNNING, PAUSED, COMPLETED
  
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// ==================== SETTINGS ====================

model Settings {
  id                  String   @id @default(cuid())
  
  // Limits
  maxMessagesPerDay   Int      @default(500)
  maxInvitesPerDay    Int      @default(50)
  maxCommentsPerDay   Int      @default(30)
  actionDelay         Int      @default(30)  // seconds
  
  // Auto-start
  autoStartTasks      Boolean  @default(true)
  notifications       Boolean  @default(true)
  
  updatedAt           DateTime @updatedAt
}

// ==================== ACTIVITY LOG ====================

model ActivityLog {
  id          String   @id @default(cuid())
  type        String   // success, info, warning, error
  message     String
  projectId   String?
  accountId   String?
  taskId      String?
  
  createdAt   DateTime @default(now())
}
```

---

## 5. API Endpoints

### 5.1 Projects

```
GET    /api/projects              # Список проектов
POST   /api/projects              # Создать проект
GET    /api/projects/:id          # Получить проект
PUT    /api/projects/:id          # Обновить проект
DELETE /api/projects/:id          # Удалить проект
```

### 5.2 Accounts

```
GET    /api/accounts?projectId=X  # Список аккаунтов проекта
POST   /api/accounts              # Создать аккаунт (загрузка TData)
GET    /api/accounts/:id          # Получить аккаунт
PUT    /api/accounts/:id          # Обновить аккаунт
DELETE /api/accounts/:id          # Удалить аккаунт
POST   /api/accounts/:id/connect  # Подключить аккаунт
POST   /api/accounts/:id/disconnect # Отключить аккаунт
GET    /api/accounts/:id/status   # Статус аккаунта
```

### 5.3 Databases

```
GET    /api/databases?projectId=X # Список баз проекта
POST   /api/databases             # Создать базу
GET    /api/databases/:id         # Получить базу
DELETE /api/databases/:id         # Удалить базу
GET    /api/databases/:id/export  # Экспорт базы (CSV/JSON)
```

### 5.4 Tasks

```
GET    /api/tasks?projectId=X     # Список задач проекта
POST   /api/tasks                 # Создать задачу
GET    /api/tasks/:id             # Получить задачу
PUT    /api/tasks/:id             # Обновить задачу
DELETE /api/tasks/:id             # Удалить задачу
POST   /api/tasks/:id/start       # Запустить задачу
POST   /api/tasks/:id/pause       # Пауза задачи
POST   /api/tasks/:id/stop        # Остановить задачу
```

### 5.5 Campaigns

```
GET    /api/campaigns?projectId=X # Список кампаний
POST   /api/campaigns             # Создать кампанию
GET    /api/campaigns/:id         # Получить кампанию
PUT    /api/campaigns/:id         # Обновить кампанию
DELETE /api/campaigns/:id         # Удалить кампанию
POST   /api/campaigns/:id/start   # Запустить кампанию
POST   /api/campaigns/:id/pause   # Пауза кампании
```

### 5.6 AI Generation

```
POST   /api/ai/generate-comment   # Генерация комментария
POST   /api/ai/generate-message   # Генерация сообщения
POST   /api/ai/analyze-post       # Анализ поста
```

### 5.7 Parsing

```
POST   /api/parsing/groups        # Поиск групп
POST   /api/parsing/members       # Парсинг участников
GET    /api/parsing/status/:id    # Статус парсинга
```

### 5.8 Telegram Service

```
POST   /api/telegram/upload-tdata # Загрузка TData
POST   /api/telegram/connect      # Подключение аккаунта
POST   /api/telegram/disconnect   # Отключение
GET    /api/telegram/status/:id   # Статус подключения
```

---

## 6. UI Компоненты

### 6.1 Layout

```
src/app/
├── layout.tsx              # Root layout with providers
├── page.tsx                # Main app (single page)
└── globals.css             # Global styles

src/components/
├── ui/                     # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   └── ...
└── layout/
    ├── sidebar.tsx         # Navigation sidebar
    ├── header.tsx          # Top header
    └── footer.tsx          # Status footer
```

### 6.2 Pages (Sections)

```
Дашборд
├── Stats cards (accounts, tasks, databases)
├── Active tasks list
├── Recent activity
└── Quick actions

Аккаунты
├── Folder sections (WORK, ADMINS, PERSONAL)
├── Account cards with status
├── Add account dialog (TData upload)
└── Account details dialog

Прогрев
├── Active warmup sessions
├── Available accounts list
├── Preset selection
├── Activity configuration
├── Schedule builder
└── Trust score visualization

Парсинг групп
├── Filter panel
│   ├── Keywords
│   ├── Members range
│   ├── Type/Language/Activity
│   └── Custom filters
├── Preset buttons
├── Results list
└── Export functionality

Парсинг участников
├── Target channel input
├── Filter options
├── Progress display
└── Saved databases list

Инвайты
├── Campaign list
├── Create campaign wizard
│   ├── Select accounts
│   ├── Select target group
│   ├── Select database
│   └── Configure limits
└── Progress tracking

Комментинг
├── Campaign list
├── Create campaign
│   ├── Select channels
│   ├── Select accounts
│   ├── AI style selection
│   ├── Emotion selection
│   └── Pattern selection
├── Preview generated comments
└── Real-time progress

Рассылки
├── Campaign list
├── Create campaign
│   ├── Template builder
│   ├── Variables {name}, {username}
│   ├── Account selection
│   └── Database selection
└── Progress tracking

Аналитика
├── Overview charts
├── Account statistics
├── Task performance
├── Export reports
└── Date range selector

Настройки
├── Global limits
├── Default proxy
├── Notifications
├── Data management
└── About
```

### 6.3 Key Components

```tsx
// Project Selector
<ProjectSelector 
  projects={projects}
  currentProject={currentProject}
  onSelect={setCurrentProject}
  onCreate={createProject}
/>

// Account Card
<AccountCard 
  account={account}
  status={status}
  onEdit={openEditDialog}
  onConnect={connectAccount}
/>

// Task Progress
<TaskProgress 
  task={task}
  onPause={pauseTask}
  onStop={stopTask}
/>

// Filter Builder
<FilterBuilder 
  filters={filters}
  onChange={setFilters}
  presets={presets}
/>

// TData Uploader
<TDataUploader 
  onUpload={handleUpload}
  onProgress={setProgress}
/>
```

---

## 7. План разработки

### Фаза 1: Фундамент (День 1-2)

```
□ Инициализация Next.js 16 проекта
□ Настройка TypeScript + Tailwind CSS
□ Установка shadcn/ui компонентов
□ Настройка Prisma + SQLite
□ Создание базовых моделей
□ Настройка структуры папок
□ Git репозиторий
```

### Фаза 2: Проекты и Аккаунты (День 3-5)

```
□ UI переключения проектов
□ API CRUD для проектов
□ UI списка аккаунтов
□ UI добавления аккаунта
□ Загрузка TData файлов
□ Drag & drop функционал
□ API CRUD для аккаунтов
□ Настройки прокси
```

### Фаза 3: Backend Infrastructure (День 6-8)

```
□ Создание Python mini-service
□ Интеграция Pyrogram
□ Обработка TData файлов
□ Извлечение session_string
□ WebSocket сервер
□ Очередь задач
□ Логирование
```

### Фаза 4: Парсинг (День 9-12)

```
□ UI фильтров для групп
□ API поиска групп
□ Backend: подключение к Telegram
□ Backend: поиск по ключевым словам
□ Backend: применение фильтров
□ UI результатов поиска
□ UI парсинга участников
□ Backend: парсинг участников группы
□ Сохранение результатов в базу
```

### Фаза 5: AI Комментинг (День 13-16)

```
□ UI создания кампании
□ UI стилей комментариев
□ UI паттернов дискуссии
□ Интеграция LLM Skill
□ Промпты для генерации
□ Backend: генерация комментариев
□ Backend: постинг комментариев
□ Мульти-аккаунт логика
□ Триггеры по ключевым словам
```

### Фаза 6: Прогрев (День 17-19)

```
□ UI пресетов прогрева
□ UI настроек активностей
□ UI расписания
□ Backend: выполнение активностей
□ Backend: просмотр постов
□ Backend: реакции
□ Backend: сохранения
□ Backend: расчёт Trust Score
□ WebSocket: реальное время
```

### Фаза 7: Инвайты и Рассылки (День 20-23)

```
□ UI инвайт-кампаний
□ Backend: отправка инвайтов
□ Лимиты и задержки
□ Обработка Flood Wait
□ UI рассылок
□ Шаблоны сообщений
□ Переменные
□ Backend: отправка сообщений
□ Очередь сообщений
```

### Фаза 8: Аналитика (День 24-25)

```
□ UI дашборда аналитики
□ Графики Chart.js / Recharts
□ Статистика по аккаунтам
□ Статистика по задачам
□ Экспорт отчётов
```

### Фаза 9: Полировка (День 26-28)

```
□ Настройки приложения
□ Обработка ошибок
□ Loading states
□ Уведомления (toast)
□ Responsive design
□ Accessibility
□ Тестирование
□ Документация
```

### Фаза 10: Деплой (День 29-30)

```
□ Dockerfile
□ docker-compose.yml
□ Environment variables
□ CI/CD pipeline
□ Мониторинг
□ Бэкапы
□ Финальное тестирование
```

---

## 8. Интеграции

### 8.1 LLM (z-ai-web-dev-sdk)

```typescript
// Генерация комментария
const response = await fetch('/api/ai/generate-comment', {
  method: 'POST',
  body: JSON.stringify({
    postContent: '...',
    style: 'supportive',
    emotion: 'positive',
    accountName: 'User123'
  })
})

const { comment } = await response.json()
```

### 8.2 Telegram (Pyrogram)

```python
# Подключение через TData
from pyrogram import Client
from pyrogram.session import Session

# Извлечение session из TData
def extract_session(tdata_path: str) -> str:
    # Parse tdata files
    # Return session_string
    pass

# Создание клиента
app = Client(
    name="account",
    session_string=session_string,
    proxy=proxy_config
)

# Отправка сообщения
await app.send_message(chat_id, message)

# Отправка реакции
await app.send_reaction(chat_id, message_id, "👍")
```

### 8.3 WebSocket Events

```typescript
// Frontend
const socket = io('/?XTransformPort=3003')

socket.on('task:progress', (data) => {
  updateTaskProgress(data.taskId, data.progress)
})

socket.on('account:status', (data) => {
  updateAccountStatus(data.accountId, data.status)
})

// Backend (Python)
socket.emit('task:progress', {
  taskId: 'xxx',
  progress: 45,
  status: 'running'
})
```

---

## 9. Безопасность

### 9.1 TData Protection

```
□ Шифрование TData файлов на диске
□ Шифрование session_string в базе
□ Безопасное хранение прокси-данных
□ Очистка памяти после использования
```

### 9.2 API Security

```
□ Rate limiting
□ Input validation
□ SQL injection prevention (Prisma)
□ XSS prevention
□ CORS configuration
```

### 9.3 Telegram Limits

```
□ Соблюдение лимитов Telegram
□ Случайные задержки
□ Flood Wait обработка
□ Авто-пауза при ошибках
□ Логирование всех действий
```

---

## 10. Деплой

### 10.1 Dockerfile

```dockerfile
# Frontend
FROM node:20-alpine AS frontend
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Python Service
FROM python:3.11-alpine AS backend
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY ./mini-services ./mini-services

# Final
FROM node:20-alpine
# ... combined setup
```

### 10.2 docker-compose.yml

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
      - ./tdata:/app/tdata
    environment:
      - DATABASE_URL=file:/app/data/custom.db
      - LLM_API_KEY=${LLM_API_KEY}
  
  telegram-service:
    build: 
      context: .
      dockerfile: Dockerfile.telegram
    ports:
      - "3003:3003"
    volumes:
      - ./tdata:/app/tdata
```

### 10.3 Environment Variables

```env
# Database
DATABASE_URL=file:./db/custom.db

# LLM
LLM_API_KEY=your_key

# Telegram Service
TELEGRAM_SERVICE_PORT=3003

# Security
ENCRYPTION_KEY=your_encryption_key
```

---

## 📊 Оценка времени

| Фаза | Длительность | Сложность |
|------|--------------|-----------|
| Фаза 1: Фундамент | 2 дня | ⭐⭐ |
| Фаза 2: Проекты и Аккаунты | 3 дня | ⭐⭐ |
| Фаза 3: Backend Infrastructure | 3 дня | ⭐⭐⭐⭐ |
| Фаза 4: Парсинг | 4 дня | ⭐⭐⭐ |
| Фаза 5: AI Комментинг | 4 дня | ⭐⭐⭐⭐ |
| Фаза 6: Прогрев | 3 дня | ⭐⭐⭐ |
| Фаза 7: Инвайты и Рассылки | 4 дня | ⭐⭐⭐ |
| Фаза 8: Аналитика | 2 дня | ⭐⭐ |
| Фаза 9: Полировка | 3 дня | ⭐⭐ |
| Фаза 10: Деплой | 2 дня | ⭐⭐ |
| **ИТОГО** | **30 дней** | |

---

## 📝 Примечания

### TData формат

```
tdata/
├── D877F783D5D3EF8C/     # user_id в hex
│   ├── map0               # метаданные
│   ├── map1               
│   └── s0                 # auth_key + данные сессии
├── usertag                # тег пользователя
└── secure_...             # защищённые данные
```

### Telegram ограничения

| Действие | Лимит | Период |
|----------|-------|--------|
| Сообщения | ~30 | в минуту |
| Инвайты | ~50 | в день |
| Добавление контактов | ~50 | в день |
| Вступление в группы | ~5-10 | в день |
| Реакции | ~100 | в минуту |

### Рекомендуемые задержки

```typescript
const DELAYS = {
  messages: { min: 30, max: 120 },    // секунды
  invites: { min: 60, max: 300 },
  reactions: { min: 5, max: 30 },
  comments: { min: 60, max: 180 },
}
```

---

## 🔗 Полезные ссылки

- [Telegram API Docs](https://core.telegram.org/api)
- [Pyrogram Docs](https://docs.pyrogram.org/)
- [Telethon Docs](https://docs.telethon.dev/)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [shadcn/ui](https://ui.shadcn.com/)

---

*Документ создан для проекта Telegram Комбайн*
