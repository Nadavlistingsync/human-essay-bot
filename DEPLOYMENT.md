# Deployment Guide for Human Essay Bot

This guide covers deploying the Human Essay Bot to various hosting platforms.

## 🚀 Quick Deploy Options

### Option 1: Railway (Recommended - Free Tier Available)

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy from GitHub**
   ```bash
   # Connect your GitHub repository to Railway
   # Railway will automatically detect this is a Node.js app
   # Set environment variables in Railway dashboard:
   # - OPENAI_API_KEY=your_openai_api_key_here
   # - PORT=3000 (Railway will set this automatically)
   ```

3. **Automatic Deployment**
   - Railway will build and deploy automatically
   - Your app will be available at: `https://your-app-name.up.railway.app`

### Option 2: Render (Free Tier Available)

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Connect your GitHub repository
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Add environment variable: `OPENAI_API_KEY`

3. **Deploy**
   - Render will automatically deploy your app
   - Your app will be available at: `https://your-app-name.onrender.com`

### Option 3: Vercel (Serverless Functions)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd "/Users/nadavbenedek/Teach AI"
   vercel --prod
   ```

3. **Set Environment Variables**
   - In Vercel dashboard, add `OPENAI_API_KEY`

### Option 4: Heroku (Free Tier Discontinued, Paid Only)

1. **Install Heroku CLI** (already installed)
   ```bash
   heroku login
   ```

2. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

## 🔧 Environment Variables

Required environment variables for deployment:

```bash
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=production
PORT=3000  # Most platforms set this automatically
```

## 📝 Post-Deployment Steps

1. **Update URLs in Code**
   - Update `browser-extension.js` to point to your deployed URL
   - Update any hardcoded localhost URLs

2. **Test All Endpoints**
   - `/api/health` - Health check
   - `/api/generate-essay-simple` - Essay generation
   - `/api/analyze-style` - Style analysis
   - `/` - Main interface

3. **Update Chrome Extension**
   - Update manifest.json with your deployed URL
   - Test extension functionality

## 🐛 Troubleshooting

### Common Issues:

1. **Port Issues**
   - Most platforms use `process.env.PORT`
   - Update your code to use `const PORT = process.env.PORT || 3000`

2. **Environment Variables**
   - Ensure all required env vars are set in hosting dashboard
   - Check variable names match exactly

3. **Build Failures**
   - Check Node.js version compatibility
   - Ensure all dependencies are in package.json

4. **Memory Issues**
   - Some platforms have memory limits
   - Consider optimizing Puppeteer usage for production

## 📊 Monitoring

After deployment, monitor:
- Application logs
- API response times
- Error rates
- OpenAI API usage

## 🔄 Continuous Deployment

Set up automatic deployments:
- Railway: Connected to GitHub automatically
- Render: Connected to GitHub automatically  
- Vercel: Connected to GitHub automatically
- Heroku: `git push heroku main`

## 🎯 Production Optimizations

1. **Performance**
   - Enable compression
   - Optimize images
   - Use CDN for static assets

2. **Security**
   - Enable HTTPS
   - Add rate limiting
   - Validate all inputs

3. **Monitoring**
   - Set up error tracking
   - Monitor API usage
   - Track performance metrics
