"use client";

import Button from "../ui/Button";
import ArticleResult from "../transcription/ArticleResult";
import SocialSharePanel from "../social/SocialSharePanel";
import NextStepsPanel from "../ui/NextStepsPanel";

export default function DocToNoteResult({ article, onArticleChange, onVerify, onSaveToProject, onReset }) {
  return (
    <>
      <ArticleResult article={article} onArticleChange={onArticleChange} />
      <SocialSharePanel content={article.body} contentType="article" />
      <NextStepsPanel
        actions={[
          { emoji: "🔍", label: "Verificar afirmaciones de la nota", onClick: onVerify },
          { emoji: "💾", label: "Guardar en proyecto", onClick: onSaveToProject },
        ]}
      />
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="secondary" onClick={onReset} className="w-full sm:w-auto">
          Nueva nota
        </Button>
        <Button onClick={onSaveToProject} className="w-full sm:w-auto">
          Guardar en proyecto →
        </Button>
      </div>
    </>
  );
}
