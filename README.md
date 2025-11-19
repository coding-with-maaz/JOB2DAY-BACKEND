# JOB2DAY - Full-Stack Job Search Platform

<div align="center">
  <img 
    src="https://github.com/user-attachments/assets/43ea82b4-14f2-41f8-a756-97706501b131" 
    alt="JOB2DAY APIS RESPONSE" 
    style="max-width: 100%; height: auto; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); margin: 20px 0;"
  />
</div>

<p align="center">
  <strong>A comprehensive job search platform with a Flutter mobile application and Node.js/Express backend API.</strong>
</p>

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Backend Setup](#backend-setup)
- [Mobile App Setup](#mobile-app-setup)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

JOB2DAY is a full-stack job search platform that connects job seekers with employers. The platform includes:

- **Backend API**: RESTful API built with Node.js, Express, and MySQL
- **Mobile App**: Cross-platform Flutter application for iOS, Android, Web, Windows, macOS, and Linux
- **Features**: Job search, filtering, applications, resume builder, push notifications, and more

## ✨ Features

### Backend Features
- ✅ RESTful API with Express.js
- ✅ MySQL database with Sequelize ORM
- ✅ JWT authentication
- ✅ File upload handling
- ✅ Email notifications (Nodemailer)
- ✅ Push notifications (Firebase Cloud Messaging)
- ✅ Scheduled jobs (node-cron)
- ✅ SEO optimization (sitemap, schema.org)
- ✅ Rate limiting and security middleware
- ✅ Comprehensive error handling

### Mobile App Features
- ✅ Job browsing and search
- ✅ Advanced filtering (location, type, salary, experience)
- ✅ Job details and application
- ✅ Resume builder with PDF export
- ✅ Push notifications
- ✅ Google Mobile Ads integration
- ✅ Offline support
- ✅ Beautiful, modern UI
- ✅ Cross-platform support (iOS, Android, Web, Desktop)

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: Sequelize
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer
- **Email**: Nodemailer
- **Push Notifications**: Firebase Admin SDK
- **Scheduling**: node-cron
- **Validation**: express-validator
- **Security**: bcrypt, express-rate-limit

### Mobile App
- **Framework**: Flutter 3.8.1+
- **Language**: Dart
- **State Management**: Provider
- **HTTP Client**: Dio
- **Ads**: Google Mobile Ads
- **Notifications**: Firebase Messaging + Local Notifications
- **PDF**: pdf, printing packages
- **Storage**: SharedPreferences
- **Image Caching**: cached_network_image

## 📁 Project Structure

```
Backend/
├── src/                          # Backend source code
│   ├── config/                   # Configuration files
│   │   ├── database.js          # Database configuration
│   │   └── firebase.js           # Firebase configuration
│   ├── controllers/              # Route controllers
│   │   ├── job.controller.js
│   │   ├── user.controller.js
│   │   ├── category.controller.js
│   │   └── ...
│   ├── models/                   # Sequelize models
│   │   ├── job.model.js
│   │   ├── user.model.js
│   │   └── ...
│   ├── routes/                   # API routes
│   │   ├── index.js
│   │   ├── job.routes.js
│   │   └── ...
│   ├── services/                 # Business logic services
│   │   ├── emailService.js
│   │   ├── notificationService.js
│   │   └── ...
│   ├── middleware/               # Express middleware
│   │   ├── auth.js
│   │   └── upload.js
│   └── server.js                 # Entry point
├── seeders/                      # Database seeders
├── migrations/                   # Database migrations
├── public/                       # Static files
├── config/                       # Configuration files
├── JOB2DAY MOBILE APP/          # Flutter mobile app
│   ├── lib/
│   │   ├── config/              # App configuration
│   │   ├── models/              # Data models
│   │   ├── pages/               # App screens
│   │   ├── services/            # API services
│   │   ├── widgets/             # Reusable widgets
│   │   └── utils/               # Utilities
│   ├── android/                 # Android platform files
│   ├── ios/                     # iOS platform files
│   ├── web/                     # Web platform files
│   └── pubspec.yaml            # Flutter dependencies
├── package.json                 # Node.js dependencies
└── README.md                    # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- Flutter SDK (3.8.1 or higher)
- Firebase account (for push notifications)
- Google Mobile Ads account (for ads)

## 🔧 Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/coding-with-maaz/JOB2DAY-BACKEND.git
   cd JOB2DAY-BACKEND
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   DB_NAME=your_database_name
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_HOST=localhost
   PORT=3000
   JWT_SECRET=your_jwt_secret
   FIREBASE_PROJECT_ID=your_firebase_project_id
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   ```

4. **Set up Firebase**
   - Download `google-services.json` from Firebase Console
   - Place it in `src/` directory
   - Download Firebase Admin SDK JSON file
   - Place it in `src/` directory (e.g., `jobstoday-*-firebase-adminsdk-*.json`)

5. **Run database migrations**
   ```bash
   npm run seed:data
   ```

6. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

The API will be available at `http://localhost:3000/api`

## 📱 Mobile App Setup

1. **Navigate to the mobile app directory**
   ```bash
   cd "JOB2DAY MOBILE APP"
   ```

2. **Install Flutter dependencies**
   ```bash
   flutter pub get
   ```

3. **Configure Firebase**
   - Download `google-services.json` for Android
   - Place it in `android/app/`
   - Download `GoogleService-Info.plist` for iOS
   - Place it in `ios/Runner/`

4. **Update API configuration**
   Edit `lib/config/environment_config.dart`:
   ```dart
   static const bool isProduction = false; // Set to true for production
   static String get baseUrl {
     if (isProduction) {
       return 'https://backend.harpaljob.com/api';
     } else {
       return 'https://frontend.harpaljob.com/api'; // or your local API
     }
   }
   ```

5. **Run the app**
   ```bash
   # Android
   flutter run

   # iOS
   flutter run

   # Web
   flutter run -d chrome

   # Build for production
   flutter build apk --release
   flutter build ios --release
   ```

## 📚 API Documentation

### Base URL
- Development: `http://localhost:3000/api`
- Production: `https://backend.harpaljob.com/api`

### Main Endpoints

#### Jobs
- `GET /api/jobs` - Get all jobs (with pagination and filters)
- `GET /api/jobs/:id` - Get job by ID
- `GET /api/jobs/slug/:slug` - Get job by slug
- `GET /api/jobs/featured` - Get featured jobs
- `GET /api/jobs/today` - Get jobs posted today
- `GET /api/jobs/country/:country` - Get jobs by country
- `GET /api/jobs/category/:categoryId` - Get jobs by category
- `POST /api/jobs` - Create job (admin/employer only)
- `PUT /api/jobs/slug/:slug` - Update job (admin/employer only)
- `DELETE /api/jobs/slug/:slug` - Delete job (admin/employer only)
- `POST /api/jobs/:id/apply` - Apply for job (authenticated)
- `POST /api/jobs/:id/quick-apply` - Quick apply (no auth required)

#### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID

#### Companies
- `GET /api/companies` - Get all companies
- `GET /api/companies/:id` - Get company by ID

#### Users
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/users/profile` - Get user profile (authenticated)
- `PUT /api/users/profile` - Update user profile (authenticated)

#### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification (admin only)

### Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 🔐 Environment Variables

### Backend (.env)
```env
# Database
DB_NAME=harpaljob_laravel
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=127.0.0.1

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your_secret_key

# Firebase
FIREBASE_PROJECT_ID=your_project_id

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

## 🗄 Database Schema

### Main Tables
- **Users**: User accounts (admin, employer, jobseeker)
- **Jobs**: Job postings
- **Categories**: Job categories
- **Companies**: Company information
- **JobApplications**: Job applications
- **AdsConfig**: Ad configuration
- **Analytics**: Analytics data
- **SEO**: SEO metadata

### Relationships
- Job belongsTo User (employer)
- Job belongsTo Company
- Job belongsToMany Categories
- Job hasMany JobApplications
- User hasMany Jobs (as employer)

## 🚢 Deployment

### Backend Deployment
1. Set up a production server (e.g., AWS, DigitalOcean, Heroku)
2. Configure environment variables
3. Set up MySQL database
4. Install dependencies: `npm install --production`
5. Run migrations and seeders
6. Start the server with PM2 or similar:
   ```bash
   pm2 start src/server.js --name job2day-backend
   ```

### Mobile App Deployment
1. **Android**
   ```bash
   flutter build apk --release
   flutter build appbundle --release
   ```
   Upload to Google Play Console

2. **iOS**
   ```bash
   flutter build ios --release
   ```
   Upload to App Store Connect

3. **Web**
   ```bash
   flutter build web --release
   ```
   Deploy to hosting service (Firebase Hosting, Netlify, etc.)

## 📝 Important Notes

### Security
- ⚠️ **Never commit** `.env` files or Firebase credentials
- ⚠️ Firebase admin SDK JSON files are excluded from git
- ⚠️ Always use environment variables for sensitive data
- ⚠️ Keep JWT secrets secure and rotate regularly

### Files to Add Locally
The following files are excluded from git and must be added locally:
- `src/google-services.json`
- `src/jobstoday-*-firebase-adminsdk-*.json`
- `JOB2DAY MOBILE APP/android/app/google-services.json`
- `JOB2DAY MOBILE APP/ios/Runner/GoogleService-Info.plist`
- `.env` file

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary. All rights reserved.

## 👥 Authors

- **Maaz** - [coding-with-maaz](https://github.com/coding-with-maaz)

## 🔗 Links

- **Repository**: [https://github.com/coding-with-maaz/JOB2DAY-BACKEND](https://github.com/coding-with-maaz/JOB2DAY-BACKEND)
- **Backend API**: [https://backend.harpaljob.com](https://backend.harpaljob.com)
- **Frontend**: [https://frontend.harpaljob.com](https://frontend.harpaljob.com)

## 📞 Support

For support, email support@harpaljob.com or create an issue in the repository.

---

**Made with ❤️ for job seekers and employers**

