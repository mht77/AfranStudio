# Afran Design Studio — website

Persian (RTL) website for **Afran Design Studio** (استودیو طراحی و معماری افران).
Plain HTML, CSS and JavaScript, with no build step. It is hosted on GitHub Pages, and its content is edited with [Pages CMS](https://pagescms.org).

## Structure

```
index.html          Home
projects.html       Projects index (filters by service, grid / list view)
project.html        Project detail — project.html?p=<slug>
studio.html         Studio, process, services
team.html           Founder and team
contact.html        Contact details and project form
404.html            Not-found page (served by GitHub Pages)

content/            Editable content (JSON, managed by Pages CMS)
  site.json         Contact details, services, form endpoint, SEO description
  home.json         Home page texts and images
  projects.json     All projects (cards, details, facts, gallery)
  studio.json       Studio page
  team.json         Founder, stats, team members
assets/
  css/main.css      All styles
  js/app.js         Loads content/*.json and renders pages, header, menu, footer
  fonts/            Self-hosted Vazirmatn + Arimo (Google Fonts is unreliable in Iran)
  images/           All images (Pages CMS uploads go here)
.pages.yml          Pages CMS configuration
.github/workflows/  GitHub Pages deployment
```

### What is editable in the CMS and what is not

Everything that changes with the studio's work can be edited in the CMS:

- every project
- every image
- page texts
- services
- the founder and team members
- contact details, including WhatsApp and Instagram

Things that rarely change live in code:

- the menu and footer links (the `NAV` list at the top of `assets/js/app.js`)
- form labels and small section labels (in the HTML files)
- colours and fonts (the tokens at the top of `assets/css/main.css`)

To add a new **service / project category**, add it to the two `select` option lists in `.pages.yml`. They are the `category` field of projects and the `id` field of services. Then add the service itself in the CMS.

## Run locally

The pages load JSON with `fetch`, so open them through a local server, not from the file system:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy (GitHub Pages)

1. In the repository go to **Settings → Pages** and set **Source** to **GitHub Actions**.
2. Push to `main`. The workflow in `.github/workflows/pages.yml` publishes the site.
   The address will be `https://mht77.github.io/AfranStudio-/` until a custom domain is added.

All links and asset paths are relative, so the same files work both at the `/AfranStudio-/` sub-path and later on a custom domain. For a custom domain, add it under **Settings → Pages → Custom domain**.

## Content editing (Pages CMS)

1. Go to <https://app.pagescms.org> and sign in with GitHub.
2. Install the Pages CMS GitHub app for this repository when asked, then open the repository and the `main` branch.
3. Edit content: Projects, Home, Studio, Team, Site settings. Images go to the Media section (`assets/images`).

Every save in the CMS is a commit to `main`, and the site redeploys automatically within a minute or two.

## Contact form

The form posts to a form service. It is set up for [Formspree](https://formspree.io), whose free plan includes 50 submissions a month.

1. Create a Formspree form that sends to the studio's email address.
2. Copy its endpoint (`https://formspree.io/f/xxxxxxx`) into **Site settings → آدرس فرم تماس (Formspree)** in the CMS.

Until an endpoint is set, the submit button opens the visitor's own email app with the message pre-filled, addressed to the studio's email address.
