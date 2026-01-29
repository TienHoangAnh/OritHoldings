# TineJobs - Job Board Web Application

A full-stack job board application built with React and Node.js, allowing employers to post jobs and applicants to search and apply for positions.

## 🚀 Features

### For Applicants
- User registration and authentication
- Browse and search jobs
- Filter jobs by type and location
- View job details
- Apply for jobs with cover letter
- View all submitted applications

### For Employers
- User registration and authentication
- Create, edit, and delete job postings
- View dashboard with all posted jobs
- View applicants for each job posting
- Manage job listings

## 🛠 Tech Stack

### Frontend
- **React** - UI library
- **React Router** - Routing
- **Axios** - HTTP client
- **CSS** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📁 Project Structure

```
tinejobs/
├── client/          # React frontend
│   ├── public/
│   ├── src/
│   │   ├── api/           # API calls
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context
│   │   ├── pages/         # Page components
│   │   └── App.js
│   └── package.json
│
└── server/          # Node.js backend
    ├── config/      # Database configuration
    ├── controllers/ # Route controllers
    ├── middleware/  # Auth middleware
    ├── models/      # Mongoose models
    ├── routes/      # API routes
    └── server.js    # Entry point
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
```

4. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional, defaults to localhost):
```bash
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Jobs
- `GET /api/jobs` - Get all jobs (with optional filters: search, type, location)
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create job (Employer only)
- `PUT /api/jobs/:id` - Update job (Employer only)
- `DELETE /api/jobs/:id` - Delete job (Employer only)

### Applications
- `POST /api/applications/:jobId` - Apply for job (Applicant only)
- `GET /api/applications/my` - Get my applications (Applicant only)
- `GET /api/applications/job/:jobId` - Get applicants for job (Employer only)

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication. Tokens are stored in localStorage and automatically included in API requests.

### Protected Routes
- Routes marked as "Protected" require authentication
- Role-based routes require specific user roles:
  - Applicant routes: `applicant` role
  - Employer routes: `employer` role

## 🗄 Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "applicant" | "employer",
  createdAt: Date
}
```

### Job
```javascript
{
  title: String,
  description: String,
  company: String,
  location: String,
  salary: String,
  type: "Full-time" | "Part-time" | "Remote",
  createdBy: ObjectId (User),
  createdAt: Date
}
```

### Application
```javascript
{
  job: ObjectId (Job),
  applicant: ObjectId (User),
  coverLetter: String,
  createdAt: Date
}
```

## 🚢 Deployment

### Frontend (Vercel)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Navigate to client directory:
```bash
cd client
```

3. Deploy:
```bash
vercel
```

4. Set environment variable in Vercel dashboard:
   - `REACT_APP_API_URL` = your backend API URL

### Backend (Render)

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `cd server && npm install`
4. Set start command: `cd server && npm start`
5. Add environment variables:
   - `PORT` = 5000 (or Render's assigned port)
   - `MONGODB_URI` = your MongoDB connection string
   - `JWT_SECRET` = your secret key
   - `NODE_ENV` = production

## 👤 Demo Accounts

You can create accounts through the registration page:
- **Applicant**: Register with role "Job Seeker"
- **Employer**: Register with role "Employer"

## 📝 Notes

- Passwords are hashed using bcryptjs
- JWT tokens expire after 30 days
- Duplicate applications are prevented (one application per job per applicant)
- Employers can only edit/delete their own jobs
- Applicants can only view their own applications
- Employers can only view applications for their own jobs

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is open source and available under the MIT License.

