import Link from "next/link";
import "./Footer.css";

interface FooterProps {
  variant?: 'landing' | 'service';
}

export default function Footer({ variant = 'landing' }: FooterProps) {
  if (variant === 'service') {
    return (
      <footer className="service-footer">
        <div className="footer-content">
          <Link href="/" className="logo-text">novabyte</Link>
          <div className="footer-links">
            <Link href="/">Home</Link>
            <Link href="/templates">Templates</Link>
            <Link href="/scripts">Scripts</Link>
            <Link href="/endpoint-converter">Endpoint Converter</Link>
          </div>
        </div>
        <p className="footer-copyright">&copy; 2026 novabyte. All rights reserved.</p>
      </footer>
    );
  }

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <span className="logo-text">novabyte</span>
          <p>Building the future, byte by byte</p>
        </div>
        <div className="footer-links">
          <div className="footer-column">
            <h4>Services</h4>
            <Link href="/templates">Templates</Link>
            <Link href="/scripts">Scripts</Link>
            <Link href="/endpoint-converter">Endpoint Converter</Link>
          </div>
          <div className="footer-column">
            <h4>Company</h4>
            <Link href="#about">About</Link>
            <Link href="#features">Features</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 novabyte. All rights reserved.</p>
      </div>
    </footer>
  );
}
