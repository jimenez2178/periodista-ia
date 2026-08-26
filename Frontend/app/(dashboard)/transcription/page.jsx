"use client";

import { useState } from "react";
import AudioUploader from "../../../components/transcription/AudioUploader";
import TranscriptionResult from "../../../components/transcription/TranscriptionResult";
import ArticleResult from "../../../components/transcription/ArticleResult";
import PressReleaseForm from "../../../components/transcription/PressReleaseForm";
import UpgradePrompt from "../../../components/credits/UpgradePrompt";
import Spinner from "../../../components/ui/Spinner";
import Toast from "../../../components/ui/Toast";
import { transcribe } from "../../../services/transcriptions.service";
import { generateArticle } from "../../../services/articles.service";
import { useCredits } from "../../../hooks/useCredits";

export default function TranscriptionPage() {
  const { credits, refreshCredits } = useCredits();

  const [transcribing, setTranscribing] = useState(false);
  const [transcription, setTranscription] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [article, setArticle] = useState(null);
  const [showPressReleaseModal, setShowPressReleaseModal] = useState(false);

  const [error, setError] = useState("");
  const [needsUpgrade, setNeedsUpgrade] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  async function handleTranscribe(input) {
    setTranscribing(true);
    setError("");
    setNeedsUpgrade(false);

    try {
      const data = await transcribe(input);
      setTranscription(data);
      refreshCredits();
    } catch (err) {
      if (err.status === 402) {
        setNeedsUpgrade(true);
        if (err.code === "AUDIO_TOO_LONG") setError(err.message);
      } else {
        setError(err.message);
      }
    } finally {
      setTranscribing(false);
    }
  }

  async function handleGenerateArticle(type, organizationName) {
    setShowPressReleaseModal(false);
    setGenerating(true);
    setError("");
    setNeedsUpgrade(false);

    try {
      const data = await generateArticle({
        transcription_id: transcription.transcription_id,
        type,
        organization_name: organizationName,
      });
      setArticle(data);
      refreshCredits();
    } catch (err) {
      if (err.status === 402) {
        setNeedsUpgrade(true);
      } else {
        setError(err.message);
      }
    } finally {
      setGenerating(false);
    }
  }

  function handleReset() {
    setTranscription(null);
    setArticle(null);
    setError("");
    setNeedsUpgrade(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-text">🎙️ Audio a Nota</h1>
        <p className="mt-1 text-sm text-brand-text/70">Transcribe tu entrevista y genera tu nota en segundos.</p>
      </div>

      {!transcription && (
        <AudioUploader onSubmit={handleTranscribe} isFree={credits?.plan === "free"} disabled={transcribing} />
      )}

      {error && <p className="text-sm text-brand-error">{error}</p>}
      {needsUpgrade && <UpgradePrompt />}

      {transcribing && (
        <div className="flex items-center justify-center gap-3 py-8">
          <Spinner />
          <span className="text-brand-text/70">Transcribiendo tu audio...</span>
        </div>
      )}

      {transcription && !article && (
        <TranscriptionResult
          transcript={transcription.transcript}
          language={transcription.language}
          disabled={generating}
          onGenerateNews={() => handleGenerateArticle("news_article")}
          onGeneratePressRelease={() => setShowPressReleaseModal(true)}
        />
      )}

      {generating && (
        <div className="flex items-center justify-center gap-3 py-8">
          <Spinner />
          <span className="text-brand-text/70">Generando tu nota...</span>
        </div>
      )}

      {article && !generating && (
        <ArticleResult
          article={article}
          onArticleChange={setArticle}
          onSaveToProject={() => setToastMessage("Próximamente")}
          onReset={handleReset}
        />
      )}

      <PressReleaseForm
        open={showPressReleaseModal}
        onClose={() => setShowPressReleaseModal(false)}
        onSubmit={(orgName) => handleGenerateArticle("press_release", orgName)}
      />

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage("")} />}
    </div>
  );
}
