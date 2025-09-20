# NGO Volunteer Management System

A comprehensive full-stack web application for managing volunteers and NGOs, featuring service tracking, certificate generation, and role-based access control.

## Features

### For Volunteers
- **Registration & Authentication**: Secure JWT-based authentication
- **Daily Service Tracking**: Mark daily volunteer service with a simple click
- **Progress Dashboard**: View service days, progress towards certificates, and achievements
- **Digital Certificates**: Receive and download PDF certificates after reaching service thresholds
- **Certificate Verification**: QR code-based certificate verification system

### For NGOs
- **Volunteer Management**: Approve/reject volunteer applications
- **Service Monitoring**: Track volunteer service days and contributions
- **Certificate Issuance**: Generate and issue digital certificates to eligible volunteers
- **Dashboard Analytics**: View statistics, leaderboards, and volunteer performance
- **Customizable Thresholds**: Set certificate eligibility requirements

### Technical Features
- **Role-Based Access Control**: Separate dashboards for volunteers and NGOs
- **Real-time Updates**: Live statistics and progress tracking
- **PDF Certificate Generation**: Professional certificates with QR codes
- **Email Notifications**: Automated notifications for certificate issuance
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS
- **Secure Authentication**: JWT tokens with role-based permissions

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **PDFKit** for certificate generation
- **QRCode** for verification codes
- **Nodemailer** for email notifications
- **Express Validator** for input validation
- **Helmet** for security headers
- **Rate Limiting** for API protection

### Frontend
- **Next.js** 14 with React 18
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React Hot Toast** for notifications
- **React Icons** for UI icons
- **Context API** for state management

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ngo-volunteer-management
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (backend + frontend)
npm run install-all
```

### 3. Environment Setup

#### Backend Environment
Create `server/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ngo-volunteer-management
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
NODE_ENV=development

# Email configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# Frontend URL
CLIENT_URL=http://localhost:3000
```

#### Frontend Environment
Create `client/.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Start the Application

#### Development Mode (Both Frontend & Backend)
```bash
npm run dev
```

#### Individual Services
```bash
# Backend only
npm run server

# Frontend only
npm run client
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## API Endpoints

### Authentication
- `POST /api/auth/register/volunteer` - Register new volunteer
- `POST /api/auth/register/ngo` - Register new NGO
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token

### Attendance
- `POST /api/attendance/mark` - Mark daily attendance
- `GET /api/attendance/stats` - Get volunteer statistics
- `GET /api/attendance/history` - Get attendance history
- `GET /api/attendance/volunteers/:ngoId` - Get NGO volunteers

### Volunteers
- `GET /api/volunteers/pending` - Get pending approvals
- `PUT /api/volunteers/:id/approve` - Approve volunteer
- `PUT /api/volunteers/:id/reject` - Reject volunteer
- `GET /api/volunteers/leaderboard/:ngoId` - Get leaderboard
- `GET /api/volunteers/stats/:ngoId` - Get volunteer statistics

### NGOs
- `GET /api/ngos` - Get all NGOs
- `GET /api/ngos/:id` - Get single NGO
- `PUT /api/ngos/profile` - Update NGO profile
- `PUT /api/ngos/certificate-threshold` - Update certificate threshold
- `GET /api/ngos/dashboard/:ngoId` - Get NGO dashboard

### Certificates
- `POST /api/certificates/generate` - Generate certificate
- `GET /api/certificates/volunteer` - Get volunteer certificates
- `GET /api/certificates/ngo/:ngoId` - Get NGO certificates
- `GET /api/certificates/verify/:code` - Verify certificate
- `GET /api/certificates/download/:id` - Download certificate PDF

## Database Schema

### User Model (Volunteers)
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'volunteer',
  ngoId: ObjectId (ref: NGO),
  serviceDays: Number (default: 0),
  certificates: [ObjectId] (ref: Certificate),
  isApproved: Boolean,
  lastServiceDate: Date,
  profileImage: String,
  phone: String,
  address: String
}
```

### NGO Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  description: String,
  logo: String,
  website: String,
  phone: String,
  address: Object,
  certificateThreshold: Number (default: 30),
  volunteers: [ObjectId] (ref: User),
  isVerified: Boolean,
  totalVolunteers: Number,
  totalServiceDays: Number
}
```

### Certificate Model
```javascript
{
  volunteerId: ObjectId (ref: User),
  ngoId: ObjectId (ref: NGO),
  volunteerName: String,
  ngoName: String,
  serviceDays: Number,
  issueDate: Date,
  certificateURL: String,
  qrCode: String,
  verificationCode: String (unique),
  isVerified: Boolean,
  startDate: Date,
  endDate: Date,
  status: 'active' | 'revoked' | 'expired'
}
```

## Usage Guide

### For Volunteers
1. **Register**: Sign up with your details and select an NGO
2. **Wait for Approval**: Your account will be pending until the NGO admin approves
3. **Mark Attendance**: Click "I Served Today" button daily to track service
4. **View Progress**: Check your dashboard for service days and progress
5. **Earn Certificates**: Receive certificates when you reach the threshold
6. **Download Certificates**: Download PDF certificates from your dashboard

### For NGOs
1. **Register**: Create your organization account
2. **Approve Volunteers**: Review and approve volunteer applications
3. **Monitor Service**: Track volunteer service days and contributions
4. **Issue Certificates**: Generate certificates for eligible volunteers
5. **Manage Settings**: Set certificate thresholds and organization details

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Express validator for all inputs
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Configured CORS for frontend access
- **Helmet Security**: Security headers for protection
- **Role-Based Access**: Different permissions for volunteers and NGOs

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@volunteerhub.com or create an issue in the repository.

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics and reporting
- [ ] Integration with external volunteer platforms
- [ ] Multi-language support
- [ ] Advanced certificate templates
- [ ] Volunteer matching system
- [ ] Event management features
- [ ] Social features and community building