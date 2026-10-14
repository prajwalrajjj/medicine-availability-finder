# Deploy the live API (Render + PostgreSQL)

The **frontend** is already live at [GitHub Pages](https://prajwalrajjj.github.io/medicine-availability-finder/).  
Deploy the **backend** once so search and inventory use a cloud database.

## Steps (~5 minutes)

1. Sign in at [Render](https://render.com) (GitHub login is fine).
2. Open **[New Blueprint Instance](https://dashboard.render.com/select-repo?type=blueprint)**.
3. Connect GitHub if asked, then select repo **`prajwalrajjj/medicine-availability-finder`**.
4. Render reads [`render.yaml`](../render.yaml) → creates **medicine-availability-api** + **medicine-db** (free tier).
5. Click **Apply** and wait until the web service status is **Live** (~5–10 min first time).
6. Test: `https://medicine-availability-api.onrender.com/api/health` should return `"database":"postgresql"`.
7. Reload the [live site](https://prajwalrajjj.github.io/medicine-availability-finder/) — header should show **cloud PostgreSQL**.

**Demo pharmacy login:** `greencross` / `demo12345`

> Free Render services sleep after inactivity; the first request may take up to ~1 minute.

## After deploy

- Add the API URL to the repo variable `VITE_API_URL` (optional, for GitHub Actions builds):
  `gh variable set VITE_API_URL --body https://medicine-availability-api.onrender.com`
