// User Accounts: the player's name, gender and picture. Edits a draft; Apply/OK write it to the
// settings store, and everything that shows them (Start menu, Messenger) follows at once.
import { useId, useState } from 'react';
import { usePlayerName, useUserPicture } from '@/i18n/settingsText';
import { useT } from '@/i18n/useT';
import { GenderPicker } from '@/os/login/GenderPicker';
import { MAX_PLAYER_NAME, useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import type { AppComponentProps, Gender } from '@/os/types';
import { USER_PICTURE_IDS, type UserPictureId } from '@/os/user/pictures';
import { userPictureSrc } from '@/os/user/sources';
import styles from './UserAccounts.module.css';

export default function UserAccounts({ windowId }: AppComponentProps) {
  const t = useT();
  const closeWindow = useWindowsStore((s) => s.closeWindow);
  const savedGender = useSettingsStore((s) => s.gender);
  const savedPictureId = useSettingsStore((s) => s.userPicture);
  const setPlayerName = useSettingsStore((s) => s.setPlayerName);
  const setGender = useSettingsStore((s) => s.setGender);
  const setUserPicture = useSettingsStore((s) => s.setUserPicture);
  const savedName = usePlayerName();
  const savedPicture = useUserPicture();
  // `undefined` = untouched: the draft follows the saved value.
  const [nameDraft, setNameDraft] = useState<string>();
  const [genderDraft, setGenderDraft] = useState<Gender>();
  const [pictureDraft, setPictureDraft] = useState<UserPictureId | null>();
  const nameId = useId();

  const name = (nameDraft ?? savedName).trim();
  const gender = genderDraft ?? savedGender;
  const picture = pictureDraft === undefined ? savedPictureId : pictureDraft;

  const dirty =
    (!!name && name !== savedName) ||
    gender !== savedGender ||
    picture !== savedPictureId;

  const apply = () => {
    if (!dirty) return;
    if (name && name !== savedName) setPlayerName(name);
    if (gender && gender !== savedGender) setGender(gender);
    if (picture !== savedPictureId) setUserPicture(picture);
    setNameDraft(undefined);
    setGenderDraft(undefined);
    setPictureDraft(undefined);
  };

  return (
    <div className={styles.root}>
      <div className={styles.panel}>
        <div className={styles.account}>
          <img
            src={userPictureSrc(savedPicture)}
            alt=""
            width={48}
            height={48}
            data-testid="useraccounts-current"
            data-picture={savedPicture ?? 'none'}
          />
          <div>
            <div className={styles.name}>{savedName}</div>
            <div className={styles.kind}>{t('useraccounts.account')}</div>
          </div>
        </div>
        <fieldset className={styles.group}>
          <legend>{t('useraccounts.changeName')}</legend>
          <div className={styles.row}>
            <label htmlFor={nameId}>{t('useraccounts.newName')}</label>
            <input
              id={nameId}
              className={styles.grow}
              value={nameDraft ?? savedName}
              maxLength={MAX_PLAYER_NAME}
              onChange={(e) => setNameDraft(e.target.value)}
            />
          </div>
        </fieldset>
        <fieldset className={styles.group}>
          <legend>{t('useraccounts.gender')}</legend>
          <GenderPicker
            label={t('useraccounts.gender')}
            value={gender}
            onChange={setGenderDraft}
            className={styles.genders}
            optionClassName={styles.genderOption}
          />
        </fieldset>
        <fieldset className={styles.group}>
          <legend>{t('useraccounts.changePicture')}</legend>
          <div className={styles.pictures}>
            {USER_PICTURE_IDS.map((id) => (
              <button
                key={id}
                type="button"
                className={styles.picture}
                aria-pressed={picture === id}
                aria-label={t(`useraccounts.pictures.${id}`)}
                title={t(`useraccounts.pictures.${id}`)}
                onClick={() => setPictureDraft(id)}
              >
                <img src={userPictureSrc(id)} alt="" width={32} height={32} />
              </button>
            ))}
          </div>
          <button
            type="button"
            className={styles.useDefault}
            aria-pressed={picture === null}
            onClick={() => setPictureDraft(null)}
          >
            {t('useraccounts.useDefault')}
          </button>
        </fieldset>
      </div>
      <div className={styles.buttons}>
        <button
          type="button"
          onClick={() => {
            apply();
            closeWindow(windowId);
          }}
        >
          {t('common.ok')}
        </button>
        <button type="button" onClick={() => closeWindow(windowId)}>
          {t('common.cancel')}
        </button>
        <button type="button" disabled={!dirty} onClick={apply}>
          {t('common.apply')}
        </button>
      </div>
    </div>
  );
}
