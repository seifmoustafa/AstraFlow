import Link from "next/link";
import { UI_COPY } from "@/content/ui-copy";

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="site-wrap">
        <div className="footer-in">
          <div>
            <Link href="/" className="brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/mark-on-dark.svg"
                alt=""
                width={40}
                height={36}
              />
              <strong>{UI_COPY.brand.name}</strong>{' '}
              <small className="mono v11-footer-tagline">
                {UI_COPY.brand.tagline}
              </small>
            </Link>
            <h2>
              {UI_COPY.footer.headlineTop}
              <br />
              <span className="ital" style={{ color: "var(--peach)" }}>
                {UI_COPY.footer.headlineAccent}
              </span>
            </h2>
            <p style={{ color: "#b5cabb" }}>{UI_COPY.footer.description}</p>
          </div>

          <div className="footer-links">
            {UI_COPY.footer.columns.map((column) => (
              <div key={column.heading}>
                <b className="tiny">{column.heading}</b>
                {column.links.map((link) => {
                  const isExternal = link.href.startsWith("http");
                  return isExternal ? (
                    <a
                      key={link.label}
                      href={link.href}
                      rel="noreferrer noopener"
                      target="_blank"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link key={link.label} href={link.href}>
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <span>{UI_COPY.footer.bottomLeft}</span>
          <span>{UI_COPY.footer.bottomRight}</span>
        </div>
      </div>
    </footer>
  );
}
