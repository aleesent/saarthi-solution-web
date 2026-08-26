import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Shared offscreen 2D canvas context for exact CSS Color 4 / OKLAB / OKLCH / LAB / LCH -> RGB translation
let offscreenCtx: CanvasRenderingContext2D | null = null;

function get2dContext(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
  if (!offscreenCtx) {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    offscreenCtx = canvas.getContext('2d', { willReadFrequently: true });
  }
  return offscreenCtx;
}

/**
 * Converts modern CSS colors (oklab, oklch, color-mix, color(srgb ...), lab, lch, hwb)
 * to standard RGB/RGBA/HEX strings that html2canvas supports.
 */
export function parseCssColorToRgb(colorStr: string): string {
  if (!colorStr || typeof colorStr !== 'string') return '#000000';
  const trimmed = colorStr.trim();

  // If already standard hex, rgb, rgba, or named color, return as-is
  const hasModernColor =
    trimmed.includes('oklab') ||
    trimmed.includes('oklch') ||
    trimmed.includes('color-mix') ||
    trimmed.includes('color(') ||
    trimmed.includes('lab(') ||
    trimmed.includes('lch(') ||
    trimmed.includes('hwb(');

  if (!hasModernColor) {
    return trimmed;
  }

  const ctx = get2dContext();
  if (!ctx) return '#0f172a';

  try {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = '#0f172a'; // Default fallback
    ctx.fillStyle = trimmed;

    // In modern browsers, reading ctx.fillStyle serializes any valid CSS Color 4 to #rrggbb or rgba(...)
    const serialized = ctx.fillStyle;
    if (
      serialized &&
      !serialized.includes('oklab') &&
      !serialized.includes('oklch') &&
      !serialized.includes('color-mix') &&
      !serialized.includes('color(')
    ) {
      return serialized;
    }

    // Direct pixel data inspection fallback
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    const alpha = (a / 255).toFixed(3);
    return alpha === '1.000' || alpha === '1'
      ? `rgb(${r}, ${g}, ${b})`
      : `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } catch (err) {
    return '#0f172a';
  }
}

/**
 * Sanitizes any complex CSS string by replacing modern color functions with standard rgb equivalents.
 */
export function sanitizeCssColorString(input: string): string {
  if (!input || typeof input !== 'string') return input;

  // Check if string contains any modern color syntax
  if (
    !input.includes('oklab') &&
    !input.includes('oklch') &&
    !input.includes('color-mix') &&
    !input.includes('color(') &&
    !input.includes('lab(') &&
    !input.includes('lch(') &&
    !input.includes('hwb(')
  ) {
    return input;
  }

  // Multi-pass regex replacement to handle nested expressions like color-mix(in oklab, ...)
  let sanitized = input;
  
  // 1. Replace oklab(...) and oklch(...) functions specifically
  sanitized = sanitized.replace(/oklab\([^)]+\)/gi, (m) => parseCssColorToRgb(m));
  sanitized = sanitized.replace(/oklch\([^)]+\)/gi, (m) => parseCssColorToRgb(m));
  
  // 2. Replace color-mix(...) functions
  sanitized = sanitized.replace(/color-mix\([^)]+\)/gi, (m) => parseCssColorToRgb(m));

  // 3. Replace lab(...), lch(...), hwb(...), color(...)
  sanitized = sanitized.replace(/lab\([^)]+\)/gi, (m) => parseCssColorToRgb(m));
  sanitized = sanitized.replace(/lch\([^)]+\)/gi, (m) => parseCssColorToRgb(m));
  sanitized = sanitized.replace(/hwb\([^)]+\)/gi, (m) => parseCssColorToRgb(m));
  sanitized = sanitized.replace(/color\([^)]+\)/gi, (m) => parseCssColorToRgb(m));

  return sanitized;
}

const COLOR_CSS_PROPERTIES = [
  'color',
  'background-color',
  'border-top-color',
  'border-bottom-color',
  'border-left-color',
  'border-right-color',
  'outline-color',
  'text-decoration-color',
  'fill',
  'stroke',
  'caret-color',
  'accent-color'
];

/**
 * Captures an HTML element into a high-resolution Canvas while completely eliminating
 * unsupported modern CSS color functions from the cloned document tree and stylesheets.
 */
export async function captureElementToCanvas(
  element: HTMLElement,
  options?: { scale?: number; backgroundColor?: string }
): Promise<HTMLCanvasElement> {
  const scale = options?.scale ?? 2;
  const backgroundColor = options?.backgroundColor ?? '#ffffff';

  return await html2canvas(element, {
    scale,
    useCORS: true,
    logging: false,
    backgroundColor,
    onclone: (clonedDoc, clonedElement) => {
      // 1. Sanitize or strip unsupported CSS rules from all <style> tags in the cloned document
      try {
        const styleTags = clonedDoc.querySelectorAll('style');
        styleTags.forEach((tag) => {
          if (tag.textContent) {
            tag.textContent = sanitizeCssColorString(tag.textContent);
          }
        });
      } catch (e) {
        // Ignore style tag mutations if restricted
      }

      // 2. Deep sanitize computed styles for all elements in cloned DOM tree
      try {
        const allElements = clonedDoc.querySelectorAll<HTMLElement>('*');
        allElements.forEach((el) => {
          try {
            const computed = window.getComputedStyle(el);

            for (const prop of COLOR_CSS_PROPERTIES) {
              const val = computed.getPropertyValue(prop);
              if (
                val &&
                (val.includes('oklab') ||
                  val.includes('oklch') ||
                  val.includes('color-mix') ||
                  val.includes('color(') ||
                  val.includes('lab(') ||
                  val.includes('lch(') ||
                  val.includes('hwb('))
              ) {
                const converted = parseCssColorToRgb(val);
                el.style.setProperty(prop, converted, 'important');
              }
            }

            // Sanitize box-shadow
            const shadow = computed.getPropertyValue('box-shadow');
            if (
              shadow &&
              (shadow.includes('oklab') ||
                shadow.includes('oklch') ||
                shadow.includes('color(') ||
                shadow.includes('lab(') ||
                shadow.includes('color-mix'))
            ) {
              el.style.setProperty(
                'box-shadow',
                sanitizeCssColorString(shadow),
                'important'
              );
            }

            // Sanitize background-image (gradients)
            const bgImg = computed.getPropertyValue('background-image');
            if (
              bgImg &&
              (bgImg.includes('oklab') ||
                bgImg.includes('oklch') ||
                bgImg.includes('color(') ||
                bgImg.includes('lab(') ||
                bgImg.includes('color-mix'))
            ) {
              el.style.setProperty(
                'background-image',
                sanitizeCssColorString(bgImg),
                'important'
              );
            }
          } catch {
            // Skip unreadable element
          }
        });
      } catch (e) {
        // Continue
      }

      // 3. Ensure the printable invoice root container has solid base colors
      if (clonedElement) {
        clonedElement.style.backgroundColor = '#ffffff';
        clonedElement.style.color = '#0f172a';
      }
    }
  });
}

/**
 * Generates an A4 PDF document and Blob from an HTML element safely without color parsing issues.
 */
export async function generatePdfFromElement(
  element: HTMLElement,
  options?: {
    fileName?: string;
    scale?: number;
    backgroundColor?: string;
  }
): Promise<{ pdf: jsPDF; blob: Blob; canvas: HTMLCanvasElement }> {
  const canvas = await captureElementToCanvas(element, {
    scale: options?.scale ?? 2,
    backgroundColor: options?.backgroundColor ?? '#ffffff'
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
  heightLeft -= pdfHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;
  }

  const blob = pdf.output('blob');
  return { pdf, blob, canvas };
}

/**
 * Prints an HTML invoice element cleanly in all environments (including sandboxed iframes).
 * It rasterizes the element at high DPI and renders it in an isolated print frame or popup window,
 * ensuring zero CSS conflicts, no unwanted headers/sidebars, and exact print margins.
 */
export async function printInvoiceElement(
  element: HTMLElement,
  options?: {
    title?: string;
    scale?: number;
  }
): Promise<void> {
  const title = options?.title || 'Tax Invoice';
  const scale = options?.scale ?? 2;

  // 1. Capture high-res sanitized canvas
  const canvas = await captureElementToCanvas(element, {
    scale,
    backgroundColor: '#ffffff'
  });
  const imgData = canvas.toDataURL('image/png');

  // 2. Prepare isolated printable HTML
  const printHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>${title}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm 8mm 8mm 8mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #000000;
            display: flex;
            justify-content: center;
            align-items: flex-start;
          }
          .invoice-img {
            width: 100%;
            max-width: 194mm;
            height: auto;
            display: block;
            margin: 0 auto;
          }
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            .invoice-img {
              width: 100% !important;
              max-width: 100% !important;
            }
          }
        </style>
      </head>
      <body>
        <img class="invoice-img" src="${imgData}" alt="Tax Invoice" />
      </body>
    </html>
  `;

  // 3. Try hidden iframe printing first (best user experience, stays in-page)
  try {
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    printFrame.style.visibility = 'hidden';
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document;
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(printHtml);
      frameDoc.close();

      await new Promise((resolve) => setTimeout(resolve, 500));

      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();

      // Clean up iframe after print dialog resolves
      setTimeout(() => {
        if (document.body.contains(printFrame)) {
          document.body.removeChild(printFrame);
        }
      }, 3000);
      return;
    }
  } catch (frameErr) {
    console.warn('Iframe print failed or blocked, attempting popup window print...', frameErr);
  }

  // 4. Fallback: Open in dedicated popup print window
  try {
    const printWindow = window.open('', '_blank', 'width=900,height=1000,menubar=no,toolbar=no,location=no,status=no');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(printHtml);
      printWindow.document.close();

      printWindow.onload = () => {
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 300);
      };
      return;
    }
  } catch (winErr) {
    console.warn('Popup print blocked, falling back to window.print()', winErr);
  }

  // 5. Ultimate fallback: window.print()
  window.print();
}
