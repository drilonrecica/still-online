// The toolbox: two columns of tools and, below them, the current tool's options.
import type { ReactNode } from 'react';
import { AIRBRUSH_RADII } from './fill';
import { TOOL_ICONS } from './icons';
import type { ShapeMode } from './shapes';
import {
  BRUSH_SIZES,
  ERASER_SIZES,
  LINE_WIDTHS,
  TOOLS,
  ZOOMS,
  type ToolId,
  type ToolOptions,
  type Zoom,
} from './tools';
import styles from './Paint.module.css';

export interface ToolboxProps {
  tool: ToolId;
  options: ToolOptions;
  zoom: Zoom;
  onTool: (tool: ToolId) => void;
  onOptions: (patch: Partial<ToolOptions>) => void;
  onZoom: (zoom: Zoom) => void;
}

interface Choice {
  key: string;
  label: string;
  active: boolean;
  preview: ReactNode;
  pick: () => void;
}

const SHAPE_MODES: { mode: ShapeMode; label: string }[] = [
  { mode: 'outline', label: 'Outline' },
  { mode: 'both', label: 'Outline and fill' },
  { mode: 'fill', label: 'Fill only' },
];

function choicesFor({ tool, options, zoom, onOptions, onZoom }: ToolboxProps) {
  const dot = (px: number, round: boolean) => (
    <span
      className={styles.dot}
      style={{ width: px, height: px, borderRadius: round ? '50%' : 0 }}
    />
  );
  switch (tool) {
    case 'brush':
      return BRUSH_SIZES.map((n) => ({
        key: `b${n}`,
        label: `Brush size ${n}`,
        active: options.brushSize === n,
        preview: dot(n, true),
        pick: () => onOptions({ brushSize: n }),
      }));
    case 'eraser':
      return ERASER_SIZES.map((n) => ({
        key: `e${n}`,
        label: `Eraser size ${n}`,
        active: options.eraserSize === n,
        preview: dot(n, false),
        pick: () => onOptions({ eraserSize: n }),
      }));
    case 'airbrush':
      return AIRBRUSH_RADII.map((n) => ({
        key: `a${n}`,
        label: `Airbrush size ${n}`,
        active: options.airbrushRadius === n,
        preview: (
          <span
            className={styles.spray}
            style={{ width: n * 1.6, height: n * 1.6 }}
          />
        ),
        pick: () => onOptions({ airbrushRadius: n }),
      }));
    case 'magnifier':
      return ZOOMS.map((z) => ({
        key: `z${z}`,
        label: `Zoom ${z}x`,
        active: zoom === z,
        preview: <span>{z}x</span>,
        pick: () => onZoom(z),
      }));
    case 'line':
      return LINE_WIDTHS.map((n) => ({
        key: `l${n}`,
        label: `Line width ${n}`,
        active: options.lineWidth === n,
        preview: <span className={styles.lineSample} style={{ height: n }} />,
        pick: () => onOptions({ lineWidth: n }),
      }));
    case 'rect':
    case 'ellipse':
    case 'roundrect':
      return SHAPE_MODES.map(({ mode, label }) => ({
        key: mode,
        label,
        active: options.shapeMode === mode,
        preview: <span className={styles.modeSample} data-mode={mode} />,
        pick: () => onOptions({ shapeMode: mode }),
      }));
    default:
      return [];
  }
}

export function Toolbox(props: ToolboxProps) {
  const choices: Choice[] = choicesFor(props);
  return (
    <div className={styles.toolbox}>
      <div className={styles.tools} role="toolbar" aria-label="Tools">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={styles.tool}
            aria-label={t.label}
            aria-pressed={props.tool === t.id}
            title={t.label}
            onClick={() => props.onTool(t.id)}
          >
            {TOOL_ICONS[t.id]}
          </button>
        ))}
      </div>
      <div className={styles.options} role="group" aria-label="Tool options">
        {choices.map((c) => (
          <button
            key={c.key}
            type="button"
            className={styles.option}
            aria-label={c.label}
            aria-pressed={c.active}
            title={c.label}
            onClick={c.pick}
          >
            {c.preview}
          </button>
        ))}
      </div>
    </div>
  );
}
