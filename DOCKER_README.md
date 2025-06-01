# 🐳 Doc Scrapper Docker Deployment

Цей документ описує як запустити Doc Scrapper у Docker з фронтендом на HTTPS (порт 443).

## 🏗️ Архітектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │    Web App      │    │    RAG API      │    │    ChromaDB     │
│   Port: 443     │◄──►│   Port: 3000    │◄──►│   Port: 8001    │◄──►│   Port: 8000    │
│  (HTTPS/SSL)    │    │   (Next.js)     │    │   (Express)     │    │ (Vector Store)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Компоненти системи:

1. **Nginx** (443/80) - Reverse proxy з SSL термінацією
2. **Web App** (3000) - Next.js фронтенд додаток
3. **RAG API** (8001) - Express.js API для AI запитів
4. **ChromaDB** (8000) - Векторна база даних

## 🚀 Швидкий старт

### 1. Налаштування

```bash
# Клонування та перехід в директорію
cd doc_scrapper

# Копіювання конфігурації
cp docker.env docker.env.local

# Редагування конфігурації (встановити OPENAI_API_KEY)
nano docker.env.local
```

### 2. Встановити OpenAI API Key

```bash
# В файлі docker.env замініть:
OPENAI_API_KEY=your_openai_api_key_here
# На ваш реальний ключ:
OPENAI_API_KEY=sk-...
```

### 3. Запуск системи

```bash
# Зробити скрипти виконуваними
chmod +x docker-start.sh docker-stop.sh

# Запустити всі сервіси
./docker-start.sh
```

### 4. Доступ до додатка

Відкрийте браузер та перейдіть на:
- **Головна сторінка**: https://localhost
- **HTTP** автоматично перенаправляє на HTTPS

## 📋 Доступні команди

### Основні команди
```bash
# Запуск з пересбіркою
./docker-start.sh --build

# Зупинка сервісів
./docker-stop.sh

# Зупинка з очищенням
./docker-stop.sh --clean

# Перегляд логів
docker-compose --env-file=docker.env logs -f

# Перегляд статусу
docker-compose --env-file=docker.env ps
```

### Docker Compose команди
```bash
# Запуск в background
docker-compose --env-file=docker.env up -d

# Запуск з пересбіркою
docker-compose --env-file=docker.env up --build -d

# Зупинка
docker-compose --env-file=docker.env down

# Перегляд логів конкретного сервісу
docker-compose --env-file=docker.env logs -f web-app
docker-compose --env-file=docker.env logs -f rag-api
docker-compose --env-file=docker.env logs -f chromadb
docker-compose --env-file=docker.env logs -f nginx
```

## 🔧 Конфігурація

### Environment Variables (docker.env)

#### Required (Обов'язкові)
```bash
OPENAI_API_KEY=sk-...              # Ваш OpenAI API ключ
```

#### Optional (Опціональні)
```bash
# RAG Configuration
RAG_LLM_MODEL=gpt-4o-mini          # Модель для генерації відповідей
RAG_EMBEDDING_MODEL=text-embedding-3-small  # Модель для embeddings

# SSL Configuration  
SSL_COUNTRY=UA
SSL_STATE=Ukraine
SSL_CITY=Kyiv
SSL_ORGANIZATION=DocScrapper
SSL_COMMON_NAME=localhost

# Performance
DOCKER_MEMORY_LIMIT=2g
DOCKER_CPU_LIMIT=1.0
```

### Порти та URL

| Сервіс | Внутрішній порт | Зовнішній порт | URL |
|--------|-----------------|----------------|-----|
| Nginx | 80, 443 | 80, 443 | https://localhost |
| Web App | 3000 | - | (через Nginx) |
| RAG API | 8001 | - | https://localhost/rag-api |
| ChromaDB | 8000 | - | https://localhost/chromadb |

### Volumes та Data Persistence

```yaml
volumes:
  chroma_data:          # ChromaDB векторна база даних
  ./scraped-docs:       # Скрапнуті документи
```

Дані зберігаються навіть після зупинки контейнерів.

## 🔒 SSL та безпека

### Автоматичні SSL сертифікати
Docker автоматично генерує self-signed SSL сертифікати для development:

```bash
# Сертифікати створюються в:
docker/nginx/ssl/nginx.crt
docker/nginx/ssl/nginx.key
```

### Production SSL
Для production використовуйте реальні SSL сертифікати:

```bash
# Замініть файли в docker/nginx/ssl/:
cp your-domain.crt docker/nginx/ssl/nginx.crt
cp your-domain.key docker/nginx/ssl/nginx.key

# Оновіть nginx конфігурацію з правильним server_name
nano docker/nginx/conf.d/default.conf
```

### Security Headers
Nginx автоматично додає security headers:
- HSTS (Strict-Transport-Security)
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Content-Security-Policy

## 🛠️ Налагодження

### Перевірка здоров'я сервісів
```bash
# Статус всіх сервісів
docker-compose --env-file=docker.env ps

# Health checks
curl -k https://localhost/health
curl http://localhost:8000/api/v1/heartbeat  # ChromaDB
curl http://localhost:8001/health            # RAG API
```

### Перегляд логів
```bash
# Всі логи
docker-compose --env-file=docker.env logs -f

# Конкретний сервіс
docker-compose --env-file=docker.env logs -f nginx
docker-compose --env-file=docker.env logs -f web-app
docker-compose --env-file=docker.env logs -f rag-api
docker-compose --env-file=docker.env logs -f chromadb
```

### Доступ до контейнерів
```bash
# Shell в контейнері
docker exec -it doc-scrapper-web-app sh
docker exec -it doc-scrapper-rag-api sh
docker exec -it doc-scrapper-nginx sh
docker exec -it doc-scrapper-chromadb sh
```

### Перевірка мережі
```bash
# Список мереж
docker network ls

# Інспекція мережі doc-scrapper
docker network inspect doc_scrapper_doc-scrapper-network
```

## 🔄 Типові завдання

### Оновлення коду
```bash
# Зупинити сервіси
./docker-stop.sh

# Пересібрати з новим кодом
./docker-start.sh --build
```

### Очищення даних
```bash
# Видалити тільки контейнери (дані зберігаються)
./docker-stop.sh

# Видалити все включно з даними
docker-compose --env-file=docker.env down --volumes
./docker-stop.sh --clean
```

### Backup даних
```bash
# Backup ChromaDB
docker run --rm -v doc_scrapper_chroma_data:/data -v $(pwd):/backup alpine tar czf /backup/chroma_backup.tar.gz -C /data .

# Backup скрапнутих документів
tar czf scraped_docs_backup.tar.gz scraped-docs/
```

### Restore даних
```bash
# Restore ChromaDB  
docker run --rm -v doc_scrapper_chroma_data:/data -v $(pwd):/backup alpine tar xzf /backup/chroma_backup.tar.gz -C /data

# Restore документів
tar xzf scraped_docs_backup.tar.gz
```

## ⚡ Оптимізація продуктивності

### Docker resource limits
```yaml
# В docker-compose.yml для кожного сервісу:
deploy:
  resources:
    limits:
      memory: 2G
      cpus: '1.0'
```

### Nginx caching
```nginx
# Static files кешуються на 1 рік
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🚨 Troubleshooting

### Проблема: Сервіс не стартує
```bash
# Перевірити логи
docker-compose --env-file=docker.env logs service-name

# Перевірити статус
docker-compose --env-file=docker.env ps
```

### Проблема: SSL сертифікат невалідний
```bash
# Перегенерувати сертифікат
docker-compose --env-file=docker.env exec nginx openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/nginx.key -out /etc/nginx/ssl/nginx.crt \
  -subj "/C=UA/ST=Ukraine/L=Kyiv/O=DocScrapper/CN=localhost"

# Restart nginx
docker-compose --env-file=docker.env restart nginx
```

### Проблема: Порт зайнятий
```bash
# Знайти процес що використовує порт
lsof -i :443
lsof -i :80

# Зупинити процес
sudo kill -9 PID
```

### Проблема: Out of memory
```bash
# Збільшити memory limits
# Відредагувати docker-compose.yml або docker.env
DOCKER_MEMORY_LIMIT=4g

# Перевірити використання пам'яті
docker stats
```

## 📊 Моніторинг

### System Resources
```bash
# Використання ресурсів контейнерами
docker stats

# Дискова пам'ять
docker system df

# Мережевий трафік
docker-compose --env-file=docker.env top
```

### Application Health
```bash
# Автоматична перевірка кожні 30 секунд
# Кожен сервіс має healthcheck

# Ручна перевірка
curl -k https://localhost/health
```

---

## 🎯 Production checklist

- [ ] Встановити справжній OPENAI_API_KEY
- [ ] Замінити self-signed сертифікати на реальні
- [ ] Налаштувати backup strategy
- [ ] Встановити monitoring (Prometheus/Grafana)
- [ ] Налаштувати log rotation
- [ ] Встановити firewall rules
- [ ] Налаштувати reverse proxy для multiple domains
- [ ] Встановити auto-restart policies
- [ ] Налаштувати SSL certificate renewal

**Система готова до production використання!** 🚀 