import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

export const exportLiturgyToWord = async (liturgy) => {
  const parts = JSON.parse(liturgy.content || '[]');

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: {
            width: 11906, // A4 width in twips (8.27 inches * 1440)
            height: 16838, // A4 height in twips (11.69 inches * 1440)
          },
          margin: {
            top: 1440, // 1 inch
            right: 1440,
            bottom: 1440,
            left: 1440,
          },
        },
      },
      children: [
        // Title
        new Paragraph({
          text: liturgy.title.toUpperCase(),
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        // Subtitle / Theme
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: `Tema: ${liturgy.theme}`, bold: true, size: 24 }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: `${liturgy.churchDay} | ${new Date(liturgy.date).toLocaleDateString('id-ID', { dateStyle: 'full' })}`, italic: true }),
          ],
          spacing: { after: 400 },
        }),

        // Liturgy Content (Single Column Format)
        ...parts.flatMap(part => [
          new Paragraph({ 
            text: part.title, 
            bold: true,
            spacing: { before: 300, after: 100 }
          }),
          ...part.content.split('\n').map(line => new Paragraph({ 
            text: line,
            spacing: { after: 60 }
          }))
        ]),

        new Paragraph({
          text: "\nSoli Deo Gloria",
          alignment: AlignmentType.CENTER,
          spacing: { before: 1000 },
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Liturgi_${liturgy.title.replace(/\s+/g, '_')}.docx`);
};
