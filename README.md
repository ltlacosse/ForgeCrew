# ForgeCrew

**Brotherhood Built** — A social app for men to find and join local crews based on shared interests.

## What's Included

- 🎨 Complete UI with gentleman's club aesthetic
- 👤 User onboarding flow
- 🏠 Home screen with recommended crews
- 🔍 Explore screen with seasonal campaigns
- 💬 Messages and group chat
- 👤 Profile with stats and achievements
- 💳 Premium subscription modal
- 💰 Event payment flow
- 🔔 Notifications panel

## Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy to Vercel (Free)

### Option 1: One-Click Deploy

1. Push this code to a GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Click "Deploy"

That's it! Vercel will give you a live URL like `forgecrew.vercel.app`

### Option 2: Deploy via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (follow the prompts)
vercel

# Deploy to production
vercel --prod
```

## Project Structure

```
forgecrew-app/
├── app/
│   ├── globals.css      # Global styles + Tailwind
│   ├── layout.js        # Root layout with metadata
│   └── page.js          # Main page
├── components/
│   └── ForgeCrew.js     # Main app component
├── public/              # Static assets (add favicon, images here)
├── package.json
├── next.config.js
├── tailwind.config.js
└── postcss.config.js
```

## What's NOT Included (Yet)

This is a **frontend prototype**. To make it a real app, you'll need:

- [ ] Database (Supabase, Firebase, or PostgreSQL)
- [ ] User authentication
- [ ] Stripe integration for real payments
- [ ] Backend API
- [ ] Push notifications
- [ ] Image uploads

## Next Steps

1. **Deploy this prototype** to get a live URL you can share
2. **Collect feedback** from potential users
3. **Add Supabase** for database + auth
4. **Integrate Stripe** for payments
5. **Consider React Native** for mobile app stores

## Tech Stack

- **Framework:** Next.js 14
- **Styling:** Tailwind CSS + Custom CSS
- **Fonts:** Playfair Display, Crimson Pro
- **Hosting:** Vercel (recommended)

## Customization

### Colors
Edit `tailwind.config.js` and `app/globals.css` to change the color scheme.

### Content
Edit `components/ForgeCrew.js` to modify:
- Interest categories
- Sample crews
- Pricing
- Copy/text

---

Built with 🔥 for the modern gentleman.
