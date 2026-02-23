"use client";

import Link from "next/link";
import { useState } from "react";
import "./Navbar.css";

interface NavbarProps {
  currentPage?: "home" | "templates" | "scripts" | "endpoint-converter";
}

export default function Navbar({ currentPage = "home" }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleToggle = () => {
    setIsMenuOpen((open) => !open);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="nav">
      <div className="nav-brand">
        <Link href="/">
          <span className="logo-text">novabyte</span>
        </Link>
      </div>

      <button
        type="button"
        className={`nav-toggle ${isMenuOpen ? "open" : ""}`}
        aria-label="Toggle navigation"
        aria-expanded={isMenuOpen}
        onClick={handleToggle}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`nav-links ${isMenuOpen ? "is-open" : ""}`}>
        <Link
          href="/"
          className={currentPage === "home" ? "active" : ""}
          onClick={handleLinkClick}
        >
          Home
        </Link>
        <Link
          href="/templates"
          className={currentPage === "templates" ? "active" : ""}
          onClick={handleLinkClick}
        >
          Templates
        </Link>
        <Link
          href="/scripts"
          className={currentPage === "scripts" ? "active" : ""}
          onClick={handleLinkClick}
        >
          Developer Toolkit
        </Link>
        <Link
          href="/endpoint-converter"
          className={currentPage === "endpoint-converter" ? "active" : ""}
          onClick={handleLinkClick}
        >
          Endpoint Converter
        </Link>
      </div>
    </nav>
  );
}
