"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import "../templates/services.css";
import { useScripts } from "./hooks/useScripts";
import type { Script } from "./scripts/data";

const TABS = [
  { id: "all", label: "All" },
  { id: "scripts", label: "Scripts" },
  { id: "utils", label: "Utils" },
  { id: "hooks", label: "Hooks" },
  { id: "ai-skills", label: "AI Skills" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function DeveloperToolsPage() {
  const { scripts } = useScripts();
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const filteredScripts =
    activeTab === "all"
      ? scripts
      : scripts.filter((script) => script.segment === activeTab);

  const handleViewCode = async (script: Script) => {
    setSelectedScript(script);
    setIsLoadingCode(true);
    setCodeError(null);
    setCode(null);

    try {
      const response = await fetch(`/api/tools/${script.id}`);
      if (!response.ok) {
        throw new Error("Failed to load code");
      }
      const data = (await response.json()) as { code: string };
      setCode(data.code);
    } catch {
      setCodeError("Unable to load code right now. Please try again later.");
    } finally {
      setIsLoadingCode(false);
    }
  };

  const handleDownload = async (script: Script) => {
    try {
      const response = await fetch(`/api/tools/${script.id}`);
      if (!response.ok) {
        throw new Error("Failed to download tool");
      }

      const data = (await response.json()) as { code: string };
      const blob = new Blob([data.code], {
        type: "text/plain;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = script.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // Silent failure; the user can still view/copy the code
    }
  };

  const handleCopyCode = async () => {
    if (!code || typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }

    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(code);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 1500);
    } finally {
      setIsCopying(false);
    }
  };

  const closeModal = () => {
    setSelectedScript(null);
    setCode(null);
    setCodeError(null);
  };

  return (
    <div className="service-page">
      {/* Header */}
      <header className="service-header">
        <Navbar currentPage="scripts" />

        <div className="page-hero">
          <h1 className="page-title">
            Developer <span className="highlight">Toolkit</span>
          </h1>
          <p className="page-subtitle">
            Scripts, utilities, and hooks to streamline your development
            workflow and boost productivity
          </p>
        </div>
      </header>

      {/* Scripts Grid */}
      <section className="content-section">
        <div className="tabs">
          <div className="tab-list">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="scripts-grid">
          {filteredScripts.length === 0 && (
            <div className="empty-state">
              No items in this category yet. You can assign scripts to this
              segment in your data configuration.
            </div>
          )}

          {filteredScripts.map((script, index) => (
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
                  <div key={i} className="feature-badge">
                    ✓ {feature}
                  </div>
                ))}
              </div>

              <div className="script-actions">
                <button
                  className="btn-action btn-primary"
                  type="button"
                  onClick={() => handleDownload(script)}
                >
                  Download
                </button>
                <button
                  className="btn-action btn-secondary"
                  type="button"
                  onClick={() => handleViewCode(script)}
                >
                  View Code
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedScript && (
        <div className="code-modal-backdrop" onClick={closeModal}>
          <div
            className="code-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="code-modal-header">
              <div>
                <h3 className="code-modal-title">{selectedScript.name}</h3>
                <p className="code-modal-subtitle">
                  {selectedScript.description}
                </p>
              </div>
              <div className="code-modal-actions">
                <button
                  type="button"
                  className="code-modal-icon-button"
                  onClick={handleCopyCode}
                  disabled={!code || isCopying}
                  title={hasCopied ? "Copied!" : "Copy to clipboard"}
                >
                  {hasCopied ? "✓" : "⧉"}
                </button>
                <button
                  type="button"
                  className="code-modal-close"
                  onClick={closeModal}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="code-modal-body">
              {isLoadingCode && (
                <div className="code-modal-status">
                  Loading code snippet...
                </div>
              )}

              {codeError && (
                <div className="code-modal-status code-modal-error">
                  {codeError}
                </div>
              )}

              {code && (
                <pre className="code-modal-pre">
                  <code>{code}</code>
                </pre>
              )}
            </div>
          </div>
        </div>
      )}

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
