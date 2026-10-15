// Today's HOT or NOT poll. The player's vote persists in `web.votes`; after voting it shows results.
import { useId, useState, type FormEvent } from 'react';
import { GOSSIP_HOST } from '@/content/sites/celebgossip07';
import { useSiteText } from '../useSiteText';
import { useWebStore } from '../../store';
import styles from './CelebGossip.module.css';
import { currentPoll, pollTally } from './logic';

export function HotOrNot({ day }: { day: number }) {
  const { GOSSIP_POLLS, GOSSIP_TEXT: T } = useSiteText(GOSSIP_HOST);
  const poll = currentPoll(GOSSIP_POLLS, day);
  const voted = useWebStore((s) => (poll ? s.votes[poll.id] : undefined));
  const vote = useWebStore((s) => s.vote);
  const [choice, setChoice] = useState<number | null>(null);
  const [nag, setNag] = useState(false);
  const id = useId();
  if (!poll) return null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (choice === null) {
      setNag(true);
      return;
    }
    vote(poll.id, choice);
  };

  return (
    <section className={`${styles.box} ${styles.poll}`} aria-label="Poll">
      <h2>{T.pollHeading}</h2>
      <p className={styles.question} id={`${id}-q`}>
        {poll.question}
      </p>
      {voted === undefined ? (
        <form onSubmit={submit} aria-labelledby={`${id}-q`}>
          {poll.options.map((option, i) => (
            // xp.css draws radios only as `input#id + label[for=id]` siblings.
            <div key={option} className={styles.option}>
              <input
                type="radio"
                id={`${id}-${i}`}
                name={`${id}-poll`}
                checked={choice === i}
                onChange={() => {
                  setChoice(i);
                  setNag(false);
                }}
              />
              <label htmlFor={`${id}-${i}`}>{option}</label>
            </div>
          ))}
          <button type="submit" className={styles.button}>
            VOTE!!!
          </button>
          {nag && (
            <p role="alert" className={styles.nag}>
              pick 1 first!!!
            </p>
          )}
        </form>
      ) : (
        <>
          <ul className={styles.results} aria-label="Poll results">
            {pollTally(poll, voted).map((r, i) => (
              <li key={r.option}>
                <span>
                  {r.option}
                  {i === voted && ' ← u'}
                </span>
                <span className={styles.bar} aria-hidden>
                  <span style={{ width: `${r.percent}%` }} />
                </span>
                <span>{r.percent}%</span>
              </li>
            ))}
          </ul>
          <p role="status" className={styles.thanks}>
            thx 4 voting!!! new poll 2morrow
          </p>
        </>
      )}
    </section>
  );
}
