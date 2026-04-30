# Alex — Creative Portfolio

A premium, single-page scroll portfolio website built with React, Tailwind CSS, and Framer Motion. Designed for creative professionals (Graphic Designers, Video Editors, Content Writers).

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## 📁 Project Structure

```
/src
  /components
    Navbar.jsx          — Fixed nav with blur + active section tracking
    Hero.jsx            — Full-screen hero with animated text & stats
    About.jsx           — Bio section with skill cards
    Projects.jsx        — Filterable project grid
    ProjectCard.jsx     — Individual project card
    VideoModal.jsx      — TikTok iframe + Instagram preview modal
    ImageLightbox.jsx   — Fullscreen image viewer with navigation
    Contact.jsx         — EmailJS-powered contact form
    Footer.jsx          — Footer + back-to-top button
    WhatsAppButton.jsx  — Floating WhatsApp bubble
  /data
    projects.js         — All project data (edit this!)
  App.jsx
  index.css             — Design tokens & global styles
```

## 🎨 Replacing Mock Data

### Projects
Edit `src/data/projects.js` — each project object has:
- `title`, `brand`, `description` — text content
- `thumbnail` — path to image (put images in `public/` or use URLs)
- `tiktokUrl` — TikTok embed URL (`https://www.tiktok.com/embed/v2/VIDEO_ID`)
- `instagramUrl` — Instagram reel URL
- `category` — `"Graphic Design"`, `"Video Editing"`, or `"Content Writing"`
- `type` — `"video"` or `"graphic"`

### Images
Replace placeholder URLs with your own. For local images:
1. Put images in `/public/images/`
2. Reference as `/images/your-image.jpg` in projects.js

### Personal Info
- **Name/brand**: Search for "Alex" across components
- **Bio text**: Edit `About.jsx`
- **Portrait**: Replace image URL in `Hero.jsx` and `About.jsx`
- **Resume**: Place your PDF at `/public/resume.pdf`

## 📧 EmailJS Setup (Step-by-Step)

EmailJS lets the contact form send emails directly to your Gmail — no backend needed.

1. **Create account**: Go to [emailjs.com](https://www.emailjs.com/) → Sign Up
2. **Add email service**:
   - Dashboard → Email Services → Add New Service
   - Select **Gmail** → Connect your account (`madhavbca23@oic.edu.np`)
   - Copy the **Service ID** (e.g., `service_abc123`)
3. **Create template**:
   - Dashboard → Email Templates → Create New Template
   - Use these variables in the template body:
     - `{{from_name}}` — sender's name
     - `{{from_email}}` — sender's email
     - `{{subject}}` — email subject
     - `{{message}}` — message content
   - Set "To Email" to your email
   - Copy the **Template ID** (e.g., `template_xyz789`)
4. **Get Public Key**:
   - Account → General tab → Copy **Public Key**
5. **Add to `.env`**:
   ```
   VITE_EMAILJS_SERVICE_ID=service_abc123
   VITE_EMAILJS_TEMPLATE_ID=template_xyz789
   VITE_EMAILJS_PUBLIC_KEY=pk_abcdef123456
   ```
6. **Restart** the dev server

## 📱 WhatsApp Button

Edit the phone number in `src/components/WhatsAppButton.jsx`:
```js
const PHONE_NUMBER = "9779800000000"; // Replace with your number
```

## 🎨 Theme Customization

All theme colors are defined as CSS custom properties in `src/index.css`:
```css
:root {
  --bg-primary:    #0f0f0f;
  --accent:        #f5a623;
  --text-primary:  #ffffff;
  /* ... etc */
}
```

## 🛠 Tech Stack

- **React 19** — UI framework
- **Tailwind CSS v4** — Utility-first styling
- **Framer Motion** — Animations & transitions
- **EmailJS** — Contact form email delivery
- **React Icons** — Icon library
- **Vite** — Build tool

## 📄 License

MIT — Free to use and modify.
