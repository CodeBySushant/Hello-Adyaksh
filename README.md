# HelloAdyaksh 🇳🇵

A modern municipality and ward management portal built with **Next.js 16**, **TypeScript**, **MySQL**, and **Tailwind CSS**.

HelloAdyaksh is a full-stack civic administration platform designed for Nepal municipalities and ward offices to manage notices, complaints, reports, development works, blogs, gallery updates, and citizen communication through a clean public portal and powerful admin dashboard.

---

# ✨ Features

## 🌐 Public Portal

* Modern responsive homepage
* Municipality/Ward information display
* Notices & announcements
* Development works showcase
* Public gallery
* Public reports/documents
* Blogs/news section
* Complaint submission system
* Contact/message system
* Nepali + English language support
* Fully mobile responsive UI

---

## 🛠️ Admin Dashboard

* Secure admin authentication
* Dashboard analytics
* Manage notices
* Manage blogs
* Manage development works
* Manage gallery
* Manage reports/documents
* View citizen complaints
* View contact messages
* Upload media files
* Publish/unpublish content
* Multi-section management system

---

# 🏗️ Tech Stack

## Frontend

* Next.js 16 (App Router)
* React 19
* TypeScript
* Tailwind CSS v4
* Framer Motion
* Radix UI
* Lucide React Icons
* SWR

---

## Backend

* Next.js API Routes
* MySQL
* mysql2
* Custom authentication system

---

## UI & Components

* shadcn/ui inspired architecture
* Responsive admin dashboard
* Animated transitions
* Modern card/grid layouts

---

# 📂 Project Structure

```bash
codebysushant-hello-adyaksh/
├── app/
│   ├── admin/          # Admin dashboard pages
│   ├── api/            # Backend API routes
│   ├── blogs/
│   ├── complaints/
│   ├── contact/
│   ├── development/
│   ├── gallery/
│   ├── notices/
│   └── reports/
│
├── components/
│   ├── home/           # Homepage sections
│   └── ui/             # Reusable UI components
│
├── db/
│   └── schema.sql      # Database schema
│
├── hooks/
│
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── language-context.tsx
│   └── utils.ts
│
├── public/
│
├── scripts/
│   └── createAdmin.js
│
└── var/
    └── www/
        └── upload-server/
```

---

# 🚀 Installation

## 1️⃣ Clone Repository

```bash
git clone https://github.com/CodeBySushant/Hello-Adyaskh.git
cd HelloAdyaksh
```

---

## 2️⃣ Install Dependencies

```bash
npm install
```

---

## 3️⃣ Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=helloadyaksh

JWT_SECRET=your_secret_key

VPS_API_URL=http://your-vps-server
VPS_API_KEY=your_api_key
```

---

## 4️⃣ Setup Database

Import the SQL schema:

```bash
db/schema.sql
```

into your MySQL database.

---

## 5️⃣ Create Admin User

```bash
node scripts/createAdmin.js
```

---

## 6️⃣ Run Development Server

```bash
npm run dev
```

Visit:

```bash
http://localhost:3000
```

---

# 🔐 Admin Access

## Admin Dashboard

```bash
/admin
```

## Login Page

```bash
/login
```

---

# 📸 Modules Included

| Module                 | Status |
| ---------------------- | ------ |
| Authentication         | ✅      |
| Complaints System      | ✅      |
| Contact System         | ✅      |
| Notices                | ✅      |
| Blogs                  | ✅      |
| Gallery                | ✅      |
| Reports Management     | ✅      |
| Development Works      | ✅      |
| Admin Dashboard        | ✅      |
| Multi-language Support | ✅      |

---

# 🌍 Multi-language Support

Currently supported languages:

* English 🇬🇧
* Nepali 🇳🇵

Language switching is available in both public and admin interfaces.

---

# 📦 API Endpoints

## Public APIs

```bash
/api/notices
/api/blogs
/api/gallery
/api/reports
/api/development
/api/complaints
/api/contact
```

---

## Admin APIs

```bash
/api/admin/login
```

---

# 🎨 UI Highlights

* Clean municipality dashboard
* Responsive sidebar navigation
* Animated cards & transitions
* Nepal-themed color palette
* Mobile-friendly layouts
* Accessible UI components
* Smooth animations using Framer Motion

---

# 🔧 Future Improvements

* Role-based authentication
* Advanced analytics dashboard
* File upload optimization
* Real-time complaint tracking
* Email notifications
* PDF generation support
* Search optimization
* Pagination system
* Dark mode support
* Notification system

---

# 🧠 Learning Outcomes

This project helped improve understanding of:

* Full-stack Next.js architecture
* API route handling
* MySQL integration
* Authentication systems
* State management
* Responsive admin dashboards
* File upload systems
* Production deployment workflows

---

# 👨‍💻 Author

## Sushant Sharma

Computer Science Engineering Student
MANIT Bhopal

### Skills

* Full Stack Development
* Next.js
* React
* TypeScript
* MySQL
* Node.js
* UI/UX Design

---

# 🔗 Links

## GitHub Repository

[https://github.com/CodeBySushant/Hello-Adyaksh](https://github.com/CodeBySushant/Hello-Adyaksh)

## GitHub Profile

[https://github.com/CodeBySushant](https://github.com/CodeBySushant)

---

# 📄 License

This project is licensed under the MIT License.

---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.

---

# 🇳🇵 Built for Digital Governance

HelloAdyaksh aims to modernize local governance systems by providing transparent, accessible, and user-friendly digital infrastructure for municipalities and ward offices.
