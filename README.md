# Kalou Brands — Website

Beyond Print. Beyond Expectations.

Node.js (Express) site serving the Kalou Brands marketing pages with a working contact form that emails briefs to `info@kaloubrands.com`.

## Run locally

```bash
npm install
npm start
```

Then open http://localhost:3000.

Use `npm run dev` during development for auto-restart on changes.

## Enable contact form email

Copy `.env.example` to `.env` and fill in your SMTP credentials:

```bash
cp .env.example .env
```

Until SMTP is configured, submitted briefs are logged to the server console so nothing is lost.

## Structure

- `server.js` — Express server + `/api/contact` email endpoint (Nodemailer)
- `public/` — static site (HTML, CSS, JS, images)
- `public/assets/css/styles.css` — design system (Midnight Navy / Signal Gold)
- `public/assets/js/main.js` — header, scroll reveal, filters, form submission
