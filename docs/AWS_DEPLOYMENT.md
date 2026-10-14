# AWS deployment guide — Medicine Availability Finder

Deploy **Cloud-Based Medicine Availability and Pharmacy Inventory Management System Using AWS**. Adjust console names and pricing for your region and student account.

## Target architecture

```mermaid
flowchart LR
  User[User browser] --> S3[S3 static site]
  User --> EC2[EC2 Express API]
  EC2 --> RDS[(RDS PostgreSQL)]
  EC2 --> CW[CloudWatch Logs]
  Deploy[Developer IAM user] --> S3
  Deploy --> EC2
```

| AWS service | Role |
|-------------|------|
| **Amazon EC2** | Run `server/` (Node.js Express on port 5000 or behind nginx) |
| **Amazon RDS** | PostgreSQL; connection string in `POSTGRES_URL` |
| **Amazon S3** | Host built React app (`client/dist`) |
| **AWS IAM** | Least-privilege users/roles for deploy and EC2 |
| **Amazon CloudWatch** | EC2 agent or pm2 logs → log groups; optional CPU alarms |

## Before you deploy

1. Enable MFA on the AWS root/user account; set a **billing budget alert**.
2. Create an **RDS PostgreSQL** instance (db.t3.micro or free-tier eligible if available).
   - Note endpoint, database name, username, password.
   - Security group: allow inbound **5432** only from the EC2 security group.
3. Build connection string:

   `postgres://USER:PASSWORD@RDS_ENDPOINT:5432/DATABASE?sslmode=require`

4. Launch **EC2** (Amazon Linux 2023 or Ubuntu):
   - Security group: inbound **22** (your IP only), **5000** or **443** for API.
   - Attach an IAM role if you later need S3/CloudWatch without static keys.

## Backend on EC2

```bash
# On EC2
git clone <your-repo>
cd medicine-availability-finder/server
npm install
npm run db:generate
# Set environment variables (use /etc/environment or pm2 ecosystem file):
# POSTGRES_URL=...
# JWT_SECRET=...
# PORT=5000
npm run db:migrate
npm start
```

Use **pm2** or **systemd** to keep the process running. Point **CloudWatch Agent** at application logs or use pm2 log shipping.

Run Prisma migrations from EC2 (or CI) whenever `db/prisma/schema.prisma` changes.

## Frontend on S3

On your development machine:

```bash
cd client
# Set API URL to your EC2 public DNS or load balancer, e.g.:
# VITE_API_URL=http://EC2_PUBLIC_DNS:5000
npm install
npm run build
```

Upload `client/dist` to an S3 bucket configured for static website hosting (or S3 + CloudFront for HTTPS).

**CORS:** Express already uses `cors()`. Restrict origins in production to your S3/CloudFront domain.

## IAM (minimum concepts for report)

- **Deploy user:** `s3:PutObject` on the website bucket; no RDS admin in daily use.
- **EC2 instance role:** optional `logs:CreateLogStream`, `logs:PutLogEvents` for CloudWatch.
- **RDS:** no public access; credentials only in EC2 environment, never in Git.

## Demonstrate app ↔ cloud database

1. Open the site; status shows **cloud PostgreSQL**.
2. Search **Paracetamol** — explain request path: browser → EC2 → RDS → JSON response.
3. Sign in as demo pharmacy; change quantity; search again to show persisted data.
4. Show RDS table row count or a read-only query in pgAdmin (screenshot for report).
5. Show CloudWatch log line for a search request (optional).

## Security reminders (student project)

- Do not open RDS to `0.0.0.0/0`.
- Use HTTPS for production (CloudFront + ACM or nginx + Let’s Encrypt).
- Rotate RDS password after demos; delete resources when finished to avoid charges.

## Local vs AWS

| Mode | `POSTGRES_URL` | Behavior |
|------|----------------|----------|
| Local demo | empty | In-memory data, no RDS needed for UI practice |
| Cloud demo | RDS URL | Full submission features (auth, persistence, map coords from DB |
