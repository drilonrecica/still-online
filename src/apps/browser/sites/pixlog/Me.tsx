// pixlog.example `/me`: the player's own page. Name and picture, kudos received, the visitors box,
// a skin picker, an album filled from My Pictures with the player's captions, and the surveys they
// filled in. Everything is saved in the `web` store's `pixlog` (P0-02).
import { useState } from 'react';
import { getPixlogProfiles, getSurveys } from '@/content/locale';
import { PIXLOG_SKINS, type Survey } from '@/content/pixlog/types';
import { PIXLOG_HOST } from '@/content/sites/pixlog';
import { useGender, usePlayerName } from '@/i18n/settingsText';
import { interpolate } from '@/i18n/t';
import { useLocale } from '@/i18n/useT';
import { FsIcon } from '@/os/fs/FsIcon';
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS } from '@/os/fs/types';
import { useWorldStore } from '@/os/world';
import { useWebStore } from '../../store';
import { PIXLOG_DEFAULTS, WEB_LIMITS, pixlogSkinFor } from '../../webSanitize';
import { playerPicture } from '../friendspace/people';
import { Picture } from '../friendspace/Picture';
import { useSiteText } from '../useSiteText';
import { Layout } from './Layout';
import { albumPhotos, isAlbumImage, kudosReceived } from './logic';
import { VisitorsBox } from './Visitors';
import styles from './Pixlog.module.css';

type Text = ReturnType<typeof useSiteText<typeof PIXLOG_HOST>>['PIXLOG_TEXT'];

const usePixlog = () => useWebStore((s) => s.pixlog) ?? PIXLOG_DEFAULTS;

function SkinPicker({ T }: { T: Text }) {
  const gender = useGender();
  const skin = pixlogSkinFor(
    useWebStore((s) => s.pixlog),
    gender,
  );
  const setSkin = useWebStore((s) => s.setPixlogSkin);
  return (
    <section className={styles.box} aria-label={T.me.skinHeading}>
      <h2>{T.me.skinHeading}</h2>
      <div
        className={styles.swatches}
        role="group"
        aria-label={T.me.skinHeading}
      >
        {PIXLOG_SKINS.map((id) => (
          <button
            key={id}
            type="button"
            className={styles.swatch}
            data-swatch={id}
            aria-pressed={id === skin}
            aria-label={T.skins[id]}
            title={T.skins[id]}
            onClick={() => setSkin(id)}
          />
        ))}
      </div>
    </section>
  );
}

function AlbumBox({ T }: { T: Text }) {
  const { album } = usePixlog();
  const setAlbum = useWebStore((s) => s.setAlbum);
  const nodes = useFsStore((s) => s.nodes);
  const [editing, setEditing] = useState(false);
  const [picking, setPicking] = useState(false);
  const photos = albumPhotos(album, nodes);
  const inAlbum = new Set(album.map((e) => e.fsNodeId));
  const files = useFsStore
    .getState()
    .list(FS_FOLDERS.pics)
    .filter((n) => isAlbumImage(n) && !inAlbum.has(n.id));
  const full = photos.length >= WEB_LIMITS.album;
  // Writes start from what is shown, so entries of deleted files drop out for good.
  const save = (next: { fsNodeId: string; caption: string }[]) =>
    setAlbum(next.map(({ fsNodeId, caption }) => ({ fsNodeId, caption })));

  return (
    <section className={styles.box} aria-label={T.me.albumHeading}>
      <h2>{T.me.albumHeading}</h2>
      {photos.length === 0 && <p>{T.me.albumEmpty}</p>}
      <ul className={styles.albums}>
        {photos.map((p, i) => {
          const n = i + 1;
          return (
            <li key={p.fsNodeId}>
              <span
                role="img"
                aria-label={p.caption || interpolate(T.me.photoLabel, { n })}
                className={styles.thumb}
              >
                <FsIcon node={p.node} size={120} />
              </span>
              {editing ? (
                <>
                  <input
                    type="text"
                    value={p.caption}
                    maxLength={WEB_LIMITS.caption}
                    aria-label={interpolate(T.me.captionFor, { n })}
                    onChange={(e) =>
                      save(
                        photos.map((q) =>
                          q.fsNodeId === p.fsNodeId
                            ? { ...q, caption: e.target.value }
                            : q,
                        ),
                      )
                    }
                  />
                  <button
                    type="button"
                    aria-label={interpolate(T.me.removePhoto, { n })}
                    onClick={() =>
                      save(photos.filter((q) => q.fsNodeId !== p.fsNodeId))
                    }
                  >
                    {T.me.remove}
                  </button>
                </>
              ) : (
                p.caption && <strong>{p.caption}</strong>
              )}
            </li>
          );
        })}
      </ul>
      <p className={styles.loginRow}>
        {!full && (
          <button
            type="button"
            aria-expanded={picking}
            onClick={() => setPicking((v) => !v)}
          >
            {T.me.addPhotos}
          </button>
        )}
        {photos.length > 0 && (
          <button
            type="button"
            aria-pressed={editing}
            onClick={() => setEditing((v) => !v)}
          >
            {editing ? T.me.done : T.me.editAlbum}
          </button>
        )}
      </p>
      {full && <p>{interpolate(T.me.albumFull, { n: WEB_LIMITS.album })}</p>}
      {picking && !full && (
        <div className={styles.picker}>
          <h3>{T.me.pickerHeading}</h3>
          {files.length === 0 ? (
            <p>{T.me.pickerEmpty}</p>
          ) : (
            <ul className={styles.albums}>
              {files.map((node) => (
                <li key={node.id}>
                  <button
                    type="button"
                    className={styles.pick}
                    aria-label={interpolate(T.me.addPhoto, { name: node.name })}
                    onClick={() =>
                      save([...photos, { fsNodeId: node.id, caption: '' }])
                    }
                  >
                    <FsIcon node={node} size={80} />
                    <span>{node.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button type="button" onClick={() => setPicking(false)}>
            {T.me.close}
          </button>
        </div>
      )}
    </section>
  );
}

function SurveyForm({
  T,
  surveys,
  initial,
  onDone,
}: {
  T: Text;
  surveys: readonly Survey[];
  initial: string;
  onDone: () => void;
}) {
  const saved = usePixlog().surveys;
  const saveSurvey = useWebStore((s) => s.saveSurvey);
  const [surveyId, setSurveyId] = useState(initial);
  const survey = surveys.find((s) => s.id === surveyId);
  const answersFor = (id: string) => {
    const questions = surveys.find((s) => s.id === id)?.questions ?? [];
    return questions.map((_, i) => saved[id]?.[i] ?? '');
  };
  const [answers, setAnswers] = useState(() => answersFor(initial));

  return (
    <form
      className={styles.picker}
      onSubmit={(e) => {
        e.preventDefault();
        if (!survey) return;
        saveSurvey(survey.id, answers);
        onDone();
      }}
    >
      <label>
        {T.me.pickSurvey}{' '}
        <select
          value={surveyId}
          onChange={(e) => {
            setSurveyId(e.target.value);
            setAnswers(answersFor(e.target.value));
          }}
        >
          {surveys.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </label>
      {survey?.questions.map((q, i) => (
        <label key={q} className={styles.question}>
          <span>{q}</span>
          <input
            type="text"
            value={answers[i] ?? ''}
            maxLength={WEB_LIMITS.surveyAnswer}
            onChange={(e) =>
              setAnswers((a) => a.map((v, j) => (j === i ? e.target.value : v)))
            }
          />
        </label>
      ))}
      <p className={styles.loginRow}>
        <button type="submit">{T.me.post}</button>
        <button type="button" onClick={onDone}>
          {T.me.cancel}
        </button>
      </p>
    </form>
  );
}

function SurveysBox({ T }: { T: Text }) {
  const locale = useLocale();
  const gender = useGender();
  const saved = usePixlog().surveys;
  const surveys = getSurveys(locale, gender);
  const posted = surveys.filter((s) => s.id in saved);
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <section className={styles.box} aria-label={T.me.surveysHeading}>
      <h2>{T.me.surveysHeading}</h2>
      {posted.length === 0 && editing === null && <p>{T.me.surveysEmpty}</p>}
      {posted.map((survey) => (
        <div key={survey.id} className={styles.entry}>
          <h3>{survey.title}</h3>
          <dl className={styles.survey}>
            {survey.questions.map((q, i) => (
              <div key={q}>
                <dt>{q}</dt>
                <dd>{saved[survey.id]?.[i]}</dd>
              </div>
            ))}
          </dl>
          {editing === null && (
            <button type="button" onClick={() => setEditing(survey.id)}>
              {interpolate(T.me.edit, { title: survey.title })}
            </button>
          )}
        </div>
      ))}
      {editing !== null ? (
        <SurveyForm
          key={editing}
          T={T}
          surveys={surveys}
          initial={editing}
          onDone={() => setEditing(null)}
        />
      ) : (
        surveys[0] && (
          <p>
            <button
              type="button"
              onClick={() =>
                setEditing(
                  (surveys.find((s) => !(s.id in saved)) ?? surveys[0]!).id,
                )
              }
            >
              {T.me.fillIn}
            </button>
          </p>
        )
      )}
    </section>
  );
}

export default function Me() {
  const { PIXLOG_TEXT: T } = useSiteText(PIXLOG_HOST);
  const locale = useLocale();
  const gender = useGender();
  const playerName = usePlayerName();
  const day = useWorldStore((s) => s.day);
  const skin = pixlogSkinFor(
    useWebStore((s) => s.pixlog),
    gender,
  );

  return (
    <Layout skin={skin}>
      <div className={styles.head}>
        <Picture
          {...playerPicture(playerName)}
          label={T.me.pictureLabel}
          size={96}
        />
        <div>
          <h1>{playerName}</h1>
          <p className={styles.meta}>
            {interpolate(T.me.kudosReceived, {
              n: kudosReceived(getPixlogProfiles(locale, gender), day),
            })}
          </p>
        </div>
      </div>
      <div className={styles.columns}>
        <div>
          <AlbumBox T={T} />
          <SurveysBox T={T} />
        </div>
        <div>
          <VisitorsBox />
          <SkinPicker T={T} />
        </div>
      </div>
    </Layout>
  );
}
