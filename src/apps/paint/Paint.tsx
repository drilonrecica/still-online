// Paint: the classic drawing app. Logic lives in plain TS on a PixelBuffer; this component wires it up.
import { useState, type KeyboardEvent } from 'react';
import { useT } from '@/i18n/useT';
import type { AppComponentProps } from '@/os/types';
import { ColorBox } from './ColorBox';
import { AttributesDialog, ImageFileDialog, MessageBox } from './dialogs';
import { MenuBar, type Menu } from './MenuBar';
import { DEFAULT_PRIMARY, DEFAULT_SECONDARY } from './palette';
import { PaintCanvas } from './PaintCanvas';
import { createBuffer, hexToRgba, resizeBuffer, rgbaToHex } from './pixels';
import { Toolbox } from './Toolbox';
import {
  DEFAULT_OPTIONS,
  ZOOMS,
  type ToolId,
  type ToolOptions,
  type Zoom,
} from './tools';
import { useCanvasTools } from './useCanvasTools';
import { usePaintDocument } from './useDocument';
import { usePaintFiles } from './usePaintFiles';
import styles from './Paint.module.css';

export default function Paint({ windowId, props }: AppComponentProps) {
  const t = useT();
  const doc = usePaintDocument();
  const [tool, setToolState] = useState<ToolId>('pencil');
  const [lastTool, setLastTool] = useState<ToolId>('pencil');
  const [primary, setPrimary] = useState(DEFAULT_PRIMARY);
  const [secondary, setSecondary] = useState(DEFAULT_SECONDARY);
  const [options, setOptions] = useState<ToolOptions>(DEFAULT_OPTIONS);
  const [zoom, setZoom] = useState<Zoom>(1);
  const [magnify, setMagnify] = useState<Zoom>(4);

  const tools = useCanvasTools(doc, {
    tool,
    primary: hexToRgba(primary),
    secondary: hexToRgba(secondary),
    options,
    zoom,
    onPick: (color, second) => {
      (second ? setSecondary : setPrimary)(rgbaToHex(color));
      setToolState(lastTool);
    },
    onZoomToggle: () => setZoom(zoom === 1 ? magnify : 1),
  });
  const files = usePaintFiles(
    doc,
    windowId,
    typeof props.fileId === 'string' ? props.fileId : null,
    tools.settle,
  );

  function setTool(next: ToolId) {
    tools.settle();
    if (next !== 'picker' && next !== 'magnifier') setLastTool(next);
    setToolState(next);
  }

  function chooseZoom(z: Zoom) {
    setZoom(z);
    if (z !== 1) setMagnify(z);
  }

  function undo() {
    tools.settle();
    doc.undo();
  }

  function redo() {
    tools.settle();
    doc.redo();
  }

  function clearImage() {
    tools.settle();
    doc.replace(
      createBuffer(doc.buf.w, doc.buf.h, hexToRgba(secondary)),
      false,
    );
  }

  const menus: Menu[] = [
    {
      id: 'file',
      label: t('paint.menu.file'),
      items: [
        {
          label: t('paint.menu.new'),
          shortcut: t('paint.shortcut.new'),
          onSelect: () => files.guarded('new'),
        },
        {
          label: t('paint.menu.open'),
          shortcut: t('paint.shortcut.open'),
          onSelect: () => files.guarded('open'),
        },
        {
          label: t('paint.menu.save'),
          shortcut: t('paint.shortcut.save'),
          onSelect: () => void files.save(),
        },
        {
          label: t('paint.menu.saveAs'),
          onSelect: () => {
            tools.settle();
            files.setDialog({ kind: 'file', mode: 'saveAs' });
          },
        },
        {
          label: t('paint.menu.bgTiled'),
          separator: true,
          onSelect: () => void files.background('tile'),
        },
        {
          label: t('paint.menu.bgCentered'),
          onSelect: () => void files.background('center'),
        },
        {
          label: t('paint.menu.displayPicture'),
          onSelect: files.displayPicture,
        },
        {
          label: t('paint.menu.exit'),
          separator: true,
          onSelect: () => files.guarded('exit'),
        },
      ],
    },
    {
      id: 'edit',
      label: t('paint.menu.edit'),
      items: [
        {
          label: t('paint.menu.undo'),
          shortcut: t('paint.shortcut.undo'),
          disabled: !doc.canUndo,
          onSelect: undo,
        },
        {
          label: t('paint.menu.redo'),
          shortcut: t('paint.shortcut.redo'),
          disabled: !doc.canRedo,
          onSelect: redo,
        },
        {
          label: t('paint.menu.selectAll'),
          shortcut: t('paint.shortcut.selectAll'),
          separator: true,
          onSelect: () => {
            setToolState('select');
            tools.selectAll();
          },
        },
        {
          label: t('paint.menu.clearSelection'),
          shortcut: t('paint.menu.delKey'),
          disabled: !tools.selection,
          onSelect: tools.deleteSelection,
        },
      ],
    },
    {
      id: 'view',
      label: t('paint.menu.view'),
      items: ZOOMS.map((z) => ({
        label: z === 1 ? t('paint.menu.normalSize') : t('paint.zoom', { n: z }),
        checked: zoom === z,
        onSelect: () => chooseZoom(z),
      })),
    },
    {
      id: 'image',
      label: t('paint.menu.image'),
      items: [
        {
          label: t('paint.menu.attributes'),
          shortcut: t('paint.shortcut.attributes'),
          onSelect: () => {
            tools.settle();
            files.setDialog({ kind: 'attributes' });
          },
        },
        { label: t('paint.menu.clearImage'), onSelect: clearImage },
      ],
    },
    {
      id: 'help',
      label: t('paint.menu.help'),
      items: [
        {
          label: t('paint.menu.about'),
          onSelect: () =>
            files.setDialog({
              kind: 'message',
              text: t('paint.aboutText'),
            }),
        },
      ],
    },
  ];

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (
      files.dialog ||
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLInputElement
    )
      return;
    const key = e.key.toLowerCase();
    const ctrl = e.ctrlKey || e.metaKey;
    const actions: Record<string, () => void> = ctrl
      ? {
          z: undo,
          y: redo,
          s: () => void files.save(),
          o: () => files.guarded('open'),
          n: () => files.guarded('new'),
          a: () => {
            setToolState('select');
            tools.selectAll();
          },
          e: () => files.setDialog({ kind: 'attributes' }),
        }
      : { delete: tools.deleteSelection, escape: tools.settle };
    const action = actions[key];
    if (!action) return;
    e.preventDefault();
    action();
  }

  const d = files.dialog;
  return (
    <div className={styles.root} onKeyDown={onKeyDown}>
      <MenuBar menus={menus} />
      <div className={styles.main}>
        <Toolbox
          tool={tool}
          options={options}
          zoom={zoom}
          onTool={setTool}
          onOptions={(patch) => setOptions((o) => ({ ...o, ...patch }))}
          onZoom={chooseZoom}
        />
        <PaintCanvas doc={doc} tools={tools} tool={tool} zoom={zoom} />
      </div>
      <ColorBox
        primary={primary}
        secondary={secondary}
        onPick={(hex, second) => (second ? setSecondary : setPrimary)(hex)}
      />
      <div className={styles.status} aria-live="off">
        <span>
          {tool === 'text' ? t('paint.status.text') : t('paint.status.draw')}
        </span>
        <span className={styles.statusCell}>
          {tools.cursor ? `${tools.cursor.x},${tools.cursor.y}` : ''}
        </span>
        <span
          className={styles.statusCell}
        >{`${doc.size.w}x${doc.size.h}`}</span>
      </div>

      {d?.kind === 'confirm' && (
        <MessageBox
          text={t('paint.confirmSave', {
            file: files.name ?? t('paint.untitled'),
          })}
          buttons={[
            {
              label: t('common.yes'),
              onClick: () => void files.save(d.action),
            },
            { label: t('common.no'), onClick: () => files.run(d.action) },
            { label: t('common.cancel'), onClick: () => files.setDialog(null) },
          ]}
        />
      )}
      {d?.kind === 'message' && (
        <MessageBox
          text={d.text}
          buttons={[
            { label: t('common.ok'), onClick: () => files.setDialog(null) },
          ]}
        />
      )}
      {d?.kind === 'attributes' && (
        <AttributesDialog
          width={doc.size.w}
          height={doc.size.h}
          onCancel={() => files.setDialog(null)}
          onOk={(w, h) => {
            files.setDialog(null);
            if (w !== doc.buf.w || h !== doc.buf.h)
              doc.replace(
                resizeBuffer(doc.buf, w, h, hexToRgba(secondary)),
                false,
              );
          }}
        />
      )}
      {d?.kind === 'file' && (
        <ImageFileDialog
          key={d.mode}
          mode={d.mode}
          initialFolderId={files.startFolder}
          initialName={d.mode === 'saveAs' ? files.defaultSaveName : ''}
          onOpen={(node) => void files.open(node)}
          onSave={(folderId, name) => void files.saveTo(folderId, name, d.then)}
          onCancel={() => files.setDialog(null)}
        />
      )}
    </div>
  );
}
