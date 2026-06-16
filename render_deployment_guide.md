# Render & Supabase Deployment Guide - AI News Hub MVP

This guide outlines the complete process to deploy the **AI News Hub MVP** to production using **Supabase** (PostgreSQL/Auth) and **Render** (Hosting/Cron Jobs).

---

## Part 1: Supabase Setup

### 1. Database Configuration
1. Go to [Supabase](https://supabase.com) and create a new project.
2. Retrieve your connection strings from **Project Settings > Database**:
   - **Transaction Connection String (Pooler)**: Used for `DATABASE_URL` (usually ports `6543` or `5432` with pooling parameters).
   - **Session Connection String (Direct)**: Used for `DIRECT_URL` (usually port `5432` or direct connection bypass for running migrations).
3. If using Supabase Pooler, ensure your `DATABASE_URL` uses the connection pooler address and your `DIRECT_URL` points directly to the database.

### 2. Run Database Migrations & Seed
1. Ensure your local `.env` has your active Supabase connection strings:
   ```env
   DATABASE_URL="postgres://postgres.yourproject:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgres://postgres:password@db.yourproject.supabase.co:5432/postgres"
   ```
2. Initialize and apply migrations to your remote Supabase database:
   ```bash
   npx prisma migrate dev --name init
   ```
3. Run the database seed script to populate categories, RSS sources, and default system settings:
   ```bash
   npx prisma db seed
   ```

### 3. Supabase Authentication
1. Go to **Authentication > Providers > Email** in the Supabase Dashboard.
2. Enable Email provider (and optionally disable email confirmation if you want rapid signups/testing).
3. Register your administrator email (configured in the `admin_users` table, which defaults to `admin@ainewshub.com`) using your app's frontend sign-up or directly through Supabase Auth users panel.

---

## Part 2: Render Hosting Deployment

We have configured a `render.yaml` blueprint. You can deploy using Render Blueprints or manually.

### Option A: Deploy via Render Blueprint (Recommended)
1. Commit the project files to a private GitHub repository.
2. Log into [Render](https://render.com).
3. Go to **Blueprints** and click **New Blueprint Instance**.
4. Connect your GitHub repository.
5. Render will automatically detect the `render.yaml` file and prompt you for the required environment variables:
   - `DATABASE_URL`: Your Supabase pooler connection string.
   - `DIRECT_URL`: Your Supabase direct connection string.
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase API endpoint.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous API key.
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase secret service-role API key (required to bypass RLS in admin mutations).
   - `OPENAI_API_KEY`: Your OpenAI API developer key.
   - `CRON_SECRET`: A secure random token of your choice (e.g. `s3cr3t_cr0n_t0k3n`).
   - `NEXT_PUBLIC_SITE_URL`: The URL of your deployed Render app (e.g. `https://ai-news-hub-mvp.onrender.com`).
6. Click **Approve** to build and spin up the Docker container.

### Option B: Manual Render Web Service Deployment
1. Go to the Render Dashboard, click **New > Web Service**.
2. Connect your GitHub repository.
3. Select **Docker** as the Runtime environment.
4. Set the **Build Command** and **Start Command** to empty (Render automatically detects the `Dockerfile` and builds it).
5. In **Advanced**, add the environment variables listed in Option A.
6. Click **Deploy Web Service**.

---

## Part 3: Hourly Ingestion Scheduler

To run the automated hourly RSS parser and AI summarizer, set up a Render Cron Job:

1. In the Render Dashboard, click **New > Cron Job**.
2. Configure the following parameters:
   - **Name**: `ai-news-hub-ingestion`
   - **Schedule**: `0 * * * *` (runs every hour)
   - **Command**:
     ```bash
     curl -X GET "https://YOUR-APP-NAME.onrender.com/api/cron/fetch-news?secret=YOUR_CRON_SECRET"
     ```
     *(Replace `YOUR-APP-NAME` with your actual Render deployment subdomain, and `YOUR_CRON_SECRET` with the `CRON_SECRET` environment variable you set during deployment).*
3. Click **Create Cron Job**.

---

## Part 4: Verification Checklist

1. **Verify Home Layout**: Open your deployed site. It should load rapidly and display the Hero section and "No Articles Ingested Yet" indicator.
2. **Access Admin Portal**: Go to `/admin`. You will be prompted to log in. Register a user on Supabase with the email `admin@ainewshub.com` and log in.
3. **Trigger Ingestion**: In the Admin Dashboard, navigate to the **Overview** or **Sources** tab, and click **Manual Fetch**. The spinner will run, fetch current articles, process them with OpenAI, and update the dashboard statistics.
4. **Inspect Feed**: Navigate to `/feed.xml` to verify your dynamic RSS feed.
5. **Check Sitemap**: Navigate to `/sitemap.xml` to verify search engine index compatibility.
