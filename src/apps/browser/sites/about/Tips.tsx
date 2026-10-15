// about.example `/tips`: a page of beginner tips (and a second page for Back/Forward).
import { SiteLink } from '../../SiteLink';
import { Layout } from './Layout';

export default function Tips() {
  return (
    <Layout>
      <h2>Surfing Tips</h2>
      <p>
        <b>Favorites:</b> found a page you love? Open the Favorites menu and
        click Add to Favorites so you can find it again.
      </p>
      <p>
        <b>Refresh:</b> if a page looks stuck, click Refresh to load it again.
        Stop gives up on a page that takes too long.
      </p>
      <p>
        <b>Stay safe:</b> never tell strangers your real name, address or
        school. Ask a grown-up before you sign up for anything.
      </p>
      <p>
        <SiteLink href="/">&laquo; Back to the welcome page</SiteLink>
      </p>
    </Layout>
  );
}
