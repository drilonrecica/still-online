// Templates with React parts: `rich('Hi {name}!', { name: <b>Ada</b> })`. For catalog keys, pass
// each token as its own param (`t(key, { n: '{n}' })`) so it survives `t()` and lands here.
import { Fragment, type ReactNode } from 'react';

export function rich(
  template: string,
  parts: Readonly<Record<string, ReactNode>>,
): ReactNode {
  return template.split(/(\{\w+\})/).map((piece, i) => {
    const name = /^\{(\w+)\}$/.exec(piece)?.[1];
    const part = name !== undefined && name in parts ? parts[name] : piece;
    return <Fragment key={i}>{part}</Fragment>;
  });
}
