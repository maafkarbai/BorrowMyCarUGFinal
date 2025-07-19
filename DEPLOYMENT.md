# BorrowMyCar Deployment Guide

This guide explains how to deploy the BorrowMyCar application with the backend on Render and frontend on Vercel.

## Prerequisites

- GitHub account with your code repository
- Render account (https://render.com)
- Vercel account (https://vercel.com)
- MongoDB Atlas account for database (https://mongodb.com/atlas)
- Stripe account for payments
- Twilio account for SMS (optional)
- Cloudinary account for image storage

## Backend Deployment on Render

### 1. Prepare Your Repository

Ensure your repository has the `render.yaml` file at the root level with proper configuration.

### 2. Environment Variables on Render

Log into Render and create a new Web Service. Connect your GitHub repository and set these environment variables:

```
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FRONTEND_URL=https://your-app.vercel.app
```

### 3. Deploy on Render

1. Go to https://dashboard.render.com
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Use these settings:
   - Name: borrowmycar-backend
   - Region: Choose closest to your users
   - Branch: main
   - Root Directory: (leave blank)
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Choose the free tier or your preferred plan
6. Click "Create Web Service"

### 4. Note Your Backend URL

After deployment, Render will provide a URL like `https://borrowmycar-backend.onrender.com`. You'll need this for the frontend configuration.

## Frontend Deployment on Vercel

### 1. Update Environment Variables

In the `borrowmycarfrontend/.env.production` file, update:

```
VITE_API_BASE_URL=https://borrowmycar-backend.onrender.com/api
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 2. Deploy on Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New..." and select "Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Vite
   - Root Directory: `borrowmycarfrontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variables:
   - `VITE_API_BASE_URL`: Your Render backend URL + /api
   - `VITE_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
   - `VITE_GOOGLE_MAPS_API_KEY`: Your Google Maps API key
6. Click "Deploy"

### 3. Configure Domain (Optional)

After deployment, you can add a custom domain in Vercel's project settings.

## Post-Deployment Steps

### 1. Update Backend CORS

Once you have your Vercel URL, update the `FRONTEND_URL` environment variable on Render to match your Vercel deployment URL.

### 2. Configure Stripe Webhooks

1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://borrowmycar-backend.onrender.com/api/payments/webhook`
3. Select events to listen for (payment_intent.succeeded, etc.)
4. Copy the webhook secret and update `STRIPE_WEBHOOK_SECRET` on Render

### 3. Test Your Deployment

1. Visit your Vercel URL
2. Test user registration and login
3. Test car listing and booking features
4. Test payment flow with Stripe test cards

## Monitoring and Logs

- **Render**: Check logs at https://dashboard.render.com
- **Vercel**: Check logs at https://vercel.com/dashboard

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your frontend URL is correctly set in backend environment variables
2. **API Connection Failed**: Verify the API URL in frontend environment variables
3. **Database Connection Issues**: Check MongoDB connection string and IP whitelist
4. **Payment Issues**: Verify Stripe keys and webhook configuration

### Debug Steps

1. Check browser console for errors
2. Check Network tab for failed requests
3. Review server logs on Render
4. Verify all environment variables are set correctly

## Security Checklist

- [ ] All sensitive keys are in environment variables
- [ ] HTTPS is enabled (automatic on both platforms)
- [ ] Database has proper authentication
- [ ] API rate limiting is configured
- [ ] CORS is properly restricted

## Scaling Considerations

- **Render**: Upgrade to paid plans for better performance and no sleep
- **Vercel**: Free tier is generous, upgrade for more bandwidth
- **MongoDB**: Consider upgrading cluster for production use

## Support

For platform-specific issues:
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com