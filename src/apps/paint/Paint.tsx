// Paint: the classic drawing app. Logic lives in plain TS on a PixelBuffer; this component wires it up.
import { useState, type KeyboardEvent } from 'react';
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
      label: 'File',
      items: [
        {
          label: 'New',
          shortcut: 'Ctrl+N',
          onSelect: () => files.guarded('new'),
        },
        {
          label: 'Open…',
          shortcut: 'Ctrl+O',
          onSelect: () => files.guarded('open'),
        },
        {
          label: 'Save',
          shortcut: 'Ctrl+S',
          onSelect: () => void files.save(),
        },
        {
          label: 'Save As…',
          onSelect: () => {
            tools.settle();
            files.setDialog({ kind: 'file', mode: 'saveAs' });
          },
        },
        {
          label: 'Set As Background (Tiled)',
          separator: true,
          onSelect: () => void files.background('tile'),
        },
        {
          label: 'Set As Background (Centered)',
          onSelect: () => void files.background('center'),
        },
        { label: 'Use as display picture', onSelect: files.displayPicture },
        {
          label: 'Exit',
          separator: true,
          onSelect: () => files.guarded('exit'),
        },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        {
          label: 'Undo',
          shortcut: 'Ctrl+Z',
          disabled: !doc.canUndo,
          onSelect: undo,
        },
        {
          label: 'Redo',
          shortcut: 'Ctrl+Y',
          disabled: !doc.canRedo,
          onSelect: redo,
        },
        {
          label: 'Select All',
          shortcut: 'Ctrl+A',
          separator: true,
          onSelect: () => {
            setToolState('select');
            tools.selectAll();
          },
        },
        {
          label: 'Clear Selection',
          shortcut: 'Del',
          disabled: !tools.selection,
          onSelect: tools.deleteSelection,
        },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: ZOOMS.map((z) => ({
        label: z === 1 ? 'Normal Size' : `Zoom ${z}x`,
        checked: zoom === z,
        onSelect: () => chooseZoom(z),
      })),
    },
    {
      id: 'image',
      label: 'Image',
      items: [
        {
          label: 'Attributes…',
          shortcut: 'Ctrl+E',
          onSelect: () => {
            tools.settle();
            files.setDialog({ kind: 'attributes' });
          },
        },
        { label: 'Clear Image', onSelect: clearImage },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        {
          label: 'About Paint',
          onSelect: () =>
            files.setDialog({
              kind: 'message',
              text: 'Paint\nA still online accessory. Pictures stay on this computer.',
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
          {tool === 'text'
            ? 'Click to place text, Enter to finish.'
            : 'Left click draws with the primary colour, right click with the secondary.'}
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
          text={`Save changes to ${files.name}?`}
          buttons={[
            { label: 'Yes', onClick: () => void files.save(d.action) },
            { label: 'No', onClick: () => files.run(d.action) },
            { label: 'Cancel', onClick: () => files.setDialog(null) },
          ]}
        />
      )}
      {d?.kind === 'message' && (
        <MessageBox
          text={d.text}
          buttons={[{ label: 'OK', onClick: () => files.setDialog(null) }]}
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
