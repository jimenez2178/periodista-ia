"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AudioUploader from "../../../components/transcription/AudioUploader";
import TranscriptionResult from "../../../components/transcription/TranscriptionResult";
import InterviewAnalysis from "../../../components/transcription/InterviewAnalysis";
import ArticleResult from "../../../components/transcription/ArticleResult";
import PressReleaseForm from "../../../components/transcription/PressReleaseForm";
import UpgradePrompt from "../../../components/credits/UpgradePrompt";
import Spinner from "../../../components/ui/Spinner";
import Toast from "../../../components/ui/Toast";
import Button from "../../../components/ui/Button";
import NextStepsPanel from "../../../components/ui/NextStepsPanel";
import SaveToProjectModal from "../../../components/projects/SaveToProjectModal";
import SocialSharePanel from "../../../components/social/SocialSharePanel";
import { transcribe, analyzeInterview } from "../../../services/transcriptions.service";
import { generateArticle } from "../../../services/articles.service";
import { addItemToProject } from "../../../services/projects.service";
import { useCredits } from "../../../hooks/useCredits";
import { setPrefilledInput } from "../../../hooks/usePrefilledInput";

function firstSentence(text) {
  const sentence = (text || "").split(/(?<=[.!?])\s+/)[0];
  return sentence || text || "";
}

export default function TranscriptionPage() {
  const router = useRouter();
  const { credits, refreshCredits } = useCredits();

  const [transcribing, setTranscribing] = useState(false);
  const [transcription, setTranscription] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [interviewAnalysis, setInterviewAnalysis] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [article, setArticle] = useState(null);
  const [showPressReleaseModal, setShowPressReleaseModal] = useState(false);

  const [error, setError] = useState("");
  const [needsUpgrade, setNeedsUpgrade] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);

  async function handleSaveToProject(projectId) {
    await addItemToProject({ projectId, type: "article", itemId: article.id });
    setToastMessage("Guardado en el proyecto.");
  }

  function handleVerifyClaim() {
    setPrefilledInput("verification", firstSentence(article.body));
    router.push("/verification");
  }

  function handleInvestigateFurther() {
    setPrefilledInput("idea", article.title);
    router.push("/idea");
  }

  async function handleTranscribe(input) {
    setTranscribing(true);
    setError("");
    setNeedsUpgrade(false);

    try {
      const data = await transcribe(input);
      setTranscription(data);
      refreshCredits();

      setAnalyzing(true);
      try {
        const analysis = await analyzeInterview(data.transcription_id);
        setInterviewAnalysis(analysis);
      } catch {
        // El análisis es un extra sobre la transcripción ya pagada — si falla,
        // el periodista igual puede ver su transcripción y generar la nota.
      } finally {
        setAnalyzing(false);
      }
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
    setAnalyzing(false);
    setInterviewAnalysis(null);
    setArticle(null);
    setError("");
    setNeedsUpgrade(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-text">🎙️ De entrevista a noticia</h1>
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

      {analyzing && (
        <div className="flex items-center justify-center gap-3 py-8">
          <Spinner />
          <span className="text-brand-text/70">Analizando tu entrevista...</span>
        </div>
      )}

      {transcription && !analyzing && !article && (
        <>
          {interviewAnalysis && <InterviewAnalysis analysis={interviewAnalysis} />}
          <TranscriptionResult
            transcript={transcription.transcript}
            language={transcription.language}
            disabled={generating}
            onGenerateNews={() => handleGenerateArticle("news_article")}
            onGeneratePressRelease={() => setShowPressReleaseModal(true)}
          />
        </>
      )}

      {generating && (
        <div className="flex items-center justify-center gap-3 py-8">
          <Spinner />
          <span className="text-brand-text/70">Generando tu nota...</span>
        </div>
      )}

      {article && !generating && (
        <>
          <ArticleResult article={article} onArticleChange={setArticle} />
          <SocialSharePanel content={article.body} contentType="article" />
          <NextStepsPanel
            actions={[
              { emoji: "🔍", label: "Verificar afirmaciones de la nota", onClick: handleVerifyClaim },
              { emoji: "💡", label: "Investigar más esta historia", onClick: handleInvestigateFurther },
              { emoji: "💾", label: "Guardar en proyecto", onClick: () => setShowSaveModal(true) },
            ]}
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" onClick={handleReset} className="w-full sm:w-auto">
              Nueva transcripción
            </Button>
            <Button onClick={() => setShowSaveModal(true)} className="w-full sm:w-auto">
              Guardar en proyecto →
            </Button>
          </div>
        </>
      )}

      <PressReleaseForm
        open={showPressReleaseModal}
        onClose={() => setShowPressReleaseModal(false)}
        onSubmit={(orgName) => handleGenerateArticle("press_release", orgName)}
      />

      <SaveToProjectModal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onConfirm={handleSaveToProject}
      />

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage("")} />}
    </div>
  );
}
