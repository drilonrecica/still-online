// about.example `/tips`: a page of beginner tips (and a second page for Back/Forward).
import { ABOUT_HOST } from '@/content/sites/about';
import { SiteLink } from '../../SiteLink';
import { useSiteText } from '../useSiteText';
import { Layout } from './Layout';

export default function Tips() {
  const { ABOUT_TEXT: T } = useSiteText(ABOUT_HOST);
  return (
    <Layout>
      <h2>{T.tipsTitle}</h2>
      {T.tips.map((tip) => (
        <p key={tip.label}>
          <b>{tip.label}</b> {tip.text}
        </p>
      ))}
      <p>
        <SiteLink href="/">{T.backLink}</SiteLink>
      </p>
    </Layout>
  );
}
