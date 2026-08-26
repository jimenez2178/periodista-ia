import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

function slugify(text) {
  const slug = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
  return slug || "nota";
}

export function downloadAsPdf(article) {
  const doc = new jsPDF();
  const marginX = 15;
  const maxWidth = 180;
  let y = 20;

  doc.setFontSize(16);
  const titleLines = doc.splitTextToSize(article.title, maxWidth);
  doc.text(titleLines, marginX, y);
  y += titleLines.length * 8 + 6;

  doc.setFontSize(11);
  const bodyLines = doc.splitTextToSize(article.body, maxWidth);
  for (const line of bodyLines) {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, marginX, y);
    y += 6;
  }

  doc.save(`${slugify(article.title)}.pdf`);
}

export async function downloadAsWord(article) {
  const bodyParagraphs = article.body
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => new Paragraph({ children: [new TextRun(line)] }));

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ children: [new TextRun({ text: article.title, bold: true, size: 32 })] }),
          new Paragraph({ children: [] }),
          ...bodyParagraphs,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${slugify(article.title)}.docx`);
}
