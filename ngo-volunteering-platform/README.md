# VolunteerHub - NGO Volunteering Management Platform

A comprehensive full-stack web application for managing NGO volunteers, tracking service days, and issuing verified certificates.

## Features

### For Volunteers
- **Registration & Authentication**: Sign up and get approved by NGOs
- **Daily Check-in**: Simple one-click system to mark volunteer service
- **Progress Tracking**: View total service days and progress toward certificates
- **Digital Certificates**: Earn verified PDF certificates with QR codes
- **Dashboard**: Comprehensive view of volunteering stats and achievements

### For NGOs
- **Volunteer Management**: Approve/reject volunteer registrations
- **Service Tracking**: Monitor volunteer activity and service days
- **Certificate Issuance**: Generate and distribute digital certificates
- **Analytics**: View volunteer statistics and leaderboards
- **Configurable Thresholds**: Set custom service day requirements for certificates

### Core Features
- **JWT Authentication**: Secure role-based access control
- **PDF Certificate Generation**: Professional certificates with QR verification
- **QR Code Verification**: Public certificate verification system
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Real-time Updates**: Live dashboard updates and notifications

## Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **React Hook Form**: Form handling and validation
- **Axios**: HTTP client for API requests
- **React Hot Toast**: Toast notifications

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT**: JSON Web Token authentication
- **PDFKit**: PDF generation for certificates
- **QRCode**: QR code generation for verification
- **bcryptjs**: Password hashing

## Project Structure

```
ngo-volunteering-platform/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Authentication middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── certificates/    # Generated PDF certificates
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── app/         # Next.js app directory
│   │   ├── components/  # React components
│   │   ├── context/     # React context providers
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utility libraries
│   │   └── types/       # TypeScript type definitions
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ngo-volunteering-platform
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   
   # Copy environment variables
   cp .env.example .env
   # Edit .env with your MongoDB URI and other settings
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   
   # Copy environment variables
   cp .env.local.example .env.local
   # Edit .env.local with your API URL
   ```

### Configuration

#### Backend Environment Variables (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ngo_volunteering
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=30d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLIENT_URL=http://localhost:3000
```

#### Frontend Environment Variables (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_CLIENT_URL=http://localhost:3000
```

### Running the Application

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   Server will run on http://localhost:5000

3. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   Application will be available at http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/register/volunteer` - Register a new volunteer
- `POST /api/auth/register/ngo` - Register a new NGO
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Volunteer Routes
- `GET /api/volunteer/ngos` - Get all NGOs for registration
- `POST /api/volunteer/checkin` - Mark daily service
- `GET /api/volunteer/dashboard` - Get volunteer dashboard data
- `GET /api/volunteer/history` - Get service history

### NGO Routes
- `GET /api/ngo/dashboard` - Get NGO dashboard data
- `GET /api/ngo/volunteers` - Get volunteers list
- `PUT /api/ngo/volunteers/:id/approve` - Approve/reject volunteer
- `PUT /api/ngo/certificate-threshold` - Update certificate threshold

### Certificate Routes
- `POST /api/certificates/issue/:volunteerId` - Issue certificate
- `GET /api/certificates/download/:certificateId` - Download certificate
- `GET /api/certificates/verify/:verificationCode` - Verify certificate
- `GET /api/certificates/my-certificates` - Get volunteer certificates
- `GET /api/certificates/issued` - Get NGO issued certificates

## Database Models

### User (Volunteer)
- Personal information (name, email, password)
- NGO association and approval status
- Service days and history
- Certificate references

### NGO
- Organization details and contact information
- Certificate threshold configuration
- Volunteer and certificate references

### Certificate
- Volunteer and NGO references
- Service period and days
- Verification codes and QR data
- PDF file references

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Volunteer and NGO role separation
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured for specific origins

## Deployment

### Backend Deployment
1. Set up MongoDB Atlas or other cloud database
2. Configure environment variables for production
3. Deploy to platforms like Heroku, DigitalOcean, or AWS
4. Ensure HTTPS for secure JWT transmission

### Frontend Deployment
1. Build the Next.js application: `npm run build`
2. Deploy to Vercel, Netlify, or other static hosting
3. Update API URLs for production environment
4. Configure domain and SSL certificates

## Future Enhancements

- [ ] Email notifications for certificate issuance
- [ ] Advanced analytics and reporting
- [ ] Mobile app development
- [ ] Integration with payment systems
- [ ] Multi-language support
- [ ] Advanced volunteer matching algorithms
- [ ] Social features and volunteer networking

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@volunteerhub.com or create an issue in the GitHub repository.