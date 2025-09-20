# VolunteerHub - Deployment Guide

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Local Development Setup

1. **Clone and navigate to the project:**
   ```bash
   cd ngo-volunteering-platform
   ```

2. **Install dependencies:**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Configure environment variables:**
   
   **Backend (.env):**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ngo_volunteering
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   JWT_EXPIRE=30d
   CLIENT_URL=http://localhost:3000
   ```
   
   **Frontend (.env.local):**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_CLIENT_URL=http://localhost:3000
   ```

4. **Start development servers:**
   ```bash
   # Option 1: Use the provided script
   ./start-dev.sh
   
   # Option 2: Start manually
   # Terminal 1 (Backend)
   cd backend && npm run dev
   
   # Terminal 2 (Frontend)
   cd frontend && npm run dev
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - Health Check: http://localhost:5000/api/health

## 🌐 Production Deployment

### Backend Deployment (Node.js/Express)

#### Option 1: Heroku
```bash
# Install Heroku CLI
heroku create your-app-name-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_atlas_uri
heroku config:set JWT_SECRET=your_production_jwt_secret
heroku config:set CLIENT_URL=https://your-frontend-domain.com

# Deploy
git subtree push --prefix backend heroku main
```

#### Option 2: DigitalOcean/AWS/VPS
```bash
# Build and start
cd backend
npm install --production
npm start

# Use PM2 for process management
npm install -g pm2
pm2 start server.js --name "volunteerhub-api"
pm2 startup
pm2 save
```

### Frontend Deployment (Next.js)

#### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from frontend directory
cd frontend
vercel

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
# NEXT_PUBLIC_CLIENT_URL=https://your-frontend-domain.com
```

#### Option 2: Netlify
```bash
# Build the application
cd frontend
npm run build

# Deploy to Netlify (upload dist folder)
# Or connect GitHub repo to Netlify
```

### Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas account**
2. **Create a new cluster**
3. **Create database user**
4. **Whitelist IP addresses**
5. **Get connection string:**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/ngo_volunteering
   ```

## 🔒 Security Checklist for Production

- [ ] Change default JWT secret to a strong, random string
- [ ] Use HTTPS for both frontend and backend
- [ ] Set up proper CORS origins
- [ ] Enable MongoDB authentication
- [ ] Use environment variables for all sensitive data
- [ ] Set up proper error logging
- [ ] Configure rate limiting
- [ ] Set up database backups

## 📊 Monitoring & Maintenance

### Recommended Tools
- **Monitoring**: New Relic, DataDog, or Sentry
- **Logging**: Winston (backend), Vercel Analytics (frontend)
- **Database**: MongoDB Compass, Atlas monitoring
- **Uptime**: Pingdom, UptimeRobot

### Backup Strategy
- Daily MongoDB backups
- Code repository backups
- Certificate file backups

## 🔧 Environment Variables Reference

### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb://localhost:27017/ngo_volunteering

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=30d

# CORS
CLIENT_URL=https://your-frontend-domain.com

# Email (Optional - for future features)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Frontend (.env.local)
```env
# API Configuration
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NEXT_PUBLIC_CLIENT_URL=https://your-frontend-domain.com
```

## 🧪 Testing the Deployment

### Backend Health Check
```bash
curl https://your-api-domain.com/api/health
```

### Frontend Accessibility
```bash
curl -I https://your-frontend-domain.com
```

### Database Connection Test
Check MongoDB Atlas connection logs or use MongoDB Compass.

## 📈 Scaling Considerations

### Backend Scaling
- Use load balancers (AWS ALB, Nginx)
- Implement Redis for session storage
- Consider microservices architecture for large scale
- Use CDN for static assets

### Database Scaling
- MongoDB Atlas auto-scaling
- Read replicas for heavy read operations
- Sharding for very large datasets

### Frontend Scaling
- Vercel automatically handles scaling
- Use CDN for global content delivery
- Implement caching strategies

## 🚨 Troubleshooting

### Common Issues

**Backend not starting:**
- Check MongoDB connection
- Verify environment variables
- Check port availability

**Frontend build errors:**
- Clear node_modules and reinstall
- Check TypeScript errors
- Verify API URL configuration

**Database connection issues:**
- Check MongoDB URI format
- Verify network access in Atlas
- Confirm database user permissions

**CORS errors:**
- Verify CLIENT_URL in backend .env
- Check API URL in frontend .env
- Confirm CORS middleware setup

### Debug Commands
```bash
# Check backend logs
npm run dev # Development
pm2 logs # Production

# Check frontend build
npm run build
npm run start

# Test API endpoints
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password","role":"volunteer"}'
```

## 📞 Support

For deployment support:
1. Check the main README.md for detailed setup instructions
2. Review the API documentation
3. Check GitHub issues for common problems
4. Contact the development team

## 🔄 CI/CD Pipeline (Optional)

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd backend && npm install
      - run: cd backend && npm test
      - uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "your-app-name-api"
          heroku_email: "your-email@example.com"
          appdir: "backend"

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd frontend && npm install
      - run: cd frontend && npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
          working-directory: ./frontend
```