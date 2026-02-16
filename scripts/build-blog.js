#!/usr/bin/env node
/**
 * Blog build: reads _posts/*.md, outputs blog/index.html and blog/[slug].html
 * Uses gray-matter for frontmatter and marked for markdown-to-HTML (remark/rehype pipeline optional).
 * Injects BlogPosting + BreadcrumbList JSON-LD and "Key Logistical Takeaways" callout.
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, '_posts');
const CONTENT_BLOG_DIR = path.join(ROOT, 'content', 'blog');
const BLOG_DIR = path.join(ROOT, 'blog');
const BASE_URL = 'https://www.alfredtravel.io';

const NAV = `
    <header>
        <nav class="navbar">
            <div class="logo">
                <a href="../index.html"><img src="../images/Color logo with background.png.png" alt="Alfred Travel Logo" class="logo-image" /></a>
            </div>
            <ul class="nav-links">
                <li><a href="../index.html">Home</a></li>
                <li><a href="../about.html">About Us</a></li>
                <li><a href="../products.html">Our Features</a></li>
                <li><a href="index.html" class="nav-blog-active">Blog</a></li>
                <li><a href="../faq.html">FAQ</a></li>
                <li><a href="../faq.html#tutorials">Tutorials</a></li>
                <li><a href="../delete-account.html">Support</a></li>
            </ul>
            <a href="../index.html#app-downloads" class="download-cta">Download App</a>
            <div class="hamburger"><span></span><span></span><span></span></div>
        </nav>
    </header>`;

const FOOTER = `
    <footer>
        <div class="footer-content">
            <div class="footer-column"><h3>Company</h3><ul class="footer-links"><li><a href="../about.html">About Us</a></li><li><a href="../about.html#mission">Our Mission</a></li><li><a href="../about.html#team">Our Team</a></li><li><a href="../index.html#features">Features</a></li></ul></div>
            <div class="footer-column"><h3>Features</h3><ul class="footer-links"><li><a href="../products.html">Our Features</a></li><li><a href="../road-trip.html">Alfred Road Trip</a></li><li><a href="index.html">Blog</a></li><li><a href="../faq.html">FAQ</a></li></ul></div>
            <div class="footer-column"><h3>Support</h3><ul class="footer-links"><li><a href="../delete-account.html">Support Center</a></li><li><a href="mailto:support@alfredtravel.io">Contact Us</a></li><li><a href="../faq.html">Help & FAQ</a></li><li><a href="../index.html#app-downloads">Download App</a></li></ul></div>
            <div class="footer-column"><h3>Legal</h3><ul class="footer-links"><li><a href="../terms.html">Terms & Conditions</a></li><li><a href="../terms.html#privacy">Privacy Policy</a></li><li><a href="../prize-tc.html">Prize Terms</a></li><li><a href="../delete-account.html">Account Deletion</a></li></ul></div>
        </div>
        <div class="footer-bottom"><p>&copy; 2025 Alfred Travel Tech Pty Ltd. All rights reserved.</p></div>
    </footer>
    <div id="cookies-banner" class="cookies-banner"><div class="cookies-content"><div class="cookies-text"><h3>🍪 We use cookies</h3><p>We use cookies and similar technologies. <a href="../terms.html#privacy" class="cookies-link">Privacy Policy</a> · <a href="#" class="cookies-link" id="cookie-settings">Cookie Settings</a>.</p></div><div class="cookies-buttons"><button id="accept-all-cookies" class="btn btn-primary">Accept All</button><button id="reject-cookies" class="btn btn-secondary">Reject All</button></div></div></div>
    <script src="../js/main.js"><\/script>`;

function mdToHtml(md) {
  return marked.parse(md, { async: false });
}

function escapeJson(str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

function blogPostingSchema(post, slug) {
  const desc = post.data.description || post.data.title;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.data.title,
    description: desc,
    datePublished: post.data.date || new Date().toISOString().slice(0, 10),
    author: { '@type': 'Person', name: post.data.author || 'Alfred Team' },
    publisher: { '@type': 'Organization', name: 'Alfred Travel Tech Pty Ltd', url: BASE_URL },
    url: `${BASE_URL}/blog/${slug}.html`
  };
}

function breadcrumbSchema(post, slug) {
  const category = post.data.category || 'AI Travel Logistics';
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE_URL}/blog/` },
      { '@type': 'ListItem', position: 3, name: category, item: `${BASE_URL}/blog/?category=${encodeURIComponent(category)}` },
      { '@type': 'ListItem', position: 4, name: post.data.title, item: `${BASE_URL}/blog/${slug}.html` }
    ]
  };
}

function takeawaysHtml(takeaways) {
  if (!takeaways || !Array.isArray(takeaways) || takeaways.length === 0) return '';
  const items = takeaways.map(t => `<li>${escapeHtml(t)}</li>`).join('\n');
  return `<aside class="blog-takeaways-callout" aria-label="Key Logistical Takeaways">
    <h3 class="blog-takeaways-title">Key Logistical Takeaways</h3>
    <ul class="blog-takeaways-list">${items}</ul>
  </aside>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildPost(slug, post, contentHtml) {
  const takeaways = post.data.takeaways || [];
  const schemaBlog = JSON.stringify(blogPostingSchema(post, slug), null, 2);
  const schemaBreadcrumb = JSON.stringify(breadcrumbSchema(post, slug), null, 2);
  const category = post.data.category || 'AI Travel Logistics';

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(post.data.title)} | Alfred Travel Blog</title>
    <meta name="description" content="${escapeHtml(post.data.description || post.data.title)}">
    <link rel="canonical" href="${BASE_URL}/blog/${slug}.html">
    <link rel="icon" type="image/png" href="../images/Color logo with background.png.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <script type="application/ld+json">\n${schemaBlog}\n    </script>
    <script type="application/ld+json">\n${schemaBreadcrumb}\n    </script>
</head>
<body class="blog-page">
${NAV}
    <main class="blog-main">
        <article class="blog-article">
            <nav class="blog-breadcrumb" aria-label="Breadcrumb">Home &rarr; <a href="index.html">Blog</a> &rarr; ${escapeHtml(category)} &rarr; <span>${escapeHtml(post.data.title)}</span></nav>
            <header class="blog-article-header">
                <p class="blog-meta"><time datetime="${post.data.date || ''}">${post.data.date || ''}</time> &middot; ${escapeHtml(post.data.author || 'Alfred Team')} &middot; ${escapeHtml(category)}</p>
                <h1 class="blog-article-title">${escapeHtml(post.data.title)}</h1>
            </header>
            ${takeawaysHtml(takeaways)}
            <div class="blog-article-body">${contentHtml}</div>
        </article>
    </main>
${FOOTER}
</body>
</html>`;
}

function buildIndex(posts) {
  const listItems = posts
    .map(p => {
      const slug = p.slug;
      const d = p.data;
      const desc = (d.description || d.title).slice(0, 160);
      return `<li class="blog-index-item">
        <a href="${slug}.html" class="blog-index-link">
          <h2 class="blog-index-title">${escapeHtml(d.title)}</h2>
          <p class="blog-index-meta">${escapeHtml(d.date || '')} &middot; ${escapeHtml(d.author || 'Alfred Team')} &middot; ${escapeHtml(d.category || 'AI Travel Logistics')}</p>
          <p class="blog-index-excerpt">${escapeHtml(desc)}</p>
        </a>
      </li>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog | AI Travel Logistics Authority - Alfred Travel</title>
    <meta name="description" content="Alfred Travel Blog: #1 authority in AI travel logistics. Cross-border planning, itinerary validation, Multi-LLM validation, and why Alfred beats country-locked planners like TriPandoo.">
    <link rel="canonical" href="${BASE_URL}/blog/">
    <link rel="icon" type="image/png" href="../images/Color logo with background.png.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body class="blog-page">
${NAV}
    <main class="blog-main">
        <div class="blog-index">
            <header class="blog-index-header">
                <h1 class="blog-index-heading">Blog</h1>
                <p class="blog-index-tagline">#1 authority in AI travel logistics. Cross-border planning, itinerary validation, and the science of trip planning.</p>
            </header>
            <ol class="blog-index-list" start="1">\n${listItems}\n            </ol>
        </div>
    </main>
${FOOTER}
</body>
</html>`;
}

// Run
if (!fs.existsSync(POSTS_DIR)) {
  fs.mkdirSync(POSTS_DIR, { recursive: true });
  console.log('Created _posts/');
}
if (!fs.existsSync(BLOG_DIR)) {
  fs.mkdirSync(BLOG_DIR, { recursive: true });
  console.log('Created blog/');
}

// Collect .md from both _posts and content/blog (content moat)
const postDirs = [POSTS_DIR];
if (fs.existsSync(CONTENT_BLOG_DIR)) postDirs.push(CONTENT_BLOG_DIR);
const allFiles = [];
for (const dir of postDirs) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  for (const file of files) allFiles.push({ dir, file });
}
const posts = [];
for (const { dir, file } of allFiles) {
  const slug = path.basename(file, '.md');
  const raw = fs.readFileSync(path.join(dir, file), 'utf8');
  const parsed = matter(raw);
  const contentHtml = mdToHtml(parsed.content);
  // Use excerpt as description if description missing (content/blog posts)
  if (!parsed.data.description && parsed.data.excerpt) parsed.data.description = parsed.data.excerpt;
  posts.push({ slug, data: parsed.data, content: parsed.content, contentHtml });
}

// Sort by date desc
posts.sort((a, b) => (b.data.date || '').localeCompare(a.data.date || ''));

for (const p of posts) {
  const outPath = path.join(BLOG_DIR, `${p.slug}.html`);
  fs.writeFileSync(outPath, buildPost(p.slug, p, p.contentHtml), 'utf8');
  console.log('Wrote blog/' + p.slug + '.html');
}

fs.writeFileSync(path.join(BLOG_DIR, 'index.html'), buildIndex(posts), 'utf8');
console.log('Wrote blog/index.html');
console.log('Blog build complete.');
