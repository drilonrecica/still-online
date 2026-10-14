import { useNotepadStore } from './store';

export default function Notepad() {
  const text = useNotepadStore((s) => s.text);
  const setText = useNotepadStore((s) => s.setText);

  return (
    <textarea
      aria-label="Notepad document"
      spellCheck={false}
      value={text}
      onChange={(e) => setText(e.target.value)}
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        resize: 'none',
        border: 'none',
        outline: 'none',
        fontFamily: '"Lucida Console", "Courier New", monospace',
        fontSize: 13,
      }}
    />
  );
}
