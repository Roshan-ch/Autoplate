<div align="center">

# AutoPlate

> **An AI-powered Vehicle Number Plate Recognition & Smart Parking Management System**

AutoPlate is a **full-stack web application** that automates vehicle entry and exit using **Automatic Number Plate Recognition (ANPR)**. Built with **React**, **Django REST Framework**, **PostgreSQL**, and **YOLOv5**, the system streamlines parking operations through intelligent vehicle recognition, secure authentication, and real-time parking management.

</div>

---

## ✨ Features

- 🚗 Automatic Number Plate Recognition (ANPR)
- 🔐 JWT-Based User Authentication
- 👥 Role-Based Access Control
- 🅿️ Smart Parking Management
- 📸 Image Upload & Plate Detection
- 📊 Parking History & Activity Logs
- 📱 Responsive User Interface
- ⚡ RESTful API Architecture

---


# 🛠️ Tech Stack

### Frontend

- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- React Query
- Framer Motion
- Lucide React
- React Icons

### Backend

- Django
- Django REST Framework
- PostgreSQL
- Simple JWT
- CORS Headers
- drf-yasg (Swagger Documentation)

### Machine Learning

- PyTorch
- YOLOv5
- OpenCV

---

# 📂 Project Structure

```text
AutoPlate/
│
├── Autoplate_frontend/
│   └── frontend/
│       ├── public/
│       ├── src/
│       │   ├── api/
│       │   ├── assets/
│       │   ├── components/
│       │   ├── pages/
│       │   └── ...
│       └── package.json
│
├── backend/
│   └── AutoPlate_backEnd/
│       ├── Auto_Plate/
│       │   ├── migrations/
│       │   ├── models.py
│       │   ├── serializers.py
│       │   ├── views.py
│       │   ├── recognition_service.py
│       │   └── ...
│       │
│       ├── AutoPlate_backEnd/
│       ├── manage.py
│       ├── requirements.txt
│       └── db.sqlite3
│
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Before running the project, ensure the following are installed:

- Node.js (v18+)
- npm
- Python (3.8+)
- PostgreSQL
- Git

---

## 📥 Clone the Repository

```bash
git clone <repository-url>
cd AutoPlate
```

---

## ⚙️ Backend Setup

Navigate to the backend directory.

```bash
cd backend/AutoPlate_backEnd
```

Install the required dependencies.

```bash
pip install -r requirements.txt
```

Apply database migrations.

```bash
python manage.py makemigrations
python manage.py migrate
```

Run the Django development server.

```bash
python manage.py runserver
```

> **Note:** Update your PostgreSQL credentials inside:

```text
backend/AutoPlate_backEnd/AutoPlate_backEnd/settings.py
```

if your local database configuration is different.

---

## 💻 Frontend Setup

Navigate to the frontend directory.

```bash
cd Autoplate_frontend/frontend
```

Install dependencies.

```bash
npm install
```

Start the development server.

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:5173
```

---

# 🔗 API

The backend exposes REST APIs secured with **JWT Authentication**.

Default API URL:

```text
http://127.0.0.1:8000/api/
```

Swagger Documentation (if enabled):

```text
http://127.0.0.1:8000/swagger/
```

---

# 🔐 Authentication

AutoPlate uses **JWT Authentication** for secure access.

Supported features include:

- User Login
- Access Token
- Refresh Token
- Protected Routes

---

# 🎯 Future Improvements

- 📷 Live Camera Recognition
- 📧 Email Notifications
- ☁️ Cloud Deployment
- 📱 Mobile Application
- 🚙 Multi-Level Parking Support
- 🤖 Improved OCR Accuracy

---

# 👨‍💻 Project Team

| Name |
|------|
| Abhishek Man Basnet |
| Nadish Acharya |
| Roshan Chaudhary |
| Sworup Raj Ghatani |

---

# 🤝 Contributing

Contributions are welcome!

1. Fork this repository.

2. Create your feature branch.

```bash
git checkout -b feature/new-feature
```

3. Commit your changes.

```bash
git commit -m "Add new feature"
```

4. Push to the branch.

```bash
git push origin feature/new-feature
```

5. Open a Pull Request.

---

# 📄 License

This project was developed for educational purposes.

---

# ⭐ Show Your Support

If you found this project useful, please consider giving it a **⭐ Star** on GitHub. Your support helps others discover the project and motivates future development.