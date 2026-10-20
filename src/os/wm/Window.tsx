// One window: the XP frame (chrome 'xp') or a bare positioned box (chrome 'none').
import { Suspense, useId, type CSSProperties } from 'react';
import { useLocale, useT } from '@/i18n/useT';
import { getDevice } from '@/os/device';
import { useWindowsStore } from '@/os/store/windows';
import { composeHandlers } from '@/os/touch/compose';
import { useActivate } from '@/os/touch/useActivate';
import { WM_MIN_SIZE, type AppDefinition, type WindowState } from '@/os/types';
import { requestClose } from './closeGuard';
import { ResizeHandles } from './ResizeHandles';
import { renderWindowTitle } from './title';
import { isFromControl, useWindowDrag } from './useWindowDrag';
import styles from './Window.module.css';

export interface WindowProps {
  win: WindowState;
  app: AppDefinition;
  /** True for the front-most non-minimized window. */
  active: boolean;
}

function cx(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}

function frameStyle(win: WindowState): CSSProperties {
  // Maximized fills the work area via CSS; x/y/w/h stay the restore geometry.
  if (win.maximized) return { zIndex: win.z };
  return {
    left: win.x,
    top: win.y,
    width: win.w,
    height: win.h,
    zIndex: win.z,
  };
}

export function Window({ win, app, active }: WindowProps) {
  const drag = useWindowDrag(win.id);
  const actions = () => useWindowsStore.getState();
  const AppComponent = app.component;
  const title = renderWindowTitle(win, app, useLocale());
  const t = useT();
  const labelId = useId();
  // Double-click, or a double-tap on a tablet (phone windows are always maximized).
  const activateTitle = useActivate(
    (_: void, via, target) => {
      if (isFromControl(target) || app.fixedSize) return;
      if (via === 'touch' && getDevice() === 'phone') return;
      actions().toggleMaximize(win.id);
    },
    { touchTaps: 2, enter: false },
  );

  const focus = () => actions().focusWindow(win.id);
  const content = (
    <Suspense fallback={null}>
      <AppComponent windowId={win.id} props={win.props} />
    </Suspense>
  );

  const rootProps = {
    'aria-label': title,
    'data-window-id': win.id,
    'data-active': active,
    hidden: win.minimized,
    style: frameStyle(win),
    // Capture phase: focus even when the app stops propagation.
    onMouseDownCapture: focus,
    onFocusCapture: focus,
  };

  if (app.chrome === 'none') {
    return (
      <section
        {...rootProps}
        className={cx(styles.frame, win.maximized && styles.maximized)}
      >
        {content}
      </section>
    );
  }

  return (
    <section
      {...rootProps}
      className={cx(
        'window',
        styles.frame,
        !active && styles.inactive,
        win.maximized && styles.maximized,
      )}
    >
      <div
        className={cx('title-bar', styles.titleBar)}
        {...composeHandlers(drag, activateTitle())}
      >
        <img
          className={styles.icon}
          src={app.icon16}
          alt=""
          width={16}
          height={16}
        />
        <div className={cx('title-bar-text', styles.titleText)}>{title}</div>
        {/* xp.css draws each control's icon from an English `aria-label`, so that attribute is a
            styling hook only; `aria-labelledby` carries the localized accessible name. */}
        <div className="title-bar-controls">
          <button
            type="button"
            aria-label="Minimize"
            aria-labelledby={`${labelId}-min`}
            onClick={() => actions().minimizeWindow(win.id)}
          />
          <button
            type="button"
            aria-label={win.maximized ? 'Restore' : 'Maximize'}
            aria-labelledby={`${labelId}-max`}
            disabled={app.fixedSize}
            onClick={() => actions().toggleMaximize(win.id)}
          />
          <button
            type="button"
            aria-label="Close"
            aria-labelledby={`${labelId}-close`}
            onClick={() => requestClose(win.id)}
          />
          <span hidden id={`${labelId}-min`}>
            {t('wm.minimize')}
          </span>
          <span hidden id={`${labelId}-max`}>
            {win.maximized ? t('wm.restore') : t('wm.maximize')}
          </span>
          <span hidden id={`${labelId}-close`}>
            {t('wm.close')}
          </span>
        </div>
      </div>
      <div className={styles.body}>{content}</div>
      {!win.maximized && !app.fixedSize && (
        <ResizeHandles windowId={win.id} minSize={app.minSize ?? WM_MIN_SIZE} />
      )}
    </section>
  );
}
