import InvestigationPlan from "../idea/InvestigationPlan";
import VerificationResult from "../verification/VerificationResult";
import DocumentResults from "../documents/DocumentResults";
import Button from "../ui/Button";
import { downloadAsPdf, downloadAsWord } from "../../services/downloads.service";

export default function ItemDetail({ item }) {
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
    return (
      <div className="flex flex-col gap-3">
        <div className="whitespace-pre-wrap rounded-brand border border-brand-border bg-brand-bg p-4 text-sm text-brand-text/80">
          {detail.body}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => downloadAsPdf(detail)}>⬇️ Descargar PDF</Button>
          <Button variant="secondary" onClick={() => downloadAsWord(detail)}>
            ⬇️ Descargar Word
          </Button>
        </div>
      </div>
    );
  }

  if (type === "document") {
    return <DocumentResults analysisTypes={detail.analysis_types} results={detail.results} />;
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
