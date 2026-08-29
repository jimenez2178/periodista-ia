"use client";

import Button from "../ui/Button";
import ArticleResult from "../transcription/ArticleResult";
import SocialSharePanel from "../social/SocialSharePanel";

export default function IdeaNoteResult({ article, onArticleChange, onSaveToProject }) {
  return (
    <>
      <ArticleResult article={article} onArticleChange={onArticleChange} />
      <SocialSharePanel content={article.body} contentType="article" />
      <div className="flex justify-end">
        <Button onClick={onSaveToProject}>Guardar en proyecto →</Button>
      </div>
    </>
  );
}
