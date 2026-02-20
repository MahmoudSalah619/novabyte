import Link from "next/link";
import "./Navbar.css";

interface NavbarProps {
  currentPage?: 'home' | 'templates' | 'scripts' | 'endpoint-converter';
}

export default function Navbar({ currentPage = 'home' }: NavbarProps) {
  return (
    <nav className="nav">
      <div className="nav-brand">
        <Link href="/">
          <span className="logo-text">novabyte</span>
        </Link>
      </div>
      <div className="nav-links">
        <Link href="/" className={currentPage === 'home' ? 'active' : ''}>
          Home
        </Link>
        <Link href="/templates" className={currentPage === 'templates' ? 'active' : ''}>
          Templates
        </Link>
        <Link href="/scripts" className={currentPage === 'scripts' ? 'active' : ''}>
          Scripts
        </Link>
        <Link href="/endpoint-converter" className={currentPage === 'endpoint-converter' ? 'active' : ''}>
          Endpoint Converter
        </Link>
      </div>
    </nav>
  );
}
