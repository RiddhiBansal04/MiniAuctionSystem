#  MiniAuctionSystem

A full-stack **Auction Platform** built with **Node.js, Express, PostgreSQL, Redis, React (Vite)**, and **Socket.io**.  
It supports real-time bidding, authentication, and email notifications.

---

##  Features
-  User Authentication (JWT)
-  Auctions CRUD (Create, View, Bid)
-  Real-time bidding using Socket.io
-  Email notifications (SendGrid)
-  PostgreSQL database (via Supabase)
-  Redis for caching & sessions
-  PDF invoice generation
-  Deployment-ready on Render

---



##  Setup Instructions

###  Clone Repository

git clone https://github.com/RiddhiBansal04/MiniAuctionSystem.git

cd MiniAuctionSystem

###  Backend Setup
cd backend

npm install

Create a .env file:

Run migrations

npm run migrate

Start backend

npm run dev

### Frontend Setup
cd frontend

npm install

Create a .env file

VITE_API_URL=http://localhost:8080

Start frontend

npm run dev

### Tech Stack

Frontend: React, Vite, Axios

Backend: Node.js, Express, Sequelize, Socket.io

Database: PostgreSQL (Supabase)

Cache: Redis (Upstash)

Auth: JWT

Email: SendGrid

Deployment: Render


### License

MIT License © 2025


