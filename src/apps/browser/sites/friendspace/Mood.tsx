// "Mood: hyper :D" with the emoticon drawn from the shared emoticon SVGs (codes as in Messenger).
import grin from '@/assets/emoticons/grin.svg';
import heart from '@/assets/emoticons/heart.svg';
import music from '@/assets/emoticons/music.svg';
import sad from '@/assets/emoticons/sad.svg';
import smile from '@/assets/emoticons/smile.svg';
import surprised from '@/assets/emoticons/surprised.svg';
import thumbsDown from '@/assets/emoticons/thumbs-down.svg';
import thumbsUp from '@/assets/emoticons/thumbs-up.svg';
import tongue from '@/assets/emoticons/tongue.svg';
import wink from '@/assets/emoticons/wink.svg';
import { useT } from '@/i18n/useT';
import styles from './Friendspace.module.css';

const ICONS: Record<string, string> = {
  ':)': smile,
  ':D': grin,
  ';)': wink,
  ':P': tongue,
  ':(': sad,
  ':O': surprised,
  '(Y)': thumbsUp,
  '(N)': thumbsDown,
  '(L)': heart,
  '<3': heart,
  '(8)': music,
};

export function MoodIcon({ code }: { code: string }) {
  const src = ICONS[code.toUpperCase()] ?? ICONS[code];
  if (!src) return <>{code}</>;
  return (
    <img
      className={styles.emoticon}
      src={src}
      alt={code}
      width={19}
      height={19}
    />
  );
}

export function Mood({ text, emoticon }: { text: string; emoticon: string }) {
  const t = useT();
  return (
    <div className={styles.mood}>
      <b>{t('sites.friendspace.mood')}</b> {text} <MoodIcon code={emoticon} />
    </div>
  );
}
