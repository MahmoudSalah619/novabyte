import Link from "next/link";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import "./landing.css";

export default function Home() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <header className="hero">
        <Navbar currentPage="home" />
        
        <div className="hero-content">
          <h1 className="hero-title">
            Build Faster with <span className="highlight">novabyte</span>
          </h1>
          <p className="hero-subtitle">
            Powerful templates, essential scripts, and seamless endpoint conversion for modern development
          </p>
          <div className="hero-cta">
            <Link href="#services" className="btn btn-primary">
              Explore Services
            </Link>
            <Link href="#about" className="btn btn-secondary">
              Learn More
            </Link>
          </div>
        </div>
      </header>

      {/* Services Section */}
      <section id="services" className="services">
        <h2 className="section-title">Our Services</h2>
        <div className="services-grid">
          <Link href="/templates" className="service-card">
            <div className="service-icon">📦</div>
            <h3>Templates</h3>
            <p>Ready-to-use project templates and boilerplates to kickstart your development</p>
            <span className="service-link">Explore Templates →</span>
          </Link>

          <Link href="/scripts" className="service-card">
            <div className="service-icon">⚡</div>
            <h3>Scripts</h3>
            <p>Automation scripts and utilities to streamline your workflow and boost productivity</p>
            <span className="service-link">Browse Scripts →</span>
          </Link>

          <Link href="/endpoint-converter" className="service-card">
            <div className="service-icon">🔄</div>
            <h3>Endpoint Converter</h3>
            <p>Convert and manage API endpoints with RTK Query integration for seamless state management</p>
            <span className="service-link">Try Converter →</span>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <h2 className="section-title">Why Choose novabyte?</h2>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">🚀</div>
            <h3>Lightning Fast</h3>
            <p>Optimized for performance and speed</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🎨</div>
            <h3>Modern Design</h3>
            <p>Beautiful and intuitive user interfaces</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🔧</div>
            <h3>Easy to Use</h3>
            <p>Simple integration with your existing projects</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📱</div>
            <h3>Responsive</h3>
            <p>Works seamlessly across all devices</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="about-content">
          <h2 className="section-title">About novabyte</h2>
          <p>
            novabyte is your go-to platform for modern development tools. We provide high-quality templates, 
            powerful scripts, and innovative solutions like our RTK-based endpoint converter to help developers 
            build better applications faster.
          </p>
          <p>
            Whether you're starting a new project or enhancing an existing one, novabyte has the tools you need 
            to succeed.
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer variant="landing" />
    </div>
  );
}
