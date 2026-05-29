import pptxgen from "pptxgenjs";

export const exportPPTX = async (project) => {
  const pptx = new pptxgen();
  const slides = JSON.parse(project.slides || '[]');

  pptx.layout = 'LAYOUT_16x9';

  slides.forEach((slide) => {
    const pptSlide = pptx.addSlide();
    
    if (slide.backgroundImage) {
      pptSlide.background = { data: slide.backgroundImage };
    } else {
      pptSlide.background = { color: "0F172A" }; // Deep Navy
    }

    // Add Title (Optional)
    if (slide.title) {
      pptSlide.addText(slide.title, {
        x: 0.5,
        y: 0.5,
        w: "90%",
        h: 1,
        fontSize: 28,
        color: "FDE047", // Yellow/Gold for GMIM formal look
        bold: true,
        fontFace: "Arial",
        align: pptx.AlignH.center,
        shadow: { type: 'outer', color: '000000', blur: 3, offset: 2, angle: 45 }
      });
    }

    // Add Content
    pptSlide.addText(slide.content, {
      x: 0.5,
      y: 1.5,
      w: "90%",
      h: 4.5,
      fontSize: 32,
      color: "FFFFFF",
      valign: pptx.AlignV.middle,
      align: pptx.AlignH.center,
      fontFace: "Arial",
      breakLine: true,
      shadow: { type: 'outer', color: '000000', blur: 3, offset: 2, angle: 45 }
    });
  });

  await pptx.writeFile({ fileName: `SmartWorship_${project.title.replace(/\s+/g, '_')}.pptx` });
};
