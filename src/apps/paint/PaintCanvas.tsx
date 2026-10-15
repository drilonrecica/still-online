// The grey work area with the picture, the selection marquee and the text tool's box.
import { useEffect, useRef } from 'react';
import { TEXT_FONT, TEXT_LINE_HEIGHT } from './codec';
import { rgbaToHex, type Rect } from './pixels';
import type { ToolId, Zoom } from './tools';
import type { useCanvasTools } from './useCanvasTools';
import type { PaintDocument } from './useDocument';
import styles from './Paint.module.css';

export interface PaintCanvasProps {
  doc: PaintDocument;
  tools: ReturnType<typeof useCanvasTools>;
  tool: ToolId;
  zoom: Zoom;
}

const box = (r: Rect, zoom: Zoom) => ({
  left: r.x * zoom,
  top: r.y * zoom,
  width: r.w * zoom,
  height: r.h * zoom,
});

export function PaintCanvas({ doc, tools, tool, zoom }: PaintCanvasProps) {
  const textRef = useRef<HTMLTextAreaElement>(null);
  const { text } = tools;
  const textKey = text ? `${text.at.x},${text.at.y}` : null;

  useEffect(() => {
    if (textKey) textRef.current?.focus();
  }, [textKey]);

  const marked = tools.marquee ?? tools.selection?.rect ?? null;

  return (
    <div className={styles.workspace}>
      <div
        className={styles.sheet}
        style={{ width: doc.size.w * zoom, height: doc.size.h * zoom }}
      >
        {/* No width/height props: setting them clears the canvas; the blit sizes it. */}
        <canvas
          ref={doc.canvasRef}
          className={styles.canvas}
          data-tool={tool}
          role="img"
          aria-label="Picture"
          style={{ width: doc.size.w * zoom, height: doc.size.h * zoom }}
          onContextMenu={(e) => e.preventDefault()}
          onPointerLeave={tools.clearCursor}
          {...tools.handlers}
        />
        {marked && (
          <div
            className={styles.marquee}
            style={box(marked, zoom)}
            aria-hidden
          />
        )}
        {text && (
          <textarea
            key={textKey}
            ref={textRef}
            className={styles.textBox}
            aria-label="Text"
            spellCheck={false}
            value={text.value}
            style={{
              left: text.at.x * zoom,
              top: text.at.y * zoom,
              color: rgbaToHex(text.color),
              font: TEXT_FONT,
              fontSize: 16 * zoom,
              lineHeight: `${TEXT_LINE_HEIGHT * zoom}px`,
            }}
            onChange={(e) => tools.setTextValue(e.target.value)}
            onBlur={tools.commitText}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                tools.commitText();
              } else if (e.key === 'Escape') {
                tools.cancelText();
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
