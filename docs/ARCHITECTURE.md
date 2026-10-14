# System architecture

## Logical components

| Layer | Technology | Folder |
|-------|------------|--------|
| Presentation | React, Vite, Leaflet | `client/` |
| Application API | Node.js, Express | `server/` |
| Data | PostgreSQL, Prisma ORM | `db/prisma/` |

## Request sequence (medicine search)

1. User submits search on **Medicine Availability Finder** UI.  
2. `GET /api/inventory/search?q=Paracetamol&city=Surat` hits Express on **EC2**.  
3. Prisma runs a SQL query against **Amazon RDS**.  
4. JSON list of pharmacy + medicine + quantity returns to the browser.  
5. React renders cards and optional map markers.

## Comparison with VitaMap reference

| Aspect | VitaMap | This project |
|--------|---------|--------------|
| Framework | Next.js full stack | React client + Express API |
| Database | PostgreSQL + Prisma | Same pattern |
| Auth | Pharmacy JWT/cookies | Pharmacy JWT (Bearer) |
| Map | Leaflet | Leaflet (`PharmacyMap.jsx`) |
| Hosting doc | Vercel | **AWS EC2 + RDS + S3** |
| Product name | VitaMap | **Medicine Availability Finder** (unchanged) |
