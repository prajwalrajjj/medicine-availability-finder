# Medicine Availability Finder

**Cloud-Based Medicine Availability and Pharmacy Inventory Management System Using AWS**

## Live demo

| Link | URL |
|------|-----|
| **Web app (GitHub Pages)** | https://prajwalrajjj.github.io/medicine-availability-finder/ |
| **API (live)** | https://integrate-nothing-relax-heart.trycloudflare.com |
| **GitHub repo** | https://github.com/prajwalrajjj/medicine-availability-finder |

The **frontend is live** on GitHub Pages (`gh-pages` branch). The **API** uses [Render](https://render.com) + PostgreSQL via [`render.yaml`](./render.yaml).

**Finish the live demo (one-time, ~5 min):** follow [docs/DEPLOY_RENDER.md](./docs/DEPLOY_RENDER.md) or [open Render Blueprint → select this repo → Apply](https://dashboard.render.com/select-repo?type=blueprint).

Until Render is applied, the site loads but search shows “API offline” because the backend URL is not running yet.

College cloud-computing project: users search for medicines (e.g. Paracetamol), the backend queries a cloud PostgreSQL database, and pharmacies manage inventory with authenticated accounts. The browser title and product name remain **Medicine Availability Finder**.

This project is **inspired by [VitaMap](https://github.com/akasr/vitamap)** (medicine search, pharmacy accounts, map, inventory). See [ACKNOWLEDGMENTS.md](./ACKNOWLEDGMENTS.md).

## How it works (presentation flow)

1. User opens the **Medicine Availability Finder** website.
2. User searches for a medicine (e.g. Paracetamol).
3. The **Express backend** on EC2 (or locally) receives the request.
4. The backend queries **PostgreSQL** (Amazon RDS when deployed).
5. The database returns pharmacy inventory rows.
6. The website shows results and an optional **Leaflet map** of pharmacies.

## Project structure (VitaMap-aligned layout)

```
medicine-availability-finder/
├── client/          # React + Vite frontend (Medicine Availability Finder UI)
├── server/          # Node.js + Express API (backend)
├── db/
│   └── prisma/      # PostgreSQL schema (same role as VitaMap db/prisma)
├── docs/            # AWS deployment, architecture, submission checklist
├── ACKNOWLEDGMENTS.md
└── README.md
```

## Features (for submission)

| Requirement | Implementation |
|-------------|----------------|
| Medicine search | `GET /api/inventory/search?q=` |
| Pharmacy inventory management | Inventory tab + `PATCH /api/inventory/:id` |
| Cloud database | PostgreSQL via Prisma (`POSTGRES_URL` → Amazon RDS) |
| Cloud deployment | Documented in `docs/AWS_DEPLOYMENT.md` (EC2, RDS, S3, IAM, CloudWatch) |
| App ↔ database demo | Health endpoint shows `database: postgresql`; search hits RDS |

### Also included (VitaMap-inspired)

- Pharmacy **sign-up / sign-in** (bcrypt + JWT) when PostgreSQL is enabled
- **Interactive map** (react-leaflet)
- Demo seed data (Surat / Ahmedabad pharmacies)

## Requirements

- Node.js LTS and npm
- Optional: local PostgreSQL or **Amazon RDS** for persistent cloud storage

## Run locally

### 1. Backend

```bash
cd server
copy .env.example .env
npm install
npm run db:generate
npm run dev
```

**Without `POSTGRES_URL`:** in-memory demo data (resets on restart).  
**With `POSTGRES_URL`:** run migrations once, then start:

```bash
npm run db:migrate
```

Set `JWT_SECRET` (e.g. 32+ random characters) when using pharmacy sign-in.

Demo pharmacy login (after PostgreSQL seed): username `greencross`, password `demo12345`.

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173). The page title stays **Medicine Availability Finder**.

## Main API routes

- `GET /api/health` — status and database mode
- `GET /api/medicines` — medicine catalogue
- `GET /api/pharmacies` — pharmacies with map coordinates
- `GET /api/inventory/search?q=&city=` — search (core demo flow)
- `POST /api/pharmacy/signup` — register pharmacy (PostgreSQL)
- `POST /api/pharmacy/signin` — JWT for staff
- `PATCH /api/inventory/:id` — update stock
- `POST /api/inventory` — add stock (authenticated)

## AWS services (recommended)

| Service | Use in this project |
|---------|---------------------|
| **Amazon EC2** | Host Node.js backend (and optionally build tools) |
| **Amazon RDS** | Managed PostgreSQL (`POSTGRES_URL`) |
| **Amazon S3** | Host `client/dist` static website assets |
| **AWS IAM** | EC2 instance role, RDS access, S3 deploy user |
| **Amazon CloudWatch** | Logs and basic monitoring for EC2 |

You do not need every service for a good grade — a working app with **RDS + one compute host** and a clear demo is enough. Details: [docs/AWS_DEPLOYMENT.md](./docs/AWS_DEPLOYMENT.md).

## Presentation checklist

See [docs/SUBMISSION_CHECKLIST.md](./docs/SUBMISSION_CHECKLIST.md).

## License and ethics

- Fictional demo inventory only — not medical advice.
- Do not commit `.env` or RDS passwords.
- Acknowledge VitaMap if you reuse ideas or patterns from their repository.
