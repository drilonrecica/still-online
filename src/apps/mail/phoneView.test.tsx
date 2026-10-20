import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { MailContent } from '@/content/mail/types';
import { useDeviceStore } from '@/os/device';
import { useNetworkStore } from '@/os/network';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import '@/apps/registry';
import Mail from './Mail';
import { mailPhoneView } from './phoneView';
import { MAIL_DEFAULTS, useMailStore } from './store';

const CONTENT: MailContent[] = [
  {
    id: 'd1-a',
    day: 1,
    from: { name: 'Mom', address: 'mom@homemail.example' },
    subject: 'dinner at 6',
    body: 'pasta tonight',
  },
];

describe('mailPhoneView', () => {
  it('shows Compose whenever there is a draft', () => {
    expect(
      mailPhoneView({ composing: true, reading: true, hasSelection: true }),
    ).toBe('compose');
    expect(
      mailPhoneView({ composing: true, reading: false, hasSelection: false }),
    ).toBe('compose');
  });

  it('shows the message while reading one, else the list', () => {
    expect(
      mailPhoneView({ composing: false, reading: true, hasSelection: true }),
    ).toBe('message');
    expect(
      mailPhoneView({ composing: false, reading: false, hasSelection: true }),
    ).toBe('list');
    // The message went away (deleted, another folder): back to the list.
    expect(
      mailPhoneView({ composing: false, reading: true, hasSelection: false }),
    ).toBe('list');
  });
});

describe('Mail on a phone', () => {
  beforeEach(() => {
    localStorage.clear();
    useDeviceStore.setState({ device: 'phone' });
    useWindowsStore.setState({ windows: [], topZ: 0 });
    useSettingsStore.setState({ muted: true });
    useMailStore.setState({
      ...MAIL_DEFAULTS,
      messages: [],
      deliveredDays: [],
    });
    useMailStore.getState().deliver(1, CONTENT, 1_000_000);
    useNetworkStore.setState({ status: 'online', kbps: 56 });
  });

  afterEach(() => useDeviceStore.setState({ device: 'desktop' }));

  function renderMail() {
    const windowId = useWindowsStore.getState().openApp('mail', {});
    render(<Mail windowId={windowId} props={{}} />);
    return userEvent.setup();
  }

  it('stacks a folder drop-down over the list, opens a message, and goes Back', async () => {
    const user = renderMail();
    const folders = screen.getByRole('combobox', { name: 'Folders' });
    expect(folders).toHaveValue('inbox');
    expect(screen.queryByRole('list', { name: 'Folders' })).toBeNull();
    expect(screen.queryByRole('region', { name: 'Preview' })).toBeNull();

    await user.click(screen.getByRole('row', { name: /dinner at 6/ }));
    const preview = screen.getByRole('region', { name: 'Preview' });
    expect(preview).toHaveTextContent('pasta tonight');
    expect(screen.queryByRole('table', { name: 'Messages' })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.queryByRole('region', { name: 'Preview' })).toBeNull();
    expect(screen.getByRole('table', { name: 'Messages' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull();
  });

  it('replies full screen and returns to the message on Cancel', async () => {
    const user = renderMail();
    await user.click(screen.getByRole('row', { name: /dinner at 6/ }));
    await user.click(screen.getByRole('button', { name: 'Reply' }));
    const form = screen.getByRole('form', { name: 'Create Mail' });
    expect(within(form).getByLabelText('To')).toHaveValue(
      'mom@homemail.example',
    );
    expect(screen.queryByRole('combobox', { name: 'Folders' })).toBeNull();
    await user.click(within(form).getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('region', { name: 'Preview' })).toBeInTheDocument();
  });

  it('switches folders from the drop-down', async () => {
    const user = renderMail();
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Folders' }),
      'sent',
    );
    expect(
      screen.getByText('There are no messages in this folder.'),
    ).toBeVisible();
  });

  it('says Back in German', async () => {
    useSettingsStore.setState({ language: 'de' });
    const user = renderMail();
    await user.click(screen.getByRole('row', { name: /dinner at 6/ }));
    expect(screen.getByRole('button', { name: 'Zurück' })).toBeInTheDocument();
  });
});
