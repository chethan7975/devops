# NGO Volunteer Management System - Single Folder Structure

## 🎉 Project Reorganized Successfully!

The project has been reorganized into a **single folder structure** for easier management and deployment.

## 📁 New Project Structure

```
ngo-volunteer-management/
├── pages/                 # Next.js Frontend Pages
│   ├── auth/              # Login/Register pages
│   ├── volunteer/         # Volunteer dashboard
│   ├── ngo/              # NGO dashboard
│   ├── verify/           # Certificate verification
│   └── _app.js           # Next.js app wrapper
├── contexts/              # React Context for auth
├── styles/               # Tailwind CSS styles
├── models/               # MongoDB schemas
├── routes/               # API endpoints
├── middleware/           # Auth middleware
├── utils/                # Email service
├── certificates/         # Generated PDFs
├── public/               # Static files
├── server.js             # Express server (main entry point)
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
├── package.json          # All dependencies in one file
├── .env                  # Environment variables
├── .env.example          # Environment template
└── start.sh              # Startup script
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
nano .env
```

### 3. Start the Application
```bash
# Option 1: Use the startup script
chmod +x start.sh
./start.sh

# Option 2: Manual start
npm run dev
```

## 📋 Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend (Next.js)
- `npm run build` - Build the frontend for production
- `npm start` - Start the production server

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 🔧 Key Changes Made

1. **Single package.json**: All dependencies (frontend + backend) in one file
2. **Unified server.js**: Express server serves both API and static files
3. **Simplified structure**: No separate client/server folders
4. **Single .env**: All environment variables in one file
5. **Updated scripts**: All npm scripts work from root directory

## 📦 Dependencies Included

### Backend Dependencies
- Express.js, MongoDB, JWT, bcryptjs
- PDFKit, QRCode, Nodemailer
- Security: Helmet, CORS, Rate Limiting

### Frontend Dependencies
- Next.js, React, Tailwind CSS
- Axios, React Hot Toast, React Icons
- Date utilities, PDF generation

## 🎯 Benefits of Single Folder Structure

1. **Simpler Deployment**: One folder to deploy
2. **Easier Development**: No need to navigate between folders
3. **Unified Dependencies**: Single package.json for all packages
4. **Shared Environment**: One .env file for all configuration
5. **Faster Setup**: Single `npm install` command

## 🔄 Migration from Separate Folders

If you had the previous structure with separate client/server folders:

1. All backend files moved to root: `models/`, `routes/`, `middleware/`, `utils/`
2. All frontend files moved to root: `pages/`, `contexts/`, `styles/`
3. Single `package.json` with all dependencies
4. Single `server.js` as main entry point
5. Single `.env` file for configuration

## 🚀 Ready to Use!

The application is now in a single folder structure and ready to run. All features remain the same:

- ✅ Volunteer registration and dashboard
- ✅ NGO management and approval system
- ✅ Daily service tracking
- ✅ Certificate generation with QR codes
- ✅ Email notifications
- ✅ Responsive design
- ✅ Security features

Just run `./start.sh` or `npm run dev` to get started!