# 🚵 MTB Setup Tracker

A progressive web app for tracking mountain bike suspension and tire setups across rides. Find what works on different trails and conditions.

## ✨ Features

- 🚲 **Multiple bike support** — track specs like travel and wheel size
- ⚙️ **Full suspension tracking** — fork & shock air pressure, rebound/compression clicks, tokens/spacers
- 🛞 **Tire setup tracking** — pressure, brand, and model per axle
- 🏔️ **Trail conditions** — dry, tacky, wet, muddy, mixed + weather logging
- ⭐ **Ride ratings** — rate every ride 1–5 stars
- 📊 **Analytics** — find your sweet spot settings from highly-rated rides
- 🔀 **Compare setups** — across trails and rides for a given bike
- 📱 **PWA** — installable on your phone, dark theme, mobile-first design

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Backend | FastAPI · SQLAlchemy · Alembic · PostgreSQL |
| Frontend | React 18 · TypeScript · Vite · Tailwind CSS |
| Charts | Recharts |
| PWA | vite-plugin-pwa |

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+ (or Docker)

### 1. Start PostgreSQL

```bash
docker run -d --name mtb-postgres \
  -e POSTGRES_USER=mtb \
  -e POSTGRES_PASSWORD=mtb_pass \
  -e POSTGRES_DB=mtb_tracker \
  -p 5432:5432 \
  postgres:16
```

### 2. Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e .              # or: uv pip install -e .
alembic upgrade head          # run database migrations
uvicorn app.main:app --reload --port 8000
```

API docs available at [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## ⚙️ Configuration

Backend config uses pydantic-settings with the `MTB_` env prefix:

| Variable | Default | Description |
|----------|---------|-------------|
| `MTB_DATABASE_URL` | `postgresql://mtb:mtb_pass@localhost:5432/mtb_tracker` | Database connection string |
| `MTB_DEBUG` | `false` | Enable debug mode |

## 📁 Project Structure

```
mtb-setup-tracker/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app entry point
│   │   ├── config.py           # Pydantic settings
│   │   ├── database.py         # SQLAlchemy engine & session
│   │   ├── models/             # ORM models (Bike, Ride, Setup)
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   └── routers/            # API route handlers
│   ├── alembic/                # Database migrations
│   ├── pyproject.toml
│   └── alembic.ini
├── frontend/
│   ├── src/
│   │   ├── pages/              # Page components
│   │   ├── components/         # Shared UI components
│   │   ├── api/client.ts       # Axios API client
│   │   ├── types/index.ts      # TypeScript interfaces
│   │   └── App.tsx             # Router setup
│   ├── package.json
│   ├── vite.config.ts          # Vite config with API proxy & PWA
│   └── tailwind.config.js
├── Dockerfile                  # Multi-stage production build
├── docker-compose.yml
└── README.md
```

## 📡 API Reference

### Bikes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/bikes` | List all bikes |
| `POST` | `/api/bikes` | Create a bike |
| `GET` | `/api/bikes/:id` | Get a bike by ID |
| `PUT` | `/api/bikes/:id` | Update a bike |
| `DELETE` | `/api/bikes/:id` | Delete a bike and all its rides |

### Rides

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/rides` | List rides (filters: `bike_id`, `trail_name`, `trail_condition`, `limit`, `offset`) |
| `POST` | `/api/rides` | Create a ride with nested setup |
| `GET` | `/api/rides/:id` | Get a ride with its setup |
| `PATCH` | `/api/rides/:id` | Update a ride and/or its setup |
| `DELETE` | `/api/rides/:id` | Delete a ride |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/analytics/sweet-spots` | Average settings from highly-rated rides (`bike_id`, `min_rating`) |
| `GET` | `/api/analytics/compare` | Compare setups across rides on a specific trail (`trail`, `bike_id`) |
| `GET` | `/api/analytics/compare-setups` | All rides grouped by trail for a bike (`bike_id`) |

## 📦 Data Model

### Bike
`name` · `year` · `travel_front_mm` · `travel_rear_mm` · `wheel_size` · `notes`

### Ride
`bike_id` · `date` · `trail_name` · `trail_condition` · `weather` · `temperature_f` · `duration_minutes` · `rating` · `notes`

### Setup (1:1 per ride)
**Tires:** `front_tire_brand` · `front_tire_model` · `front_tire_pressure_psi` · `rear_tire_brand` · `rear_tire_model` · `rear_tire_pressure_psi`

**Fork:** `fork_air_pressure_psi` · `fork_rebound_clicks` · `fork_compression_clicks` · `fork_tokens`

**Shock:** `shock_air_pressure_psi` · `shock_rebound_clicks` · `shock_compression_clicks` · `shock_volume_spacers`

## 🐳 Deployment

A multi-stage `Dockerfile` is included that builds the React frontend and serves it via FastAPI:

```bash
docker build -t mtb-tracker .
docker run -p 8000:8000 -e MTB_DATABASE_URL=postgresql://user:pass@host/db mtb-tracker
```

Or use docker-compose:

```bash
docker-compose up --build
```

> **Note:** PWA features (service worker, install prompt) require HTTPS in production.

## 📄 License

MIT
