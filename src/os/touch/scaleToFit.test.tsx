import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ScaleToFit, fitScale, toStage } from './ScaleToFit';

describe('fitScale', () => {
  it('fits by the tighter side, keeping the aspect ratio', () => {
    // A 460×640 pinball table in a 412×780 phone window: the width limits.
    expect(fitScale(412, 780, 460, 640)).toBe(0.895);
    // An 800×540 field in a landscape 915×340: the height limits.
    expect(fitScale(915, 340, 800, 540)).toBe(0.629);
  });

  it('grows a small stage unless told not to', () => {
    expect(fitScale(400, 400, 200, 100)).toBe(2);
    expect(fitScale(400, 400, 200, 100, { grow: false })).toBe(1);
    expect(fitScale(100, 400, 200, 100, { grow: false })).toBe(0.5);
  });

  it('rounds down, so the zoomed stage never overruns the box', () => {
    const s = fitScale(333, 1000, 1000, 100);
    expect(1000 * s).toBeLessThanOrEqual(333);
  });

  it('is 1 for a box that is not laid out yet', () => {
    expect(fitScale(0, 0, 460, 640)).toBe(1);
    expect(fitScale(Number.NaN, 300, 460, 640)).toBe(1);
  });
});

describe('toStage', () => {
  it('maps on-screen client pixels to unzoomed stage pixels', () => {
    const rect = { left: 10, top: 50 };
    expect(toStage(10, 50, rect, 0.5)).toEqual({ x: 0, y: 0 });
    expect(toStage(240, 370, rect, 0.5)).toEqual({ x: 460, y: 640 });
    expect(toStage(110, 150, rect, 2)).toEqual({ x: 50, y: 50 });
  });

  it('treats a missing scale as 1', () => {
    expect(toStage(30, 40, { left: 10, top: 20 }, 0)).toEqual({ x: 20, y: 20 });
  });
});

describe('<ScaleToFit>', () => {
  it('renders the children bare when inactive', () => {
    const { container } = render(
      <ScaleToFit width={460} height={640} active={false}>
        <p>table</p>
      </ScaleToFit>,
    );
    expect(container.innerHTML).toBe('<p>table</p>');
  });

  it('lays the stage out at its own size with a zoom', () => {
    render(
      <ScaleToFit width={460} height={640}>
        <p>table</p>
      </ScaleToFit>,
    );
    const stage = screen.getByTestId('scale-stage');
    expect(stage.style.width).toBe('460px');
    expect(stage.style.height).toBe('640px');
    // jsdom has no layout: the box is 0×0, so the zoom falls back to 1.
    expect(stage.style.zoom).toBe('1');
    expect(stage.textContent).toBe('table');
  });
});
