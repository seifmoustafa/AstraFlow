import Link from "next/link";
import { getTranslations } from 'next-intl/server';
import { FOOTER_COLUMNS } from './navigation';

export async function SiteFooter() {
  const tBrand = await getTranslations('core.brand');
  const t = await getTranslations('core.footer');

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
              <strong>{tBrand('name')}</strong>{' '}
              <small className="mono v11-footer-tagline">
                {tBrand('tagline')}
              </small>
            </Link>
            <h2>
              {t('headlineTop')}
              <br />
              <span className="ital" style={{ color: "var(--peach)" }}>
                {t('headlineAccent')}
              </span>
            </h2>
            <p style={{ color: "#b5cabb" }}>{t('description')}</p>
          </div>

          <div className="footer-links">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.key}>
                <b className="tiny">{t(`columns.${column.key}`)}</b>
                {column.links.map((link) => {
                  const isExternal = link.href.startsWith("http");
                  return isExternal ? (
                    <a
                      key={link.key}
                      href={link.href}
                      rel="noreferrer noopener"
                      target="_blank"
                    >
                      {t(`links.${link.key}`)}
                    </a>
                  ) : (
                    <Link key={link.key} href={link.href}>
                      {t(`links.${link.key}`)}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <span>{t('bottomLeft')}</span>
          <span>{t('bottomRight')}</span>
        </div>
      </div>
    </footer>
  );
}
