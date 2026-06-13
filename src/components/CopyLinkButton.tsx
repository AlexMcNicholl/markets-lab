import { useState } from "react";

/**
 * Copies the current URL (which encodes the tool's scenario via the ?s=
 * parameter — see useSharedState) so a configured scenario can be shared.
 */
export default function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked (e.g. insecure context); fail quietly.
    }
  };

  return (
    <button className="preset" onClick={copy} aria-live="polite">
      {copied ? "Link copied ✓" : "Copy link to scenario"}
    </button>
  );
}
