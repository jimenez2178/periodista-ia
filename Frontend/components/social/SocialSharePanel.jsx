"use client";

import { useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import SocialShareModal from "./SocialShareModal";
import { generateSocialCopy } from "../../services/social.service";

const PLATFORMS = [
  { id: "instagram", label: "📸 Instagram" },
  { id: "twitter", label: "🐦 X/Twitter" },
  { id: "linkedin", label: "💼 LinkedIn" },
];

export default function SocialSharePanel({ content, contentType }) {
  const [platform, setPlatform] = useState(null);
  const [copy, setCopy] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleOpen(selectedPlatform) {
    setPlatform(selectedPlatform);
    setCopy("");
    setError("");
    setLoading(true);

    try {
      const result = await generateSocialCopy({ content, platform: selectedPlatform, contentType });
      setCopy(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-brand-text">📱 Compartir en redes sociales</h3>
      <div className="flex flex-wrap gap-3">
        {PLATFORMS.map((p) => (
          <Button key={p.id} variant="secondary" onClick={() => handleOpen(p.id)}>
            {p.label}
          </Button>
        ))}
      </div>

      <SocialShareModal
        open={!!platform}
        platform={platform}
        copy={copy}
        loading={loading}
        error={error}
        onClose={() => setPlatform(null)}
        onCopyChange={setCopy}
      />
    </Card>
  );
}
