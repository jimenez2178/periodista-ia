"use client";

import { useEffect, useState } from "react";
import { useGuardedAction, useGuardedNavigation } from "../../../context/NavigationGuardContext";
import AudioUploader from "../../../components/transcription/AudioUploader";
import TranscriptionResult from "../../../components/transcription/TranscriptionResult";
import InterviewAnalysis from "../../../components/transcription/InterviewAnalysis";
import ArticleResult from "../../../components/transcription/ArticleResult";
import PressReleaseForm from "../../../components/transcription/PressReleaseForm";
import NoteSetup, { buildAngleOptions, CUSTOM_ANGLE } from "../../../components/transcription/NoteSetup";
import UpgradePrompt from "../../../components/credits/UpgradePrompt";
import Spinner from "../../../components/ui/Spinner";
import Toast from "../../../components/ui/Toast";
import Button from "../../../components/ui/Button";
import NextStepsPanel from "../../../components/ui/NextStepsPanel";
import SaveToProjectModal from "../../../components/projects/SaveToProjectModal";
import SocialSharePanel from "../../../components/social/SocialSharePanel";
import { transcribe, analyzeInterview, updateTranscript, getTranscription } from "../../../services/transcriptions.service";
import { generateArticle } from "../../../services/articles.service";
import { addItemToProject } from "../../../services/projects.service";
import { useCredits } from "../../../hooks/useCredits";
import { setPrefilledInput } from "../../../hooks/usePrefilledInput";
import { useUnsavedWarning } from "../../../hooks/useUnsavedWarning";
import { useUrlParam, clearUrlParam } from "../../../hooks/useUrlParam";

function firstSentence(text) {
  const sentence = (text || "").split(/(?<=[.!?])\s+/)[0];
  return sentence || text || "";
}

export default function TranscriptionPage() {
  const navigate = useGuardedNavigation();
  const guardAction = useGuardedAction();
  const { credits, refreshCredits } = useCredits();

  const [transcribing, setTranscribing] = useState(false);
  const [transcription, setTranscription] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [interviewAnalysis, setInterviewAnalysis] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [article, setArticle] = useState(null);
  const [showPressReleaseModal, setShowPressReleaseModal] = useState(false);

  // Lo que el periodista decide antes de redactar.
  const [transcriptDraft, setTranscriptDraft] = useState("");
  const [selectedQuotes, setSelectedQuotes] = useState([]);
  const [angleChoice, setAngleChoice] = useState("");
  const [customAngle, setCustomAngle] = useState("");
  const [context, setContext] = useState("");

  const [error, setError] = useState("");
  const [needsUpgrade, setNeedsUpgrade] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedToProject, setSavedToProject] = useState(false);

  // /transcription?id=... reabre una transcripción guardada para redactar la nota
  // sin volver a subir ni pagar el audio.
  const reopenId = useUrlParam("id");
  const [reopening, setReopening] = useState(false);

  useEffect(() => {
    if (!reopenId) return;
    setReopening(true);
    getTranscription(reopenId)
      .then((saved) => {
        setTranscription({
          transcription_id: saved.transcription_id,
          transcript: saved.transcript,
          language: saved.language,
          duration: saved.duration,
        });
        setTranscriptDraft(saved.transcript);
        setInterviewAnalysis(saved.analysis);
        setAngleChoice(buildAngleOptions(saved.analysis)[0].id);
      })
      .catch((err) => setError(err.message))
      .finally(() => setReopening(false));
  }, [reopenId]);

  useUnsavedWarning(!!article && !savedToProject, handleSaveToProject);

  async function handleSaveToProject(projectId) {
    await addItemToProject({ projectId, type: "article", itemId: article.id });
    setSavedToProject(true);
    setToastMessage("Guardado en el proyecto.");
  }

  function handleVerifyClaim() {
    setPrefilledInput("verification", firstSentence(article.body));
    navigate("/verification");
  }

  function handleInvestigateFurther() {
    setPrefilledInput("idea", article.title);
    navigate("/idea");
  }

  async function handleTranscribe(input) {
    setTranscribing(true);
    setError("");
    setNeedsUpgrade(false);

    try {
      const data = await transcribe(input);
      setTranscription(data);
      setTranscriptDraft(data.transcript);
      refreshCredits();

      setAnalyzing(true);
      let analysis = null;
      try {
        analysis = await analyzeInterview(data.transcription_id);
        setInterviewAnalysis(analysis);
      } catch {
        // El análisis es un extra sobre la transcripción ya pagada — si falla,
        // el periodista igual puede ver su transcripción y generar la nota.
      } finally {
        setAngleChoice(buildAngleOptions(analysis)[0].id);
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
      if (!transcriptDraft.trim()) {
        setError("La transcripción no puede quedar vacía.");
        return;
      }

      // La nota se redacta desde la transcripción guardada, así que primero
      // guardamos las correcciones del periodista.
      if (transcriptDraft !== transcription.transcript) {
        const saved = await updateTranscript(transcription.transcription_id, transcriptDraft);
        setTranscription((current) => ({ ...current, transcript: saved.transcript }));
        setTranscriptDraft(saved.transcript);
      }

      const angle =
        angleChoice === CUSTOM_ANGLE
          ? customAngle.trim()
          : buildAngleOptions(interviewAnalysis).find((option) => option.id === angleChoice)?.angle || "";
      const quotes = selectedQuotes.map((index) => {
        const { quote, speaker } = interviewAnalysis.top_quotes[index];
        return { quote, speaker };
      });

      const data = await generateArticle({
        transcription_id: transcription.transcription_id,
        type,
        organization_name: organizationName,
        context: context.trim(),
        angle,
        quotes,
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

  function handleToggleQuote(index) {
    setSelectedQuotes((current) =>
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index].sort((a, b) => a - b),
    );
  }

  function handleReset() {
    clearUrlParam("id");
    setTranscription(null);
    setAnalyzing(false);
    setInterviewAnalysis(null);
    setTranscriptDraft("");
    setSelectedQuotes([]);
    setAngleChoice("");
    setCustomAngle("");
    setContext("");
    setArticle(null);
    setSavedToProject(false);
    setError("");
    setNeedsUpgrade(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-text">🎙️ De entrevista a noticia</h1>
        <p className="mt-1 text-sm text-brand-text/70">Transcribe tu entrevista y genera tu nota en segundos.</p>
      </div>

      {reopening && (
        <div className="flex items-center justify-center gap-3 py-8">
          <Spinner />
          <span className="text-brand-text/70">Abriendo tu transcripción...</span>
        </div>
      )}

      {!transcription && !reopening && (
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
          {interviewAnalysis && (
            <InterviewAnalysis
              analysis={interviewAnalysis}
              selectedQuotes={selectedQuotes}
              onToggleQuote={handleToggleQuote}
              disabled={generating}
            />
          )}
          <TranscriptionResult
            transcript={transcriptDraft}
            originalTranscript={transcription.transcript}
            language={transcription.language}
            onTranscriptChange={setTranscriptDraft}
            disabled={generating}
          />
          <NoteSetup
            angleOptions={buildAngleOptions(interviewAnalysis)}
            angleChoice={angleChoice}
            onAngleChoiceChange={setAngleChoice}
            customAngle={customAngle}
            onCustomAngleChange={setCustomAngle}
            context={context}
            onContextChange={setContext}
            selectedQuotesCount={selectedQuotes.length}
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
            <Button variant="secondary" onClick={() => guardAction(handleReset)} className="w-full sm:w-auto">
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
