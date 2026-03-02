import React from 'react';

interface HeaderProps {
  /** Base path for links (e.g. '' for root, '../' for subpages) */
  basePath?: string;
}

export default function Header({ basePath = '' }: HeaderProps) {
  const indexHref = basePath ? `${basePath}index.html` : 'index.html';
  const appDownloadsHref = basePath ? `${basePath}index.html#app-downloads` : '#app-downloads';

  return (
    <header>
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="logo">
          <a href={indexHref}>
            <img
              src={`${basePath}images/Color logo with background.png.png`}
              alt="Alfred - The Leading AI Trip Planner and AI Holiday Planner App"
              className="logo-image"
            />
          </a>
        </div>
        <ul className="nav-links">
          <li><a href={basePath ? `${basePath}index.html` : 'index.html'}>Home</a></li>
          <li><a href={`${basePath}about.html`}>About Us</a></li>
          <li><a href={`${basePath}products.html`}>Our Features</a></li>
          <li><a href={`${basePath}blog/index.html`}>Blog</a></li>
          <li><a href={`${basePath}faq.html`}>FAQ</a></li>
          <li><a href={`${basePath}faq.html#tutorials`}>Tutorials</a></li>
          <li><a href={`${basePath}delete-account.html`}>Support</a></li>
        </ul>
        <a
          href={appDownloadsHref}
          className="download-cta"
          aria-label="Download the AI Holiday Planner"
        >
          Download App
        </a>
        <div className="hamburger" aria-label="Open menu">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </nav>
    </header>
  );
}
