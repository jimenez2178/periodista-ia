import Link from "next/link";
import Card from "../ui/Card";
import { getItemTypeMeta, formatRelativeDate } from "../../utils/formatters";

const TITLE_MAX_LENGTH = 60;

function truncateTitle(title) {
  if (!title) return "";
  return title.length > TITLE_MAX_LENGTH ? `${title.slice(0, TITLE_MAX_LENGTH)}…` : title;
}

export default function ActivityCard({ item }) {
  const meta = getItemTypeMeta(item.type);

  return (
    <Link href="/history">
      <Card className="flex items-center gap-3 py-3 transition-colors hover:border-brand-blue">
        <span className="text-xl">{meta.emoji}</span>
        <span className="flex-1 truncate text-sm font-medium text-brand-text">{truncateTitle(item.title)}</span>
        <span className="whitespace-nowrap text-xs text-brand-text/50">{formatRelativeDate(item.created_at)}</span>
      </Card>
    </Link>
  );
}
