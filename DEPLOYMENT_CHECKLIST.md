# LeoFinder Deployment Checklist

This document outlines the necessary environment variables for deploying the LeoFinder application to production.

## Backend (Render)

You must set the following environment variables in your Render service dashboard. The values can be found in your Supabase, Anthropic, and Firebase project settings.

- `DATABASE_URL`: The PostgreSQL connection string from your Supabase project. Use the **Transaction Pooler** URL for production.
  - **Example**: `postgresql://postgres.owwqoogrmahiwkmzvmzu:[YOUR-PASSWORD]@aws-0-us-east-2.pooler.supabase.com:6543/postgres`
- `ANTHROPIC_API_KEY`: Your API key for the Anthropic (Claude) AI service.
- `FORECLOSURE_USER`: Your username for Foreclosure.com.
- `FORECLOSURE_PASS`: Your password for Foreclosure.com.
- `FIREBASE_PROJECT_ID`: Your Firebase project ID.
- `FIREBASE_CLIENT_EMAIL`: The client email from your Firebase service account credentials.
- `FIREBASE_PRIVATE_KEY`: The private key from your Firebase service account credentials. Make sure to format it correctly, preserving newlines (`\n`).

## Frontend (Netlify)

The `VITE_API_BASE_URL` is already configured in `netlify.toml` to point to your Render backend service (`https://leofinder-backend.onrender.com`). No further action is needed for the frontend environment variables if you are deploying from the git repository.