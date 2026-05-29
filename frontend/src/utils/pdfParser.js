import * as pdfjs from 'pdfjs-dist/legacy/build/pdf';
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.entry';

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export const parseSongsFromPdf = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ 
      data: arrayBuffer,
      disableFontFace: true 
    });
    
    const pdf = await loadingTask.promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        
        // Sort items by y (descending) then x (ascending) to maintain reading order
        const items = content.items.sort((a, b) => {
          if (Math.abs(a.transform[5] - b.transform[5]) > 5) {
            return b.transform[5] - a.transform[5];
          }
          return a.transform[4] - b.transform[4];
        });

        let lastY = -1;
        let pageText = '';
        for (const item of items) {
          if (lastY !== -1 && Math.abs(item.transform[5] - lastY) > 5) {
            pageText += '\n';
          }
          pageText += item.str + ' ';
          lastY = item.transform[5];
        }
        
        fullText += pageText + '\n';
      } catch (e) {
        console.warn(`Failed to read page ${i}`, e);
      }
    }

    // Pre-processing: Strip common junk like file paths, page headers, etc.
    let cleanText = fullText
      .replace(/file:\/\/\/[^\s]+/g, '') // Remove file paths
      .replace(/Page \d+/gi, '')        // Remove "Page X"
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
    
    if (!cleanText) {
      throw new Error('File PDF tidak berisi teks yang dapat diekstrak.');
    }

    const songs = [];
    // Strict Header Regex: 
    // 1. Must start at beginning of line (^|\n)
    // 2. Optional book prefix: (KJ\.?|NNBT\.?|...)
    // 3. Mandatory Number
    // 4. If no book prefix, MUST have a separator (. , - , ) ) to be a header
    const songSplitRegex = /(?:^|\n)\s*(?:(?:(KJ\.?|NNBT\.?|NKB\.?|PKJ\.?|MARS\.?|LAGU\.?|PUJIAN\.?|NO\.?)\s*(\d{1,4}))|()(\d{1,4}\s*[\.\-\)]))\s*([A-Z\xC0-\xDF][^\n]{2,})/g;
    
    // Fallback: Group 1: Prefix, Group 2: Number, Group 3: Empty, Group 4: Empty (placeholder), Group 5: Title
    const fallbackRegex = /(?:^|\n)\s*(KJ\.?|NNBT\.?|NKB\.?|PKJ\.?)\s*(\d{1,4})()()\s*([A-Z\xC0-\xDF][^\n]{2,})/gi;
    
    let matches = Array.from(cleanText.matchAll(songSplitRegex));
    if (matches.length < 2) {
      matches = Array.from(cleanText.matchAll(fallbackRegex));
    }
    
    // Final resort: Split by any line that starts with "KJ 1" or "1."
    if (matches.length < 2) {
      const lineSplitRegex = /(?:^|\n)\s*()()()(?:[A-Z]{2,}\s*)?(\d{1,4})\s*[\.\s]()/g;
      matches = Array.from(cleanText.matchAll(lineSplitRegex));
    }

    for (let i = 0; i < matches.length; i++) {
      const currentMatch = matches[i];
      const nextMatch = matches[i + 1];
      
      let bookPrefix = (currentMatch[1] || '').replace('.', '').toUpperCase().trim();
      let songNumberStr = currentMatch[2] || currentMatch[4];
      let songTitle = (currentMatch[5] || `Lagu ${songNumberStr}`).trim();
      
      const songNumber = parseInt(songNumberStr);
      if (isNaN(songNumber)) continue;

      const start = currentMatch.index + currentMatch[0].length;
      const end = nextMatch ? nextMatch.index : cleanText.length;
      
      const lyrics = cleanText.substring(start, end).trim();
      
      if (lyrics || i === matches.length - 1) {
        let category = 'PDF';
        const fileUpper = file.name.toUpperCase();
        
        if (bookPrefix && ['KJ', 'NNBT', 'NKB', 'PKJ'].includes(bookPrefix)) {
          category = bookPrefix;
        } else if (fileUpper.includes('KJ')) category = 'KJ';
        else if (fileUpper.includes('NNBT')) category = 'NNBT';
        else if (fileUpper.includes('NKB')) category = 'NKB';
        else if (fileUpper.includes('PKJ')) category = 'PKJ';

        const paddedNum = songNumber.toString().padStart(3, '0');
        const displayTitle = bookPrefix 
          ? `${bookPrefix} ${paddedNum} - ${songTitle}`
          : `${category !== 'PDF' ? category + ' ' : ''}${paddedNum} - ${songTitle}`;

        songs.push({
          number: songNumber,
          title: displayTitle,
          lyrics: lyrics || '(Lirik tidak terdeteksi)',
          category: category,
          songBook: category === 'PDF' ? 'Hasil Import' : `Nyanyian ${category}`
        });
      }
    }

    // Final Fallback: If no songs were split by number, treat whole text as one
    if (songs.length === 0) {
      console.log("No split patterns matched, using fallback");
      return [{
        number: 1,
        title: file.name.replace('.pdf', '') || 'Hasil Ekstraksi PDF',
        lyrics: cleanText,
        category: 'IMPORT'
      }];
    }

    // Remove duplicates by number (preferring the one with more lyrics)
    const songMap = new Map();
    for (const s of songs) {
      if (!songMap.has(s.number) || s.lyrics.length > songMap.get(s.number).lyrics.length) {
        songMap.set(s.number, s);
      }
    }

    return Array.from(songMap.values()).sort((a, b) => a.number - b.number);
  } catch (error) {
    console.error('PDF Parser Error:', error);
    throw error;
  }
};
