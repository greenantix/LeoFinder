# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/5f4f0d2e-75a9-41b2-8f1d-f954e22ce4fd

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/5f4f0d2e-75a9-41b2-8f1d-f954e22ce4fd) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/5f4f0d2e-75a9-41b2-8f1d-f954e22ce4fd) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## 🚀 Deploy on Render

Deploying to Render requires special attention to environment variables.

### `FIREBASE_PRIVATE_KEY`
When adding your Firebase private key to Render's environment variables, paste the entire key as a single line, replacing newlines with `\n`. Render's environment variable editor does not correctly handle multi-line strings.

### `DATABASE_URL`
Ensure that any special characters in your Postgres password are URL-encoded. For example, `@` should be `%40`, and `:` should be `%3A`.

### Environment Variable Conflicts
You can commit a `.env.production` file and load it via `dotenv`. If you do this, you must unset those same variables in Render's dashboard to avoid conflicts. Render's environment variables will override any variables loaded from a `.env` file.
