// Connect to the Internet: the dial-up dialog. A thin view over the network store; dialling,
// the modem sound and closing on success live in `src/os/network.ts`.
import { useId, useState } from 'react';
import { dial, useNetworkStore, type NetPhase } from '@/os/network';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import type { AppComponentProps } from '@/os/types';
import styles from './Dialup.module.css';

export const PHONE_NUMBER = '555-0137';

export const PHASE_TEXT: Readonly<Partial<Record<NetPhase, string>>> = {
  dialing: 'Dialing…',
  verifying: 'Verifying user name and password…',
  registering: 'Registering your computer on the network…',
};

/** The dial-up login: the player's name, lowercased with no spaces. */
export function userNameFor(playerName: string): string {
  return playerName.toLowerCase().replace(/[^a-z0-9._-]+/g, '') || 'player';
}

/** Two computers and a line between them; the line blinks while dialling. */
function ConnectionIcon({ active }: { active: boolean }) {
  return (
    <svg
      className={styles.icon}
      data-active={active}
      width="48"
      height="28"
      viewBox="0 0 48 28"
      aria-hidden="true"
    >
      {[0, 30].map((x) => (
        <g key={x} transform={`translate(${x} 4)`}>
          <rect
            x="0.5"
            y="0.5"
            width="17"
            height="13"
            rx="1.5"
            fill="#d9e4f2"
            stroke="#2f4f8f"
          />
          <rect x="3" y="3" width="12" height="8" fill="#4f8fe0" />
          <rect x="5" y="15" width="8" height="3" fill="#8a97ab" />
        </g>
      ))}
      {[20, 24, 28].map((x, i) => (
        <rect
          key={x}
          className={styles.dot}
          style={{ animationDelay: `${i * 0.2}s` }}
          x={x - 1}
          y="10"
          width="2"
          height="2"
          fill="#2e8b2e"
        />
      ))}
    </svg>
  );
}

export default function Dialup({ windowId }: AppComponentProps) {
  const status = useNetworkStore((s) => s.status);
  const phase = useNetworkStore((s) => s.phase);
  const kbps = useNetworkStore((s) => s.kbps);
  const playerName = useSettingsStore((s) => s.playerName);
  const auto = useSettingsStore((s) => s.connectAutomatically);
  const setAuto = useSettingsStore((s) => s.setConnectAutomatically);
  const [userName, setUserName] = useState(() => userNameFor(playerName));
  const [savePassword, setSavePassword] = useState(true);
  const id = useId();

  const dialing = status === 'dialing';
  const statusText = dialing
    ? (PHASE_TEXT[phase] ?? 'Dialing…')
    : status === 'online'
      ? `Connected at ${kbps.toFixed(1)} Kbps.`
      : '';

  function onCancel() {
    if (dialing) useNetworkStore.getState().cancel();
    else useWindowsStore.getState().closeWindow(windowId);
  }

  return (
    <form
      className={styles.root}
      onSubmit={(e) => {
        e.preventDefault();
        dial();
      }}
    >
      <div className={styles.grid}>
        <label htmlFor={`${id}-user`}>User name:</label>
        <input
          id={`${id}-user`}
          type="text"
          value={userName}
          disabled={dialing}
          onChange={(e) => setUserName(e.target.value)}
        />
        <label htmlFor={`${id}-password`}>Password:</label>
        <input
          id={`${id}-password`}
          type="password"
          value="••••••••"
          disabled
          readOnly
        />
        <span />
        <div className={styles.check}>
          <input
            id={`${id}-save`}
            type="checkbox"
            checked={savePassword}
            disabled={dialing}
            onChange={(e) => setSavePassword(e.target.checked)}
          />
          <label htmlFor={`${id}-save`}>Save password</label>
        </div>
        <label htmlFor={`${id}-number`}>Dial:</label>
        <input id={`${id}-number`} type="text" value={PHONE_NUMBER} readOnly />
      </div>
      <div className={styles.check}>
        <input
          id={`${id}-auto`}
          type="checkbox"
          checked={auto}
          onChange={(e) => setAuto(e.target.checked)}
        />
        <label htmlFor={`${id}-auto`}>Connect automatically</label>
      </div>
      <div className={styles.status} data-testid="dialup-status">
        {status !== 'offline' && <ConnectionIcon active={dialing} />}
        <span role="status">{statusText}</span>
      </div>
      <div className={styles.buttons}>
        <button type="submit" disabled={status !== 'offline'}>
          Dial
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        <button type="button">Properties</button>
      </div>
    </form>
  );
}
