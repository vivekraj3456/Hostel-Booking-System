# Hostel Booking System

Full-stack hostel booking application with **React** frontend and **Node.js + Express** backend, using a **JSON file** as the database. Implements DSA: Arrays, Linear Search, Bubble Sort, Queue (FIFO), Stack (LIFO), and hierarchical hostel filtering (Boys/Girls → Hostel Number → Seater).

---

## Project Structure

```
hostel-booking/
├── server/
│   ├── server.js
│   ├── data.json
│   └── package.json
├── client/
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   ├── index.css
│   │   ├── pages/
│   │   │   ├── Rooms.js
│   │   │   ├── Bookings.js
│   │   │   ├── AddRoom.js
│   │   │   └── History.js
│   │   └── components/
│   │       └── RoomCard.js
│   ├── public/
│   │   └── index.html
│   └── package.json
└── README.md
```

---

## Installation

### Backend
```bash
cd hostel-booking/server
npm install
node server.js
```
Server runs at **http://localhost:5000**

### Frontend
```bash
cd hostel-booking/client
npm install
npm start
```
App runs at **http://localhost:3000** (proxy forwards API calls to port 5000)

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | / | API info |
| GET | /rooms | All rooms |
| GET | /rooms/sorted | Rooms sorted by price (Bubble Sort) |
| GET | /rooms/filter?hostelType=&hostelNumber=&seater= | Filter rooms (Linear Search) |
| GET | /bookings | Current bookings |
| GET | /history | Booking history |
| POST | /add-room | Add room (body: hostelType, hostelNumber, seater, roomNumber, price) |
| POST | /book/:id | Book room |
| DELETE | /cancel/:bookingId | Cancel booking |

---

## Features

- **Step 1:** Select Hostel Type (Boys / Girls)
- **Step 2:** Select Hostel Number (Boys: 1–6, Girls: 1–5)
- **Step 3:** Select Seater (2 / 3 / 4)
- **Step 4:** View filtered rooms and book

DSA: Arrays, Linear Search, Bubble Sort, Queue (waiting list), Stack (booking history), manual filter loop.
