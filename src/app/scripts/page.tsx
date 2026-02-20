import Link from "next/link";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import "../templates/services.css";

export default function Scripts() {
  const scripts = [
    {
      name: "Database Migration Tool",
      description: "Automated database migration and seeding script with rollback support",
      category: "Database",
      language: "Node.js",
      useCase: "Database Management",
      features: ["Auto Migration", "Rollback", "Seeding", "Version Control"]
    },
    {
      name: "Bundle Optimizer",
      description: "Analyze and optimize your JavaScript bundle size for better performance",
      category: "Performance",
      language: "Node.js",
      useCase: "Build Optimization",
      features: ["Size Analysis", "Tree Shaking", "Code Splitting", "Reports"]
    },
    {
      name: "API Documentation Generator",
      description: "Auto-generate API documentation from your code comments and types",
      category: "Documentation",
      language: "TypeScript",
      useCase: "Documentation",
      features: ["Auto-generate", "OpenAPI", "Markdown", "Interactive Docs"]
    },
    {
      name: "Environment Config Manager",
      description: "Manage environment variables across multiple deployment environments",
      category: "DevOps",
      language: "Bash/Node.js",
      useCase: "Configuration",
      features: ["Multi-env", "Validation", "Encryption", "Easy Sync"]
    },
    {
      name: "Git Workflow Automation",
      description: "Automate common git workflows including branching, tagging, and releases",
      category: "Version Control",
      language: "Bash",
      useCase: "Git Automation",
      features: ["Branch Management", "Auto Tagging", "Release Notes", "Hooks"]
    },
    {
      name: "Image Optimizer",
      description: "Batch process and optimize images for web with multiple format support",
      category: "Assets",
      language: "Node.js",
      useCase: "Asset Optimization",
      features: ["Batch Process", "WebP/AVIF", "Compression", "Resize"]
    },
    {
      name: "Test Data Generator",
      description: "Generate realistic test data for development and testing purposes",
      category: "Testing",
      language: "TypeScript",
      useCase: "Testing",
      features: ["Custom Schemas", "Realistic Data", "Export Formats", "Seeding"]
    },
    {
      name: "Code Quality Checker",
      description: "Run comprehensive code quality checks and generate detailed reports",
      category: "Quality",
      language: "Node.js",
      useCase: "Code Quality",
      features: ["Linting", "Type Checking", "Coverage", "Reports"]
    }
  ];

  return (
    <div className="service-page">
      {/* Header */}
      <header className="service-header">
        <Navbar currentPage="scripts" />

        <div className="page-hero">
          <h1 className="page-title">
            Automation <span className="highlight">Scripts</span>
          </h1>
          <p className="page-subtitle">
            Powerful automation scripts to streamline your development workflow and boost productivity
          </p>
        </div>
      </header>

      {/* Scripts Grid */}
      <section className="content-section">
        <div className="scripts-grid">
          {scripts.map((script, index) => (
            <div key={index} className="script-card">
              <div className="script-header">
                <div className="script-meta">
                  <span className="script-category">{script.category}</span>
                  <span className="script-language">{script.language}</span>
                </div>
                <h3>{script.name}</h3>
                <p>{script.description}</p>
              </div>

              <div className="script-use-case">
                <span className="use-case-label">Use Case:</span>
                <span className="use-case-value">{script.useCase}</span>
              </div>

              <div className="script-features">
                {script.features.map((feature, i) => (
                  <div key={i} className="feature-badge">✓ {feature}</div>
                ))}
              </div>

              <div className="script-actions">
                <button className="btn-action btn-primary">Download</button>
                <button className="btn-action btn-secondary">View Code</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Info Section */}
      <section className="info-section">
        <div className="info-cards">
          <div className="info-card">
            <div className="info-icon">📦</div>
            <h3>Easy Installation</h3>
            <p>Simple npm or yarn commands to get started quickly</p>
          </div>
          <div className="info-card">
            <div className="info-icon">📝</div>
            <h3>Well Documented</h3>
            <p>Comprehensive documentation with examples and usage guides</p>
          </div>
          <div className="info-card">
            <div className="info-icon">🔧</div>
            <h3>Customizable</h3>
            <p>Easy to modify and adapt to your specific requirements</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer variant="service" />
    </div>
  );
}
