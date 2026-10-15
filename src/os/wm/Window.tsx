// One window: the XP frame (chrome 'xp') or a bare positioned box (chrome 'none').
import { Suspense, type CSSProperties, type MouseEvent } from 'react';
import { useWindowsStore } from '@/os/store/windows';
import { WM_MIN_SIZE, type AppDefinition, type WindowState } from '@/os/types';
import { requestClose } from './closeGuard';
import { ResizeHandles } from './ResizeHandles';
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

  const focus = () => actions().focusWindow(win.id);
  const content = (
    <Suspense fallback={null}>
      <AppComponent windowId={win.id} props={win.props} />
    </Suspense>
  );

  const rootProps = {
    'aria-label': win.title,
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

  function onTitleDoubleClick(e: MouseEvent<HTMLDivElement>) {
    if (isFromControl(e.target) || app.fixedSize) return;
    actions().toggleMaximize(win.id);
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
        onDoubleClick={onTitleDoubleClick}
        {...drag}
      >
        <img
          className={styles.icon}
          src={app.icon16}
          alt=""
          width={16}
          height={16}
        />
        <div className={cx('title-bar-text', styles.titleText)}>
          {win.title}
        </div>
        <div className="title-bar-controls">
          <button
            type="button"
            aria-label="Minimize"
            onClick={() => actions().minimizeWindow(win.id)}
          />
          <button
            type="button"
            aria-label={win.maximized ? 'Restore' : 'Maximize'}
            disabled={app.fixedSize}
            onClick={() => actions().toggleMaximize(win.id)}
          />
          <button
            type="button"
            aria-label="Close"
            onClick={() => requestClose(win.id)}
          />
        </div>
      </div>
      <div className={styles.body}>{content}</div>
      {!win.maximized && !app.fixedSize && (
        <ResizeHandles windowId={win.id} minSize={app.minSize ?? WM_MIN_SIZE} />
      )}
    </section>
  );
}
