# 📝 Blog Application (Express, MongoDB, Auth & Media Upload)


---

## 🌟 Overview

This is a **full-featured Blog Application backend** built with **Express.js** and **MongoDB**.  

It simulates a production-ready backend system with:

- Authentication & Authorization (JWT, role-based)
- CRUD operations for users & posts
- Media Upload (ImageKit)
- Groups system with roles and permissions
- Super Admin role
- Pagination, Validation, and Error Handling

---

## 🚀 Features

### 🔐 Authentication & Authorization
- Register & Login system  
- Password hashing  
- JWT-based authentication  
- Protected routes
- **Optional Google Login** 🌐 (Sign in with Google account)

### 👤 Users & Posts CRUD
- Users: Create, Update, Delete, Get all  
- Posts: Create, Update, Delete, Get all & by user  
- Media Upload: Multiple images per post  

### 🏘 Groups System
- Create groups  
- Admin & member roles  
- Permissions management  
- Only allowed users can post

### 👑 Super Admin Role
- Full control over users, posts & groups  

### ⚙ Middleware & Validation
- Authentication & Authorization middleware  
- File upload (Multer + ImageKit)  
- Input validation (Joi)  
- Global error handling  

### ✨ Bonus Features
- Pagination ✅  
---

## 🛠 Tech Stack

| Layer      | Technology               |
|-----------|--------------------------|
| Backend   | Node.js, Express.js      |
| Database  | MongoDB, Mongoose        |
| Auth      | JWT                      |
| Media     | ImageKit                 |
| Validation| Joi (or alternative)     |

---
## 📚 Documentation

For full API documentation, endpoints, and usage guide, check out the **official documentation**:

[📖 Project Documentation](https://documenter.getpostman.com/view/38813211/2sBXirhTK5#a8ef2671-f795-47be-80bd-c80b74795e5b)
---

## 📂 Project Structure

```bash
/project
  /controllers
  /models
  /routes
  /middleware
  /utils
    AppError.js

  /config
  server.js
  app.js


---

