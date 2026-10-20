// German text for Theo's week two (docs/localization-de.md → "Theo: shy, apologizing, …" and
// "v0.5: week two"). Same ids, same line and choice counts as `src/content/contacts/theo-week2.ts`;
// '' = a line without text. A girl gets his small crush step, a boy a buddy for the back row.
import { g } from '../../gender';
import type { ContactOverlay } from '../../types';

export const theoWeek2Days: ContactOverlay['days'] = {
  6: {
    personalMessage: 'herr dalton hat meine zeichnungen aufgehängt. sorry',
  },
  7: { personalMessage: 'frösche malen. ganz normaler tag' },
  8: { personalMessage: '2 entwürfe. sorry' },
  9: {
    personalMessage: '30 poster. drucker in der bibliothek. 10 cent pro stück',
  },
  10: { personalMessage: 'die poster hängen ÜBERALL. sorry' },
};

export const theoWeek2Scripts: ContactOverlay['scripts'] = {
  day6: {
    wall: {
      lines: [
        'ähm hi {name}',
        'herr dalton hat meine zellzeichnungen aufgehängt',
        'an der kunstwand in raum 12. die wand neben der tür',
        'also sieht die jeder, der reinkommt…',
        'tschuldigung',
      ],
      choices: [
        { text: 'das is ja super!!', label: 'Das is super!' },
        { text: 'jetzt biste berühmt', label: 'Jetzt berühmt' },
        { text: 'sei nich sorry, sei stolz', label: 'Sei stolz' },
      ],
    },
    awesome: {
      lines: [
        'danke',
        'die leute haben sie angeschaut. so richtig stehen geblieben',
        'ein achtklässler hat auf meine mitochondrien gezeigt',
      ],
      choices: [
        { text: 'siehste?? super' },
        { text: 'die mitochondrien haben das verdient' },
      ],
    },
    famous: {
      lines: [
        'oh nein',
        'bitte sag nicht berühmt',
        'die leute haben sie angeschaut und ich wusste nicht, wo ich hingucken soll…',
      ],
      choices: [
        { text: 'guck auf die zeichnungen. wie ein profi' },
        { text: 'so fühlt sich berühmt an' },
      ],
    },
    proud: {
      lines: [
        '…',
        'das hat herr dalton auch gesagt',
        'ich hab’s auf ne karteikarte geschrieben. die is jetzt in meinem federmäppchen',
      ],
      choices: [{ text: 'gut. lass sie da' }, { text: 'lies sie jeden tag' }],
    },
    library: {
      lines: [
        'ähm. ich hab heute in der großen pause in der bibliothek gegessen',
        'nur falls jemand über die zeichnungen reden wollte',
        'wollte keiner. aber die bibliothekarin mochte den frosch auf meinem federmäppchen',
        '',
      ],
      choices: [
        { text: 'nächstes mal isst du mit mir' },
        { text: 'die reden gut über dich', label: 'Nur gutes' },
      ],
      personalMessages: { 3: 'hängt an der wand. (immer noch sorry)' },
    },
    thanks: {
      lines: [
        g('ähm', 'danke, mann'),
        g(
          'du sagst immer genau das richtige. tschuldige',
          'sorry. „mann“ is komisch. danke',
        ),
      ],
    },
  },
  day7: {
    frogs: {
      lines: [
        'hi {name}',
        'ich mal frösche. ganz normaler tag',
        'der hier hat nen hut',
      ],
      choices: [
        {
          text: 'schicker hut. und marco braucht n poster',
          label: 'Schicker Hut. und…',
        },
        {
          text: 'marco braucht n poster für seine show. kannst du das malen?',
          label: 'Marco braucht n Poster',
        },
      ],
    },
    hat: {
      lines: [
        'danke. das is ein zylinder. für frosch-anlässe',
        'moment',
        'ein poster? für marco? den marco mit der band?',
      ],
      choices: [
        { text: 'jep. velvet lantern' },
        { text: 'er hat nach dir gefragt', label: 'Er will dich' },
      ],
    },
    ask: {
      lines: [
        'oh',
        'ein poster. für ne echte show',
        'sorry',
        'sorry. ich mein. was, wenn’s schlecht wird',
        'tschuldigung. das waren 3 sorrys…',
      ],
      choices: [
        { text: 'du kannst auch nein sagen', label: 'Sag ruhig nein' },
        {
          text: g('bitte theo!!', 'alter, du bist der einzige, der malen kann'),
          label: g('Bitte theo!!', 'Nur du kannst malen'),
        },
      ],
    },
    no: {
      lines: ['ich weiß', 'deswegen will ich ja ja sagen', 'glaub ich'],
      choices: [{ text: 'dann sag ja' }, { text: 'lass dir zeit' }],
    },
    please: {
      lines: [
        g(
          'noch nie hat jemand bitte zu meinen zeichnungen gesagt',
          'der einzige?? herr dalton hat ne ganze wand voller zeichnungen',
        ),
        g('ok', 'ok. meine sind die neben der tür. sorry'),
      ],
      choices: [
        { text: 'heißt das ja?' },
        { text: 'er bezahlt bestimmt in limo' },
      ],
    },
    yes: {
      lines: [
        'ja',
        'sag marco ja',
        '',
        'wie sieht n bandposter überhaupt aus…',
        'muss der farbeimer mit drauf?',
      ],
      personalMessages: { 2: 'ich mal ein POSTER??' },
    },
  },
  day8: {
    drafts: {
      lines: [
        'hi. sorry. viel zu tun',
        'ich hab dir 2 entwürfe vom poster gemailt',
        'und marco. im betreff steht sorry',
        'marco hat gesagt „laterne. keine suppe“',
        'also is auf beiden ne laterne',
      ],
      choices: [
        { text: 'was is der unterschied?', label: 'Unterschied?' },
        { text: 'du hast die GEMAILT? so offiziell' },
      ],
    },
    diff: {
      lines: [
        'auf A is ne laterne unter sternen',
        'auf B is dieselbe laterne. aber in der ecke steht ein winziger farbeimer',
        'für derek',
      ],
      choices: [
        { text: 'A. die sterne', label: 'Entwurf A' },
        { text: 'B. der eimer!!', label: 'Entwurf B' },
      ],
    },
    official: {
      lines: [
        'meine mama hat mir gezeigt, wie man was anhängt',
        'hat 40 minuten gedauert. tschuldige',
        'auf A is ne laterne unter sternen. auf B is in der ecke ein winziger farbeimer',
      ],
      choices: [
        { text: 'A. die sterne', label: 'Entwurf A' },
        { text: 'B. der eimer!!', label: 'Entwurf B' },
      ],
    },
    a: {
      lines: [
        'die sterne. ok',
        'ich hab 31 gemalt. ich hab gezählt. sorry',
        '',
      ],
      choices: [
        { text: '31 is die perfekte zahl' },
        { text: 'das wird richtig gut aussehen' },
      ],
      personalMessages: { 2: 'entwurf A. (die laterne bleibt)' },
    },
    b: {
      lines: [
        'der eimer. ok :)',
        'derek freut sich bestimmt. glaub ich. ich kenn derek nicht so richtig',
        '',
      ],
      choices: [
        { text: 'derek LIEBT den eimer' },
        { text: 'das wird richtig gut aussehen' },
      ],
      personalMessages: { 2: 'entwurf B. (die laterne bleibt)' },
    },
    lantern: {
      lines: [
        'ok. ich mach’s heute abend fertig',
        'so oder so is es ne laterne',
        'marco war beim thema suppe sehr deutlich',
      ],
    },
  },
  day9: {
    posters: {
      lines: [
        'ähm hi {name}',
        'das poster is fertig',
        'ich hab 30 gedruckt. drucker in der bibliothek. 10 cent pro stück',
        'meine mama und ich haben sie in der ganzen schule aufgehängt. und im jugendzentrum',
      ],
      choices: [
        {
          text: 'ich hab eins an der turnhalle gesehen!!',
          label: 'Hab eins gesehen!',
        },
        { text: 'du hast 3 euro für marco ausgegeben??', label: '3 euro??' },
      ],
    },
    saw: {
      lines: [
        'oh nein. hing es gerade?',
        'meine mama hat geklebt. sie klebt immer schief',
      ],
      choices: [
        { text: 'es war perfekt' },
        { text: 'n bisschen schief. das is kunst' },
      ],
    },
    money: {
      lines: [
        'is ok. is ja für die show',
        'und die letzten 2 hat mir die bibliothekarin geschenkt. sie mag frösche',
      ],
      choices: [
        { text: 'die frosch-wirtschaft' },
        { text: 'hat sich gelohnt' },
      ],
    },
    ask: {
      lines: [
        'ähm',
        'also. samstag',
        g(
          'vielleicht könnten wir ja hinten stehen. ich mein. zusammen. wenn du willst. sorry',
          'kann ich bei dir stehen? ich kenn da keinen. und marco is n bisschen gruselig',
        ),
      ],
      choices: [
        {
          text: g('das fänd ich schön :)', 'logisch, alter'),
          label: g('Das fänd ich schön :)', 'Logisch'),
        },
        {
          text: g(
            'nur wenn du aufhörst, sorry zu sagen',
            'die crew von der letzten reihe',
          ),
          label: g('Hör auf mit sorry', 'Letzte-Reihe-Crew'),
        },
      ],
    },
    yes: {
      lines: [
        g(':)', 'ok cool'),
        g(
          'ok. hinten. das is ein plan',
          'ok. ganz hinten. da sieht marco uns nicht',
        ),
        '',
      ],
      personalMessages: { 2: 'bis zur show (sorry) (nicht sorry)' },
    },
    deal: {
      lines: [
        g('ok. kein sorry mehr', 'letzte-reihe-crew. ok'),
        g(
          'sorry. moment. das eben zählt nicht',
          'gibt’s die crew echt? sorry. bin dabei',
        ),
        '',
      ],
      personalMessages: { 2: 'bis zur show (sorry) (nicht sorry)' },
    },
  },
  day10: {
    after: {
      lines: [
        'hi {name}',
        'das war so laut',
        '83 leute. marco hat gesagt, da passen 80 rein. ich hab zweimal gezählt',
        'tante rita hat 3 poster mit nach hause genommen. eins is für ihren kühlschrank, sagt sie',
      ],
      choices: [
        {
          text: 'dein poster hing überall!!',
          label: 'Dein Poster war überall',
        },
        { text: 'hattest du spaß?', label: 'Spaß gehabt?' },
      ],
    },
    posters: {
      lines: [
        'ich weiß. sorry',
        'die leute haben sich davor fotografiert',
        'mit blitz. auf einem bin ich aus versehen mit drauf',
      ],
      choices: [
        { text: 'schon wieder berühmt' },
        { text: 'du bist auf nem foto!!' },
      ],
    },
    fun: {
      lines: [
        'ja',
        'es war laut und ich kannte die lieder nicht. aber ja',
        'die mit dem eimer fand ich am besten',
      ],
      choices: [{ text: 'derek wär stolz auf dich' }, { text: 'ich auch' }],
    },
    stood: {
      lines: [
        g(
          'danke, dass du mit mir gestanden hast. da hinten',
          'danke, dass ich bei dir stehen durfte',
        ),
        g(
          'das war schön. sorry. nicht sorry',
          'marco hat mir zugenickt. ich glaub, das is viel für ihn',
        ),
      ],
      choices: [
        { text: g('es war schön :)', 'das is VIEL für marco') },
        { text: g('sorrys sind verboten', 'letzte-reihe-crew 4 life') },
      ],
    },
    gift: {
      lines: [
        'ähm. und',
        'ich hab das poster zu nem hintergrundbild gemacht. pia hat gesagt, sie weiß wie. dein papa hat geholfen. sorry',
        '',
      ],
      choices: [
        { text: 'ich find’s toll', label: 'Find ich toll' },
        {
          text: 'das is schon mein hintergrund',
          label: 'Is schon mein Hintergrund',
        },
      ],
      personalMessages: {
        2: 'laterne auf deinem desktop. gern geschehen (sorry)',
      },
    },
    night: {
      lines: [
        'oh. gut :)',
        'ok ich geh schlafen. mir klingeln noch die ohren. sorry',
      ],
    },
  },
};
