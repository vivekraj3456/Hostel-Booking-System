# 🏨 Hostel Booking System

A full-stack hostel booking application built with **React (Frontend)** and **Node.js + Express (Backend)**, using a **JSON file as the database**.

This project demonstrates real-world implementation of core **Data Structures & Algorithms (DSA)** including:

- Arrays  
- Linear Search  
- Bubble Sort  
- Queue (FIFO – Waiting List)  
- Stack (LIFO – Booking History)  
- Hierarchical filtering (Hostel Type → Hostel Number → Seater)

---

## 📌 Overview

The application provides a role-based hostel management system:

- **Students** can browse and book available rooms.
- **Administrators** can add new rooms and monitor booking history.

It features structured filtering, real-time booking logic, and queue-based room reassignment.

---

## ✨ Features

### 🏢 Structured Room Selection
1. Select Hostel Type (Boys / Girls)
2. Select Hostel Number  
   - Boys: 1–6  
   - Girls: 1–5  
3. Select Seater (2 / 3 / 4)
4. View filtered rooms and proceed to booking

### 📅 Booking System
- Real-time availability check
- Queue-based waiting list for unavailable rooms (FIFO)
- Automatic assignment from queue upon cancellation
- Stack-based booking history tracking (LIFO)

### 🔐 Authentication
- JWT-based login system
- Password hashing using Bcrypt
- Role-based access (Student / Admin)

### 🎨 UI/UX
- Responsive design
- Dark mode
- Toast notifications
- Modal components
- Loading skeletons
- Clean error handling

## 🚀 Installation

Follow the steps below to run the project locally.

---

### 🔧 Backend Setup

```bash
cd hostel-booking/server
npm install
node server.js
```

Backend will run at:

**http://localhost:5000**

---

### 💻 Frontend Setup

```bash
cd hostel-booking/client
npm install
npm start
```

Frontend will run at:

**http://localhost:3000**

> API requests are proxied to port **5000**.

## 🛠 Tech Stack

### Frontend
- React.js
- React Router
- React Hook Form
- Yup (Validation)
- React Toastify
- React Modal
- Custom CSS styling

### Backend
- Node.js
- Express.js
- JWT Authentication
- Bcrypt (Password Hashing)

### Data Storage
- JSON file (Demo purpose)
- Easily scalable to MongoDB

---



## 👨‍💻 Author

[**Vivek Raj**](https://github.com/vivekraj3456)

For questions or suggestions, feel free to open an issue in this repository.
