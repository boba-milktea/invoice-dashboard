# Invoice Dashboard

A full-stack invoice dashboard to track payments, overdue invoices, and aging buckets.

---

## 🚀 Features

- View all invoices
- Track **paid / unpaid / overdue**
- Aging buckets (Current, 1–30, 31–60, 61–90, 91+)
- Filter by:
  - status
  - overdue
  - client
  - amount
- Sort by due date or amount
- URL-based filters (shareable links)

---

## 🛠 Tech Stack

- **Frontend**: React + Vite + TypeScript  
- **Backend**: Node.js + Express + TypeScript  
- **Database**: SQLite (via Prisma)

---

## 📁 Structure
client/ → React frontend
server/ → Express backend


---

## ⚙️ Getting Started

### 1. Install dependencies

```bash
cd server
npm install

cd ../client
npm install

```

### 2. Run backend

```bash
cd server
npx prisma generate
npx prisma migrate dev
npm run dev
```
Backend: http://localhost:3000


### 3. Run frontend

```bash
cd client
npm run dev
```
Frontend: http://localhost:5173

## 🔌 Environment Variables
### Backend (server/.env)
```bash
DATABASE_URL="file:./dev.db"
```
### Frontend (client/.env)
```bash
VITE_API_BASE_URL=http://localhost:3000
```


## 📊 API
```typescript
GET /api/invoices
```

Example:
```typescript
/api/invoices?overdue=true&bucket=31_60
```

## 🚀 Deployment

- Backend → Render (Web Service)
- Frontend → Render (Static Site)

Set:

```typescript
VITE_API_BASE_URL=https://your-backend-url
```

## 📌 Notes

- Overdue = unpaid invoices past due date
- Aging buckets are based on days past due

## 📄 License

MIT


---
