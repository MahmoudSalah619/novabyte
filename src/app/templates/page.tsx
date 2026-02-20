import Link from "next/link";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import "./services.css";

export default function Templates() {
  const templates = [
    {
      name: "Next.js Starter",
      description: "Full-featured Next.js template with TypeScript, Tailwind CSS, and authentication",
      category: "Web Framework",
      tags: ["Next.js", "TypeScript", "Tailwind"],
      features: ["Authentication", "API Routes", "Dark Mode", "Responsive"]
    },
    {
      name: "React Dashboard",
      description: "Professional admin dashboard template with charts, tables, and analytics",
      category: "Dashboard",
      tags: ["React", "Redux", "Charts"],
      features: ["Analytics", "Data Visualization", "User Management", "Export Tools"]
    },
    {
      name: "Express API Server",
      description: "RESTful API template with authentication, validation, and documentation",
      category: "Backend",
      tags: ["Node.js", "Express", "MongoDB"],
      features: ["JWT Auth", "Validation", "Swagger Docs", "Error Handling"]
    },
    {
      name: "E-commerce Store",
      description: "Complete e-commerce solution with cart, checkout, and payment integration",
      category: "E-commerce",
      tags: ["Next.js", "Stripe", "Database"],
      features: ["Shopping Cart", "Payment Gateway", "Order Management", "Admin Panel"]
    },
    {
      name: "Blog Platform",
      description: "Modern blog template with CMS integration and SEO optimization",
      category: "Content",
      tags: ["Next.js", "MDX", "SEO"],
      features: ["CMS Integration", "SEO Optimized", "Comments", "RSS Feed"]
    },
    {
      name: "Mobile App Starter",
      description: "React Native template with navigation, state management, and API integration",
      category: "Mobile",
      tags: ["React Native", "Expo", "Redux"],
      features: ["Navigation", "State Management", "Push Notifications", "Offline Support"]
    }
  ];

  return (
    <div className="service-page">
      {/* Header */}
      <header className="service-header">
        <Navbar currentPage="templates" />

        <div className="page-hero">
          <h1 className="page-title">
            Project <span className="highlight">Templates</span>
          </h1>
          <p className="page-subtitle">
            Ready-to-use templates to kickstart your development projects with best practices and modern tooling
          </p>
        </div>
      </header>

      {/* Templates Grid */}
      <section className="content-section">
        <div className="templates-grid">
          {templates.map((template, index) => (
            <div key={index} className="template-card">
              <div className="template-header">
                <div className="template-category">{template.category}</div>
                <h3>{template.name}</h3>
                <p>{template.description}</p>
              </div>

              <div className="template-tags">
                {template.tags.map((tag, i) => (
                  <span key={i} className="tag">{tag}</span>
                ))}
              </div>

              <div className="template-features">
                {template.features.map((feature, i) => (
                  <div key={i} className="feature-badge">✓ {feature}</div>
                ))}
              </div>

              <div className="template-actions">
                <button className="btn-action btn-primary">Use Template</button>
                <button className="btn-action btn-secondary">Preview</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Need a Custom Template?</h2>
        <p>We can create a custom template tailored to your specific needs</p>
        <button className="btn btn-primary">Contact Us</button>
      </section>

      {/* Footer */}
      <Footer variant="service" />
    </div>
  );
}
