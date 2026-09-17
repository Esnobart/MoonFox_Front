import { Link } from "react-router-dom";

import css from "./Footer.module.css";

const shopLinks = [
  { to: "/catalog", label: "Catalog" },
  { to: "/catalog?sort=popular", label: "Popular" },
  { to: "/catalog", label: "Collections" },
  { to: "/catalog", label: "Artists" },
];

const supportLinks = ["Shipping", "Returns", "FAQ", "Contact Us"];

const legalLinks = ["Privacy", "Terms"];

const socialLinks = [
  {
    href: "https://www.instagram.com/moonfox.art/",
    icon: "/icons/instagram.svg",
    label: "Instagram",
  },
  {
    href: "https://www.facebook.com/moonfox.art",
    icon: "/icons/facebook.svg",
    label: "Facebook",
  },
  {
    href: "https://www.twitter.com/moonfox.art",
    icon: "/icons/twitter.svg",
    label: "Twitter",
  },
  {
    href: "https://www.tiktok.com/@moonfox.art",
    icon: "/icons/tiktok.svg",
    label: "TikTok",
  },
];

function Footer() {
  return (
    <footer className={css.footer}>
      <div className={css.footerInner}>
        <section className={css.brandBlock}>
          <Link to="/" className={css.brandLink}>
            <img src="/icons/logo3.png" alt="" className={css.logo} />
            <span className={css.brandName}>
              Moon<span>Fox</span>
            </span>
          </Link>

          <p className={css.brandText}>
            Official artist collabs, prints and merch for collectors who like
            their shelves with a little bite.
          </p>
        </section>

        <nav className={css.footerColumn} aria-label="Shop">
          <h2 className={css.columnTitle}>Shop</h2>
          {shopLinks.map((link) => (
            <Link key={link.label} to={link.to} className={css.footerLink}>
              {link.label}
            </Link>
          ))}
        </nav>

        <nav className={css.footerColumn} aria-label="Support">
          <h2 className={css.columnTitle}>Support</h2>
          {supportLinks.map((label) => (
            <button key={label} type="button" className={css.footerButton}>
              {label}
            </button>
          ))}
        </nav>

        <section className={css.subscribeBlock}>
          <div className={css.socialLinks}>
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={css.socialLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
              >
                <img
                  src={link.icon}
                  alt=""
                  className={css.socialIcon}
                  aria-hidden="true"
                />
              </a>
            ))}
          </div>
        </section>
      </div>

      <div className={css.footerBottom}>
        <p>© 2026 MoonFox. All rights reserved.</p>

        <div className={css.bottomLinks}>
          {legalLinks.map((label) => (
            <button key={label} type="button" className={css.bottomButton}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
