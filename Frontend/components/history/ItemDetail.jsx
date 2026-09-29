"use client";

import { useState } from "react";
import InvestigationPlan from "../idea/InvestigationPlan";
import VerificationResult from "../verification/VerificationResult";
import DocumentResults from "../documents/DocumentResults";
import InterviewResults from "../interview/InterviewResults";
import ArticleResult from "../transcription/ArticleResult";
import { useGuardedNavigation } from "../../context/NavigationGuardContext";
import { setPrefilledInput } from "../../hooks/usePrefilledInput";

// Las notas se editan aquí mismo (con autoguardado); el resto se muestra para
// consultar, y los tipos que se pueden continuar tienen "Abrir y continuar" en la tarjeta.
function EditableArticle({ detail }) {
  const [article, setArticle] = useState(detail);
  return <ArticleResult article={article} onArticleChange={setArticle} />;
}

export default function ItemDetail({ item }) {
  const navigate = useGuardedNavigation();
  const { type, detail } = item;
  if (!detail) return null;

  if (type === "idea") {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h4 className="mb-1 text-sm font-semibold text-brand-text">Idea original</h4>
          <p className="text-sm text-brand-text/80">{detail.idea}</p>
        </div>
        {detail.plan && <InvestigationPlan plan={detail.plan} />}
      </div>
    );
  }

  if (type === "source") {
    return <VerificationResult result={detail} />;
  }

  if (type === "article") {
    return <EditableArticle detail={detail} />;
  }

  if (type === "document") {
    return <DocumentResults analysisTypes={detail.analysis_types} results={detail.results} />;
  }

  if (type === "interview") {
    return (
      <InterviewResults
        interviewee={detail.interviewee}
        topic={detail.topic}
        results={detail.results}
        onVerifyFact={(fact) => {
          setPrefilledInput("verification", fact);
          navigate("/verification");
        }}
      />
    );
  }

  if (type === "transcription") {
    return (
      <div className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-brand border border-brand-border bg-brand-bg p-4 text-sm text-brand-text/80">
        {detail.transcript_text}
      </div>
    );
  }

  return null;
}
