import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { NoteTheme } from '@/src/types';

interface PDFExportProps {
  mainAreaRef: React.RefObject<HTMLDivElement>;
  pageLayout: 'pageless' | 'a4-portrait' | 'a4-landscape';
  pageLayoutMode: 'single' | 'book';
  theme: NoteTheme;
  setPageLayoutMode: (mode: 'single' | 'book') => void;
  getActiveContext: () => { subject: any; note: any } | null;
  onExportStart: () => void;
  onExportEnd: () => void;
}

export const exportPageToPDF = async ({
  mainAreaRef,
  pageLayout,
  pageLayoutMode,
  theme,
  setPageLayoutMode,
  getActiveContext,
  onExportStart,
  onExportEnd
}: PDFExportProps) => {
  if (!mainAreaRef.current) return;
  
  const originalMode = pageLayoutMode;
  onExportStart();
  
  if (originalMode === 'book') {
    setPageLayoutMode('single');
  }
  
  await new Promise(resolve => setTimeout(resolve, 300));
  
  try {
    const activeContext = getActiveContext();
    const titleCleanName = activeContext?.note.title
      ? activeContext.note.title.replace(/\s+/g, '-').toLowerCase()
      : 'note';
    const fileName = `papyrus-${titleCleanName}-${Date.now().toString().slice(-6)}.pdf`;
    
    const isLandscape = pageLayout === 'a4-landscape';
    const pdfWidth = isLandscape ? 841.89 : 595.28;
    const pdfHeight = isLandscape ? 595.28 : 841.89;
    
    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    const paperColorHex = theme.paperColor || '#ffffff';

    if (pageLayout === 'pageless') {
      const element = mainAreaRef.current;
      const fullHeight = element.scrollHeight;
      const fullWidth = element.offsetWidth;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: (theme.id === 'dark' || theme.id === 'charcoal' || theme.id === 'premium-dark') ? '#0A0A0A' : paperColorHex,
        scrollY: 0,
        scrollX: 0,
        windowWidth: fullWidth,
        width: fullWidth,
        height: fullHeight,
        onclone: (clonedDoc: Document) => {
          const header = clonedDoc.querySelector('.no-print');
          if (header) (header as HTMLElement).style.display = 'none';
        }
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const ratio = pdfWidth / fullWidth;
      const canvasPageHeight = pdfHeight / ratio;
      const totalPages = Math.ceil(fullHeight / canvasPageHeight);

      for (let i = 0; i < totalPages; i++) {
        if (i > 0) pdf.addPage();
        const yOffset = i * canvasPageHeight;
        pdf.addImage(imgData, 'JPEG', 0, -yOffset, pdfWidth, fullHeight * ratio);
      }
    } else {
      const element = mainAreaRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: paperColorHex,
        onclone: (clonedDoc: Document) => {
          const header = clonedDoc.querySelector('.no-print');
          if (header) (header as HTMLElement).style.display = 'none';
        }
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    }

    pdf.save(fileName);
  } catch (err) {
    console.error('PDF export failed:', err);
  } finally {
    if (originalMode === 'book') {
      setPageLayoutMode('book');
    }
    onExportEnd();
  }
};
