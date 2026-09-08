import { useState, useMemo } from "react";
import { Upload, Sparkles, FileJson, TrendingUp, Copy, Check, AlertTriangle, BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList, ResponsiveContainer } from "recharts";

// A wider, more distinguishable hue set for multi-category charts (pie, CoverType bars) —
// an all-green palette reads fine for two or three slices but gets hard to tell
// apart past that, especially in a pie.
const PALETTE = ['#16a34a', '#0ea5e9', '#d97706', '#dc2626', '#7c3aed', '#0d9488', '#a16207', '#db2777'];
const TWO_TONE = ['#16a34a', '#f59e0b'];
const TOOLTIP_STYLE = { borderRadius: 10, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12, padding: '8px 12px' };
const AXIS_TICK = { fontSize: 11, fill: '#4b5563' };

const FOREST_NAMES = {
  4240:"אופקים",4201:"אורים",4371:"אילת",4105:"איתן",4106:"אמציה",4110:"ארז",3101:"אשדוד",4255:"אשל הנשיא",4301:"אשלים",3110:"באר טוביה",4335:"באר שבע",4273:"בארי",4233:"בית קמה",4203:"גבולות",4115:"גברעם",3205:"גוברין",4204:"גילת",4102:"דבירה",4129:"דודאים",4183:"דורות",4302:"דימונה",4321:"המכתש הגדול",4361:"המכתש הקטן",4185:"חולות אשקלון",4206:"חולות חלוצה",4327:"חולות עגור",4350:"חירן",4103:"חלץ",4139:"חסה",4369:"חצבה",4334:"חצרון",4212:"חצרים",4216:"חשיף",4121:"יד מרדכי",4370:"יטבתה",4322:"ירוחם",4306:"יתיר",4304:"יתיר צפון",4124:"כוכב",4213:"כיסופים",4315:"כסייפה",4123:"כרמון",4174:"כרמים",4128:"להב",4120:"לכיש",4119:"מאחז",4228:"מגן",4194:"מורן",4363:"מישור פארן",4307:"מיתר",4217:"מעון",4113:"מערב הר חברון",3202:"מראשה",4309:"משאבי שדה",4332:"משוש",4220:"משמר הנגב",4323:"נבטים",4209:"נחל אסף",4221:"נחל הבשור",4232:"נחל חנון",4211:"נחל עשן",4333:"ניצנה",4235:"נתיבות",4215:"סיירת שקד",4329:"עבדת",4338:"עומר",4314:"ערד",4324:"ערוער",4298:"פארק באר שבע",4143:"פלוגות",4205:"פתחת שלום",4272:"צוחר",4118:"קדמה",4114:"קוממיות",4116:"קרית גת",4316:"רביבים",4266:"רהט",4117:"רוחמה",4308:"רמון",4319:"רמת בקע",4325:"רמת חובב",4328:"רמת מטרד",4210:"רנן",4330:"שבטה",4150:"שדרות",4202:"שובל",4231:"שובלים",4208:"שוקדה",4154:"שחריה",4234:"תלמי בילו",4109:"תלמים",4365:"תמנע",
  3403:"אום אל פחם",3103:"איילון",3147:"אילנות",3412:"אלונה",3401:"אליקים",3302:"אשתאול",3102:"בילו",3213:"ביתר",3105:"בן שמן",3189:"בנימין",3203:"בר גיורא",3106:"ברקת",3408:"גבעת עוז",3115:"גדרות",3133:"גזר",3402:"גלעד",3411:"דליה",3410:"הזורע",3311:"החמישה",3129:"הכח",3221:"הלה",3445:"הנדיב",3330:"הצופים",3303:"הקדושים",3301:"הראל",3111:"השרון",3409:"חדרה",3134:"חולדה",3119:"חורשים",3405:"חורשן",3414:"חן",3415:"חפר",3254:"חרובית",3350:"ירושלים",3232:"ישעי",3312:"כפירה",3416:"מגידו",3406:"מגל",3116:"מודיעין",3229:"מטע",3404:"מי עמי",3413:"מנשה",3417:"מצר",3224:"משואה",3421:"משמר העמק",3310:"נווה אילן",3218:"נחושה",3113:"נחשון",3108:"נען",3139:"נתניה",3320:"סטף",3201:"עדולם",3429:"עין השופט",3418:"עירון",3321:"עמינדב",3208:"עציון",3142:"פארק איילון",3109:"פולג",3407:"פרדס חנה",3146:"צור נתן",3216:"צלפון",3209:"צפית",3233:"צרעה",3194:"קסם",3135:"רובין",3489:"שומרון דרום",3207:"שורק",
  1324:"אביב",1204:"אודם",1262:"אורטל",1303:"אחיהוד",1304:"אילון",1259:"אלוני הבשן",1107:"אלונים",1307:"אלקוש",1208:"אמנון",1203:"ביריה",1116:"בית אורן",1318:"בית העמק",1441:"בית השיטה",1219:"בית ציידה",1482:"בית קשת",1412:"בית שאן",1104:"בלפור",1280:"בני יהודה",1404:"בקעת ארבל",1407:"בקעת יבניאל",1293:"בראון",1236:"ברעם",1449:"גבעת המורה",1205:"גדות גונן",1305:"גורן",1326:"גילון",1476:"גלבוע",1432:"גני חוגה",1215:"דלתון",1237:"החולה",1115:"היערנים",1365:"המפרץ",1355:"הר אחים",1210:"הר מירון",1322:"הר עצמון",1483:"הר תבור",1239:"הרי נפתלי",1110:"חוף הכרמל",1207:"חזון",1105:"חיפה",1306:"חניתה",1279:"חרוב",1291:"חרמונית",1417:"טבריה",1402:"טורען",1349:"יובלים",1311:"יחיעם",1313:"כברי",1272:"כמון",1102:"כפר החורש",1463:"כפר קיש",1223:"כרמיאל",1405:"לביא",1281:"לוטם",1268:"מבוא חמה",1202:"מורדות גולן",1481:"מורדות נצרת",1413:"מחולה",1229:"מחנה ירדן",1201:"מטולה",1211:"מירון",1255:"מלכיה",1406:"מנחמיה",1468:"מסד",1423:"מעוז חיים",1247:"מעלה גמלא",1333:"מעלות",1265:"מרום גולן",1250:"נבי יושע",1301:"נהריה",1117:"נחל חיק",1213:"נחל לימונים",1227:"נחל מיצר",1113:"נחל תות",1308:"נטועה",1111:"ניר עציון",1282:"נמרוד",1214:"סאסא",1435:"עין גב",1450:"עין דור",1414:"עין הנציב",1302:"עכו",1217:"עמיעד",1403:"עמק הירדן",1101:"עמק יזרעאל",1270:"פארק הירדן",1410:"פוריה",1232:"פלגי מים",1254:"פקיעין",1309:"צונם",1103:"ציפורי",1266:"ציר המפלים",1209:"קדרים",1228:"קידמת צבי",1225:"קלע",1278:"קצרין",1364:"קריית אתא",1114:"קרן כרמל",1264:"קשת",1319:"ראש הנקרה",1112:"רכס החוף",1411:"רכס יבנאל",1221:"רכס כורזים",1408:"רכס ליבנים",1267:"רמות",1418:"רמות יששכר",1295:"רמת מגשימים",1218:"רמת רזים",1320:"שגב",1235:"שדה אליעזר",1321:"שומרה",1206:"שיפון",1323:"שכניה",1263:"שעל",1220:"שפר",1363:"שפרעם",1401:"תענך",1341:"תפן"
};

const templates = [
  {
    id: 'veg',
    name: 'תצורת צומח והרכב מינים',
    rules: 'נתח את שדות CoverType, ForestVegForm ו-stringCoverType וצור תובנה לפי הפורמט הבא.\nצור את המשפט הבא המורכב מהצלבת נתונים מהשדות הרלוונטים:\n"תצורת הצומח העיקרית ביער היא {תצורה עיקרית}, המהווה {שטח יחסי} משטח היער. מיני העצים הדומיננטיים הם {מין דומיננטי} ({שטח יחסי}), {מין דומיננטי} ({שטח יחסי}) ו{מין דומיננטי} ({שטח יחסי})."\n\nכללי מילוי:\n- {תצורה עיקרית} = תצורת ForestVegForm עם השטח הגדול ביותר. אם קיימות גם חורש וגם רחבי עלים - אחד ל"רחבי עלים/חורש". תצורות שיחייה, בתה ועשבוני - אגד ל"קומת קרקע".\n- {שטח יחסי} הראשון = אחוז התצורה העיקרית מסך שטח היער, בשפה יחסית.\n- {מין דומיננטי} = מינים לפי CoverType מסודרים לפי גודל שטח. אם הרכב מעורב - פרט מינים מ-stringCoverType. אם הרכב המינים הוא מתת היער - שיחייה/עשבוני אל תציין אותם.\n- {שטח יחסי} של כל מין = אחוז השטח שתופס המין מסך היער, בשפה יחסית.\n\nכללי שפה:\n- שטח יחסי בשפה טבעית: "רוב" >70%, "כמחצית" 40-70%, "שליש" 25-40%, "כרבע" 10-25%\n- לקבוצות קטנות (<25%) - השתמש ב"אחוזים בודדים" ולא במספרים מדויקים\n- כתוב רצף משפטים זורם, ללא כותרות או נקודות'
  },
  {
    id: 'compare',
    name: 'השוואת תצורות צומח - כלל היער מול שכבה ראשית',
    rules: 'נתח את שדות ForestVegForm, primary_VegForm ו-Dunam וצור תובנה השוואתית.\n\nחשב התפלגות אחוזית (לפי Dunam) בנפרד עבור:\n1. ForestVegForm - תצורת הצומח של כלל היער\n2. primary_VegForm - תצורת הצומח של השכבה הראשית בלבד\n\nפורמט התובנה:\nתאר תחילה את ההתפלגות של כלל היער, ואז הצג כיצד משתנה ההתפלגות בשכבה הראשית - תוך דגש על תצורות שעלו או ירדו באופן משמעותי.\n\nכללי שפה:\n- השתמש בשפה יחסית לערכים גדולים (כמחצית, שליש) ובאחוזים מדויקים לערכים קטנים (<25%)\n- דגש על שינויים - מה עולה ומה יורד בין שתי ההתפלגויות\n- תאר אך ורק את השינויים המספריים בין שתי ההתפלגויות. אסור בהחלט לכתוב כל ביטוי פרשני או מסיק, כולל: "המעידה כי", "המלמדת כי", "מה שמצביע", "מה שמעיד", "מה שמלמד", "כלומר", "כך ש", "ולכן", "דבר המצביע", "דבר המעיד". המשפטים חייבים להכיל אך ורק מספרים ותיאור השינוי.\n- אין לאחד קטגוריות שאינן שייכות יחד (מחטני ורחבי עלים נשארים נפרדים תמיד)\n- רצף משפטים זורם, ללא כותרות'
  },
  {
    id: 'layer',
    name: 'התפלגות קומות גובה',
    rules: 'נתח את שדות primary_ForestLayer ו-Dunam.\nחשב התפלגות primary_ForestLayer לפי שטח באחוזים יחסיים.\nכתוב משפט מסכם בפורמט:\n"מרבית השטח היערני מצוי בקומת הגובה ה{קומה} (כ-X% משטח היער), ולאחריה קומת הגובה ה{קומה} (כ-X%) וקומת הגובה ה{קומה} (כ-X%)."\nכללים:\n- עגל אחוזים למספרים עגולים\n- סדר לפי גודל שטח'
  },
  {
    id: 'density',
    name: 'צפיפות ומבנה יער',
    rules: 'נתח את שדות GeneralDensity, ForestAgeComposition, totalCanopyCover.\nצור תובנה על התפלגות הצפיפות ומבנה השכבות באחוזים.\n\nכללים:\n- התייחס רק לערכים שאינם "לא רלוונטי"\n- עגל אחוזים\n- הדגש את המאפיינים הדומיננטיים\n- אל תוסיף מסקנה או פרשנות מעבר לנתונים (ללא "מה שמצביע על", "מה שמעיד על", "המעיד על" וכו)\n- תאר רק את הנתונים עצמם בצורה עובדתית'
  },
  {
    id: 'health',
    name: 'מצב בריאות היער',
    rules: 'בריאות היער - ניתוח מלא\n\nשדות:\n1. VitalForest_desc - סוג ההתנוונות\n2. DegenerationIndex - אחוז כיסוי ההתנוונות\n3. TreeHarmIndex - עצים פגועים (ערכים: זניח/מועט/בינוני/גבוה/גבוה מאוד)\n4. DeadTreesPercent - עצים מתים\n5. InvasiveSpecies / InvasiveSpeciesName / Invasive_desc - מינים פולשים\n\nפורמט התובנה הנדרש:\n"ב-{X}% מהיער נצפו התנוונויות בעיקר ב{VitalForest_desc} ובכיסוי {DegenerationIndex}. ב-{X}% מהיער נצפו עצים פגועים בעיקר בכיסוי {TreeHarmIndex}. האזורים בהם נצפו התנוונויות ובהם נצפו עצים פגועים הם חופפים {לרוב/חלקית}. ב-{N} עומדים דווח על הימצאות של מינים פולשים, הנפוצים בהם- {מין1} ו{מין2}."\n\nכללים:\n- אם degPct קרוב לשליש (25-40%) - "בשליש מהיער"\n- topDegSeverity = הערך הדומיננטי של VitalForest_desc לפי שטח\n- topHarmSeverity = הערך הדומיננטי של TreeHarmIndex לפי שטח\n- המילה הנכונה היא תמיד "בכיסוי" – אסור להשתמש ב"בעוצמה", "ברמה", "במדד" או כל מילה אחרת\n- overlapDesc - "לרוב" / "חלקית". אם null - השמט לחלוטין את משפט החפיפה\n- אם harmPct הוא 0 - כתוב "לא נצפו עצים פגועים ביער" והשמט את המשפט השני\n- שפה יחסית לאחוזים: מעל 70% = "רוב", 40-70% = "כמחצית", 25-40% = "כשליש", 60-70% = "כשני שלישים", 10-25% = "כרבע". אל תשתמש במספרים מדויקים עבור ערכים אלו\n- invasiveFociCount - מספר העומדים שדווח בהם על פולשים\n- אם אין מינים פולשים - השמט את המשפט האחרון\n- אסור בהחלט להוסיף מסקנה או פרשנות'
  }
];

export default function ForestInsightsAgent() {
  const [view, setView] = useState('report'); // 'report' (default/main) or 'advanced' (free-text side tab)
  const [jsonData, setJsonData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [forestName, setForestName] = useState('');
  const [fullAnalysis, setFullAnalysis] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [insight, setInsight] = useState('');
  const [insightNote, setInsightNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedIdx, setCopiedIdx] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setError('');
    setForestName('');
    setFullAnalysis(null);
    setInsight('');
    setInsightNote(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        setJsonData(data);
        const features = data.features || [];
        let name = '';
        for (let i = 0; i < features.length; i++) {
          const val = features[i]?.attributes?.FOR_NAM;
          if (val !== null && val !== undefined && val !== '') { name = val; break; }
        }
        if (!name) {
          for (let i = 0; i < features.length; i++) {
            const no = features[i]?.attributes?.FOR_NO;
            if (no !== null && no !== undefined && no !== '') {
              name = FOREST_NAMES[parseInt(no)] || '';
              break;
            }
          }
        }
        setForestName(name);
        const allFieldsTrigger = 'covertype הרכב מינים תצורת צומח primary_vegform שכבה ראשית השוואה primary_forestlayer קומת גובה density צפיפות מבנה health בריאות התנוונות פולשים';
        setFullAnalysis(analyzeLocally(features, allFieldsTrigger));
      } catch {
        setError('שגיאה בקריאת הקובץ. אנא ודא שזה קובץ JSON תקין.');
        setJsonData(null);
      }
    };
    reader.readAsText(file);
  };

  // Exact match, not substring: the previous substring check on 'אחר' was also
  // matching inside legitimate category names like 'מעורב אחר' ("mixed - other",
  // a real ~4-9% category) and silently dropping them from every distribution.
  const isVague = (term) => ['שונות', 'אחרים', 'לא מוגדר', 'לא רלוונטי', 'אחר'].includes((term || '').trim());
  // ForestVegForm values carry a "יער " ("forest ") prefix (e.g. "יער מעורב"),
  // while primary_VegForm values for the same category don't (e.g. "מעורב").
  // Comparisons between the two fields must match on the normalized name or
  // every category except the ones that happen to be identical (like "חורש")
  // silently fails to join and shows as zero.
  const normalizeVegForm = (s) => (s || '').replace(/^יער\s+/, '').trim();

  // ---------------------------------------------------------------------
  // Deterministic computation layer: every number, sort order and field
  // selection happens here in plain JS. Nothing here is left for the LLM
  // to "guess" — this is what previously caused field mix-ups.
  // ---------------------------------------------------------------------
  const analyzeLocally = (features, userPrompt) => {
    const lowerPrompt = userPrompt.toLowerCase();
    const res = {};
    const totalArea = features.reduce((s, f) => s + (f.attributes?.Dunam || 0), 0);

    if (lowerPrompt.includes('covertype') || lowerPrompt.includes('הרכב מינים') || lowerPrompt.includes('תצורת צומח')) {
      const vegDist = {}, coverDist = {}, speciesByCover = {};
      let horeshArea = 0, rachaviArea = 0;
      // Shrubland, low-forest variants, herbaceous, and batha — everything that
      // used to get grouped into "קומת קרקע" — are not "forest vegetation form /
      // species composition" in the forestry sense. Excluded entirely here,
      // including from the % denominator, not just relabeled into a bucket.
      //
      // Two things matter here:
      // 1. Spelling varies between fields for the same word — ForestVegForm
      //    writes "שיחיה" (one י) while CoverType writes "שיחייה" (two י) for
      //    the exact same stands. A plain .includes('שיחייה') misses the
      //    one-י spelling entirely, so this uses a regex that accepts either.
      // 2. The two fields don't always agree on a stand: some stands have a
      //    normal ForestVegForm (e.g. "יער רחבי-עלים") but CoverType is still
      //    "שיחייה". Checking only ForestVegForm lets those leak into the
      //    species list, so both fields are checked and either one is enough
      //    to exclude the stand.
      const groundLayerPattern = /שיחיי?ה|עשבוני|נמוך|בתה/;
      const isGroundLayer = (v) => !!v && groundLayerPattern.test(v);
      let vegTotalArea = 0;
      let excludedArea = 0;
      // "NAME - WEIGHT" pairs, e.g. "אשחר רחב-עלים - 4, אלון מצוי - 6" (weights sum to 10 per stand).
      // Greedy (.*) correctly keeps hyphenated species names intact and only
      // peels off the trailing " - <number>" weight.
      const weightPattern = /^(.*)\s-\s(\d+(?:\.\d+)?)$/;
      features.forEach(f => {
        let vf = f.attributes?.ForestVegForm || 'לא מוגדר';
        const ctRaw = f.attributes?.CoverType || 'לא מוגדר';
        if (isGroundLayer(vf) || isGroundLayer(ctRaw)) { excludedArea += f.attributes?.Dunam || 0; return; }
        const dunam = f.attributes?.Dunam || 0;
        vegTotalArea += dunam;
        // Track "חורש" and "רחבי" separately for now — they only get merged
        // into one label below, and only if both actually occur in this forest.
        if (vf.includes('חורש')) { horeshArea += dunam; }
        else if (vf.includes('רחבי')) { rachaviArea += dunam; }
        else {
          if (vf.includes('מחטני')) vf = 'יער מחטני';
          vegDist[vf] = (vegDist[vf] || 0) + dunam;
        }

        const ct = f.attributes?.CoverType || 'לא מוגדר';
        const area = f.attributes?.Dunam || 0;
        coverDist[ct] = (coverDist[ct] || 0) + area;

        const st = f.attributes?.stringCoverType || '';
        if (st) {
          const bucket = speciesByCover[ct] || (speciesByCover[ct] = {});
          st.split(',').forEach(part => {
            const m = weightPattern.exec(part.trim());
            if (!m) return;
            const name = m[1].trim();
            const weight = parseFloat(m[2]);
            if (!name || isNaN(weight)) return;
            bucket[name] = (bucket[name] || 0) + area * (weight / 10);
          });
        }
      });
      // Only combine the label when both sources are actually present in this forest.
      if (horeshArea > 0 && rachaviArea > 0) vegDist['יער רחבי עלים / חורש'] = horeshArea + rachaviArea;
      else if (horeshArea > 0) vegDist['חורש'] = horeshArea;
      else if (rachaviArea > 0) vegDist['יער רחבי עלים'] = rachaviArea;
      // % here is of vegTotalArea (post-exclusion), not the forest's full area —
      // שיחייה/יער נמוך/עשבוני are removed from the denominator, not just hidden.
      res.vegFormDistribution = Object.entries(vegDist).filter(([f]) => !isVague(f)).map(([form, area]) => ({ form, area, percentage: vegTotalArea > 0 ? Math.round((area / vegTotalArea) * 100) : 0 })).sort((a, b) => b.area - a.area);
      // Primary metric: raw CoverType grouped by area — this is what matches the reference/ground-truth output.
      res.coverTypeDistribution = Object.entries(coverDist).filter(([c]) => !isVague(c)).map(([covertype, area]) => ({ covertype, area, percentage: vegTotalArea > 0 ? Math.round((area / vegTotalArea) * 100) : 0 })).sort((a, b) => b.area - a.area).slice(0, 6);
      // Secondary, informational only: the species that make up each CoverType category, correctly weighted.
      res.speciesDetail = {};
      res.coverTypeDistribution.forEach(entry => {
        const bucket = speciesByCover[entry.covertype];
        if (!bucket) return;
        const names = Object.entries(bucket).sort((a, b) => b[1] - a[1]).map(([n]) => n);
        if (names.length > 1 || (names.length === 1 && names[0] !== entry.covertype)) {
          res.speciesDetail[entry.covertype] = names.slice(0, 2);
        }
      });
      res.groundLayerExcludedArea = excludedArea;
    }

    if (lowerPrompt.includes('primary_vegform') || lowerPrompt.includes('שכבה ראשית') || lowerPrompt.includes('השוואה')) {
      const fvd = {}, pvd = {};
      features.forEach(f => {
        const fv = f.attributes?.ForestVegForm || 'לא מוגדר';
        const pv = f.attributes?.primary_VegForm || 'לא מוגדר';
        const a = f.attributes?.Dunam || 0;
        fvd[fv] = (fvd[fv] || 0) + a;
        pvd[pv] = (pvd[pv] || 0) + a;
      });
      res.ForestVegForm = Object.entries(fvd).filter(([v]) => !isVague(v)).map(([vegForm, area]) => ({ vegForm, area, percentage: Math.round((area / totalArea) * 100) })).sort((a, b) => b.area - a.area);
      res.primary_VegForm = Object.entries(pvd).filter(([v]) => !isVague(v)).map(([vegForm, area]) => ({ vegForm, area, percentage: Math.round((area / totalArea) * 100) })).sort((a, b) => b.area - a.area);
    }

    if (lowerPrompt.includes('primary_forestlayer') || lowerPrompt.includes('קומת גובה')) {
      const dist = {};
      features.forEach(f => { const l = f.attributes?.primary_ForestLayer || 'לא מוגדר'; dist[l] = (dist[l] || 0) + (f.attributes?.Dunam || 0); });
      res.primary_ForestLayer = Object.entries(dist).filter(([l]) => !isVague(l)).map(([layer, area]) => ({ layer, area, percentage: Math.round((area / totalArea) * 100) })).sort((a, b) => b.area - a.area);
    }

    if (lowerPrompt.includes('density') || lowerPrompt.includes('צפיפות') || lowerPrompt.includes('מבנה')) {
      const dd = {}, cd = {};
      features.forEach(f => {
        const d = f.attributes?.GeneralDensity, c = f.attributes?.ForestAgeComposition, a = f.attributes?.Dunam || 0;
        if (d && d !== 'לא רלוונטי') dd[d] = (dd[d] || 0) + a;
        if (c) cd[c] = (cd[c] || 0) + a;
      });
      res.densityDistribution = Object.entries(dd).map(([density, area]) => ({ density, area, percentage: Math.round((area / totalArea) * 100) })).sort((a, b) => b.area - a.area);
      res.compositionDistribution = Object.entries(cd).map(([composition, area]) => ({ composition, area, percentage: Math.round((area / totalArea) * 100) })).sort((a, b) => b.area - a.area);
    }

    if (lowerPrompt.includes('health') || lowerPrompt.includes('בריאות') || lowerPrompt.includes('התנוונות') || lowerPrompt.includes('פולשים')) {
      const degStands = features.filter(f => { const di = f.attributes?.DegenerationIndex; const desc = f.attributes?.VitalForest_desc || ''; return (di && di > 0) || (desc && desc !== 'ללא' && desc !== '' && desc !== 'לא רלוונטי'); });
      const degArea = degStands.reduce((s, f) => s + (f.attributes?.Dunam || 0), 0);
      const degPct = totalArea > 0 ? Math.round((degArea / totalArea) * 100) : 0;

      // FIX: VitalForest_desc (the *type* of degeneration) and DegenerationIndex
      // (the *coverage* of it) are two different questions. The previous version
      // merged them into a single "topDegSeverity" value, which is the root cause
      // of the field mix-ups you were seeing. They're now tracked separately.
      //
      // VitalForest_desc values sometimes already carry a coverage-band suffix
      // baked in, e.g. "גזעים דקים ביחס לגובה - בינוני (33%-10%)" — the same
      // "בינוני (33%-10%)" band that DegenerationIndex reports separately. Left
      // in place, that (a) duplicates the coverage clause in the sentence, and
      // (b) splits votes for the same underlying type across near-duplicate
      // strings whenever the coverage differs slightly between stands.
      const stripCoverageSuffix = (s) => (s || '').replace(/\s-\s.+\(\d+%\s*-\s*\d+%\)\s*$/, '').trim();
      const degTypeDist = {};
      const degCoverageDist = {};
      degStands.forEach(f => {
        const desc = stripCoverageSuffix(f.attributes?.VitalForest_desc);
        const di = f.attributes?.DegenerationIndex;
        const a = f.attributes?.Dunam || 0;
        if (desc && desc !== '' && desc !== 'לא רלוונטי') degTypeDist[desc] = (degTypeDist[desc] || 0) + a;
        let covLabel = null;
        if (di !== null && di !== undefined && di !== '' && di !== 'לא רלוונטי') {
          covLabel = typeof di === 'number' ? (di <= 1 ? 'זניח' : di <= 2 ? 'בינוני' : di <= 3 ? 'גבוה' : 'גבוה מאוד') : di;
        }
        if (covLabel) degCoverageDist[covLabel] = (degCoverageDist[covLabel] || 0) + a;
      });
      const topDegType = Object.entries(degTypeDist).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
      const topDegCoverage = Object.entries(degCoverageDist).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

      const harmStands = features.filter(f => { const hi = f.attributes?.TreeHarmIndex; return hi && hi !== 'אין' && hi !== ''; });
      const harmArea = harmStands.reduce((s, f) => s + (f.attributes?.Dunam || 0), 0);
      const harmPct = totalArea > 0 ? Math.round((harmArea / totalArea) * 100) : 0;
      const harmSev = {};
      harmStands.forEach(f => { const hi = f.attributes?.TreeHarmIndex; const a = f.attributes?.Dunam || 0; if (hi) harmSev[hi] = (harmSev[hi] || 0) + a; });
      const topHarmSeverity = Object.entries(harmSev).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

      const degIds = new Set(degStands.map(f => f.attributes?.OBJECTID ?? JSON.stringify(f.attributes)));
      const harmIds = new Set(harmStands.map(f => f.attributes?.OBJECTID ?? JSON.stringify(f.attributes)));
      const overlapArea = features.filter(f => { const id = f.attributes?.OBJECTID ?? JSON.stringify(f.attributes); return degIds.has(id) && harmIds.has(id); }).reduce((s, f) => s + (f.attributes?.Dunam || 0), 0);
      const overlapPct = degArea > 0 ? Math.round((overlapArea / degArea) * 100) : 0;
      const overlapDesc = overlapPct >= 70 ? 'לרוב' : overlapPct >= 40 ? 'חלקית' : null;

      const invasiveFields = ['InvasiveSpecies','InvasiveSpeciesName','Invasive_desc','InvasiveSpecies_desc','invasive'];
      const invasiveCounts = {};
      let invasiveFociCount = 0;
      features.forEach(f => {
        let val = null;
        for (const field of invasiveFields) { const v = f.attributes?.[field]; if (v && v !== '' && v !== 'ללא' && v !== 'לא רלוונטי') { val = v; break; } }
        if (val) { invasiveFociCount++; String(val).split(/[,;/]/).map(s => s.trim()).filter(Boolean).forEach(sp => { invasiveCounts[sp] = (invasiveCounts[sp] || 0) + 1; }); }
      });
      const topInvasive = Object.entries(invasiveCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name, count]) => ({ name, count }));

      res.healthMetrics = { degArea: Math.round(degArea), degPct, topDegType, topDegCoverage, harmArea: Math.round(harmArea), harmPct, topHarmSeverity, overlapArea: Math.round(overlapArea), overlapPct, overlapDesc, invasiveFociCount, topInvasive };
    }

    if (lowerPrompt.includes('ezorname') || lowerPrompt.includes('אזור')) {
      const dist = {};
      features.forEach(f => { const ez = f.attributes?.EzorName || 'לא מוגדר'; dist[ez] = (dist[ez] || 0) + (f.attributes?.Dunam || 0); });
      res.EzorName = Object.entries(dist).map(([ezor, area]) => ({ ezor, area, percentage: Math.round((area / totalArea) * 100) })).sort((a, b) => b.area - a.area).slice(0, 5);
    }

    res.totalArea = totalArea;
    res.featureCount = features.length;
    return res;
  };

  // ---------------------------------------------------------------------
  // Language layer: relative-language rules encoded exactly once, as pure
  // functions, so the wording is identical for every forest run through
  // the same template — no LLM phrasing variance between runs.
  // ---------------------------------------------------------------------
  // Relative language only for values that are genuinely dominant — everything
  // else gets the exact number, matching what human-written reports actually do.
  const relPct = (pct) => pct > 70 ? 'רוב' : pct >= 55 ? 'למעלה ממחצית' : pct >= 40 ? 'כמחצית' : `${pct}%`;

  // Fold the forest name into the standard phrases when we have one, instead
  // of always saying "the forest" generically.
  const inYaar = (name) => name ? `ביער ${name}` : 'ביער';
  const miYaar = (name) => name ? `מיער ${name}` : 'מהיער';
  const beKlalYaar = (name) => name ? `בכלל יער ${name}` : 'בכלל היער';

  // "Dominant" = the top entry is at least `ratio`x the runner-up. A ratio
  // (not an absolute %) so it fires for 61%/19% and for smaller spreads like
  // 50%/24% alike, without hard-coding a percentage threshold.
  const isDominant = (entries, ratio = 2) =>
    entries.length > 1 && entries[0].percentage >= entries[1].percentage * ratio;

  // ---------------------------------------------------------------------
  // Sentence-assembly layer, one function per template. Each function only
  // fills the fixed skeleton from the template's own "rules" text with the
  // already-computed values above — the LLM is not involved for these five
  // templates at all, so there's nothing left to confuse.
  // ---------------------------------------------------------------------
  const buildVegInsight = (analysis, name) => {
    const veg = analysis.vegFormDistribution || [];
    const cover = analysis.coverTypeDistribution || [];
    const detail = analysis.speciesDetail || {};
    if (!veg.length) return 'לא נמצאו נתוני תצורת צומח מספקים בקובץ.';
    const main = veg[0];
    const headline = `תצורת הצומח העיקרית ${inYaar(name)} היא ${main.form}, המהווה ${relPct(main.percentage)} משטח היער.`;
    if (!cover.length) return headline;
    if (isDominant(cover)) {
      const top = cover[0];
      const names = detail[top.covertype];
      const note = names && names.length ? `; בעיקר ${names.length === 2 ? `${names[0]} ו${names[1]}` : names[0]}` : '';
      return `${headline} מין העצים הדומיננטי הוא ${top.covertype} (${relPct(top.percentage)}${note}).`;
    }
    const top = cover.slice(0, 3).map(c => {
      const names = detail[c.covertype];
      const note = names && names.length ? `; בעיקר ${names.length === 2 ? `${names[0]} ו${names[1]}` : names[0]}` : '';
      return `${c.covertype} (${relPct(c.percentage)}${note})`;
    });
    const tail = top.length === 3 ? `${top[0]}, ${top[1]} ו${top[2]}` : top.length === 2 ? `${top[0]} ו${top[1]}` : top[0] || '';
    return `${headline}` + (tail ? ` מיני העצים הדומיננטיים הם ${tail}.` : '');
  };

  // Shown separately from the insight text itself (styled as a caveat, not
  // folded into the sentence) whenever ground-layer forms were excluded.
  const GROUND_LAYER_NOTE = 'החישוב אינו כולל תצורות מקומת הקרקע (שיחייה, בתה, עשבוני, יער נמוך).';

  const buildCompareInsight = (analysis, name) => {
    const full = analysis.ForestVegForm || [];
    const primary = analysis.primary_VegForm || [];
    if (!full.length || !primary.length) return 'לא נמצאו נתונים מספקים להשוואה בין כלל היער לשכבה הראשית.';
    const primaryMap = {};
    primary.forEach(p => { primaryMap[normalizeVegForm(p.vegForm)] = p.percentage; });
    const overview = full.slice(0, 3).map(f => `${f.vegForm} מהווה ${relPct(f.percentage)}`).join(', ');
    const changes = full
      .filter(f => primaryMap[normalizeVegForm(f.vegForm)] !== undefined)
      .map(f => ({ name: f.vegForm, fullPct: f.percentage, primaryPct: primaryMap[normalizeVegForm(f.vegForm)], delta: primaryMap[normalizeVegForm(f.vegForm)] - f.percentage }))
      .filter(c => Math.abs(c.delta) >= 5)
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
      .slice(0, 3);
    const base = `${beKlalYaar(name)}, ${overview} משטח היער.`;
    if (!changes.length) return `${base} בשכבה הראשית לא נמצאו שינויים משמעותיים ביחס לכלל היער.`;
    const changeText = changes.map(c => `${c.name} ${c.delta > 0 ? 'עולה' : 'יורד'} מ-${c.fullPct}% ל-${c.primaryPct}%`).join('; ');
    return `${base} בשכבה הראשית, ${changeText}.`;
  };

  const buildLayerInsight = (analysis, name) => {
    const layers = analysis.primary_ForestLayer || [];
    if (!layers.length) return 'לא נמצאו נתוני קומות גובה בקובץ.';
    const [l1, l2, l3] = layers;
    if (isDominant(layers)) {
      return `רוב השטח היערני ${inYaar(name)} מצוי בקומת הגובה ${l1.layer} (כ-${l1.percentage}% משטח היער).`;
    }
    let s = `${name ? `${inYaar(name)}, מ` : 'מ'}רבית השטח היערני מצוי בקומת הגובה ${l1.layer} (כ-${l1.percentage}% משטח היער)`;
    if (l2) s += `, ולאחריה קומת הגובה ${l2.layer} (כ-${l2.percentage}%)`;
    if (l3) s += ` וקומת הגובה ${l3.layer} (כ-${l3.percentage}%)`;
    return s + '.';
  };

  const buildDensityInsight = (analysis, name) => {
    const density = analysis.densityDistribution || [];
    const comp = analysis.compositionDistribution || [];
    if (!density.length && !comp.length) return 'לא נמצאו נתוני צפיפות ומבנה מספקים בקובץ.';
    const parts = [];
    if (density.length) parts.push(`הצפיפות הדומיננטית ${inYaar(name)} היא ${density[0].density} (${density[0].percentage}% משטח היער)`);
    if (comp.length) parts.push(`מבנה שכבות היער הנפוץ ביותר הוא ${comp[0].composition} (${comp[0].percentage}%)`);
    return parts.join('. ') + '.';
  };

  const buildHealthInsight = (analysis, name) => {
    const h = analysis.healthMetrics;
    if (!h) return 'לא נמצאו נתוני בריאות יער מספקים בקובץ.';
    const sentences = [];
    if (h.degPct > 0) {
      const typePart = h.topDegType ? `בעיקר ב${h.topDegType} ` : '';
      const covPart = h.topDegCoverage ? `ובכיסוי ${h.topDegCoverage}` : '';
      sentences.push((`ב${relPct(h.degPct)} ${miYaar(name)} נצפו התנוונויות ${typePart}${covPart}`).trim() + '.');
    } else {
      sentences.push(`לא נצפו סימני התנוונות ${inYaar(name)}.`);
    }
    if (h.harmPct > 0) {
      sentences.push(`ב${relPct(h.harmPct)} ${miYaar(name)} נצפו עצים פגועים בעיקר בכיסוי ${h.topHarmSeverity}.`);
      if (h.overlapDesc) sentences.push(`האזורים בהם נצפו התנוונויות ובהם נצפו עצים פגועים הם חופפים ${h.overlapDesc}.`);
    } else {
      sentences.push(`לא נצפו עצים פגועים ${inYaar(name)}.`);
    }
    if (h.invasiveFociCount > 0 && h.topInvasive?.length) {
      const names = h.topInvasive.slice(0, 2).map(i => i.name);
      const namesText = names.length === 2 ? `${names[0]} ו${names[1]}` : names[0];
      sentences.push(`ב-${h.invasiveFociCount} עומדים דווח על הימצאות של מינים פולשים, הנפוצים בהם - ${namesText}.`);
    }
    return sentences.join(' ');
  };

  const BUILDERS = { veg: buildVegInsight, compare: buildCompareInsight, layer: buildLayerInsight, density: buildDensityInsight, health: buildHealthInsight };

  const buildPrompt = (analysis, userPrompt) => [
    '# Role',
    'אתה סוכן ניתוח מומחה המתמחה ב-GIS, נתוני יערות וניתוח סביבתי.',
    'המשימה שלך היא ליצור תובנה טקסטואלית מקצועית אחת המתארת את היער.',
    '',
    '# Input Data',
    `ביצעתי ניתוח על ${analysis.featureCount} עומדים בשטח כולל של ${Math.round(analysis.totalArea).toLocaleString()} דונם.`,
    'חשוב: כל ה-features יחד מייצגים יער אחד.',
    '',
    'בקשת המשתמש:',
    `"${userPrompt}"`,
    '',
    'תוצאות הניתוח:',
    JSON.stringify(analysis, null, 2),
    '',
    '# Quality Control:',
    '1. אין שמות מינים מעורפלים',
    '2. טרמינולוגיה עקבית ומקצועית',
    '3. עברית מקצועית לאנשי יערנות',
    '4. אחוזים מעוגלים',
    '5. תובנה זורמת - 2-3 משפטים מקסימום',
    '6. אסור בהחלט להוסיף מסקנה או פרשנות (ללא "מה שמצביע על", "מה שמעיד על", "המעיד על", "התפלגות זו מעידה" וכו\')',
    '7. אין לאחד קטגוריות שאינן שייכות יחד (מחטני ורחבי עלים נשארים נפרדים תמיד; חורש ורחבי עלים מאוחדים רק כשהם מופיעים יחד כתצורה אחת בנתונים)',
    '',
    '# כללי דקדוק עברי:',
    '1. זכר/נקבה: יער=זכר, שכבה=נקבה, תצורה=נקבה, אזור=זכר',
    '2. יחיד/רבים: מינים, עצים, עומדים (רבים)',
    '3. התאמת שם תואר: שטח גדול / שכבה גדולה',
    '4. שימוש בסמיכות: מיני העצים',
    '',
    'החזר רק את התובנה הסופית, ללא הסברים או נתונים גולמיים.'
  ].join('\n');

  const callAPI = async (promptText) => {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, messages: [{ role: 'user', content: promptText }] })
    });
    if (!res.ok) throw new Error('שגיאת שרת: ' + res.status);
    const data = await res.json();
    return data.content?.[0]?.text || '';
  };

  const analyzeData = async () => {
    if (!jsonData || !prompt) { setError('אנא העלה קובץ JSON וכתוב פרומפט'); return; }
    setLoading(true); setError('');
    try {
      const features = jsonData.features || [];
      const analysis = analyzeLocally(features, prompt);
      // If the prompt is exactly one of the five known templates, skip the LLM
      // entirely and assemble the sentence deterministically. Free-text
      // questions (or an edited template) still go through Claude.
      const matched = templates.find(t => t.rules === prompt);
      const text = (matched && BUILDERS[matched.id])
        ? BUILDERS[matched.id](analysis, forestName)
        : await callAPI(buildPrompt(analysis, prompt));
      setInsight(text);
      setInsightNote((matched?.id === 'veg' && analysis.groundLayerExcludedArea > 0) ? GROUND_LAYER_NOTE : null);
    } catch (err) { setError('שגיאה בניתוח: ' + err.message); }
    finally { setLoading(false); }
  };

  // The 5 known templates never touch the network anymore (see BUILDERS above),
  // so the report is just a derived value — computed the moment a file is loaded.
  const reportResults = useMemo(() => {
    if (!jsonData) return [];
    const features = jsonData.features || [];
    return templates.map(t => {
      try {
        const analysis = analyzeLocally(features, t.rules);
        const text = BUILDERS[t.id] ? BUILDERS[t.id](analysis, forestName) : '';
        const note = (t.id === 'veg' && analysis.groundLayerExcludedArea > 0) ? GROUND_LAYER_NOTE : null;
        return { id: t.id, name: t.name, text, note, error: null };
      } catch (err) {
        return { id: t.id, name: t.name, text: null, note: null, error: err.message };
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jsonData, forestName]);

  const copyText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // Same derived numbers the old full-grid charts section used, now computed
  // once and handed out per template so each insight row can show the chart
  // that actually backs its own text, right next to it.
  const chartData = useMemo(() => {
    if (!fullAnalysis) return null;
    const veg = fullAnalysis.vegFormDistribution || [];
    const cover = fullAnalysis.coverTypeDistribution || [];
    const speciesDetail = fullAnalysis.speciesDetail || {};
    const layers = fullAnalysis.primary_ForestLayer || [];
    const density = fullAnalysis.densityDistribution || [];
    const composition = fullAnalysis.compositionDistribution || [];
    const h = fullAnalysis.healthMetrics;

    const primaryMap = {};
    (fullAnalysis.primary_VegForm || []).forEach(p => { primaryMap[normalizeVegForm(p.vegForm)] = p.percentage; });
    const compareData = (fullAnalysis.ForestVegForm || []).slice(0, 6).map(f => ({
      name: f.vegForm, 'כלל היער': f.percentage, 'שכבה ראשית': primaryMap[normalizeVegForm(f.vegForm)] ?? 0
    }));

    const healthData = h ? [
      { name: 'התנוונות', value: h.degPct },
      { name: 'עצים פגועים', value: h.harmPct }
    ] : [];

    return { veg, cover, speciesDetail, layers, density, composition, h, healthData, compareData };
  }, [fullAnalysis]);

  const NoChartData = () => <p className="text-sm text-gray-400 flex items-center justify-center h-full py-8">אין נתונים גרפיים זמינים</p>;

  // One small chart renderer per template id — this is the "left column" of each insight row.
  const CHART_RENDERERS = {
    veg: (d) => (!d.veg.length && !d.cover.length) ? <NoChartData /> : (
      <div className="space-y-4">
        {d.veg.length > 0 && (
          <ResponsiveContainer width="100%" height={210}>
            <PieChart margin={{ top: 4, bottom: 4 }}>
              <Pie data={d.veg} dataKey="percentage" nameKey="form" cx="50%" cy="42%" outerRadius={58}
                stroke="#fff" strokeWidth={2}
                label={({ percentage }) => `${percentage}%`} labelLine={{ strokeWidth: 1 }}>
                {d.veg.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} contentStyle={TOOLTIP_STYLE} />
              <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
        {d.cover.length > 0 && (
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={d.cover} layout="vertical" margin={{ left: 10, right: 24 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
              <XAxis type="number" unit="%" tick={AXIS_TICK} axisLine={{ stroke: '#d1d5db' }} />
              <YAxis type="category" dataKey="covertype" width={100} tick={{ fontSize: 10.5, fill: '#374151' }} axisLine={{ stroke: '#d1d5db' }} />
              <Tooltip formatter={(v) => `${v}%`} contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="percentage" radius={[0, 6, 6, 0]}>
                {d.cover.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                <LabelList dataKey="percentage" position="right" formatter={(v) => `${v}%`} style={{ fontSize: 11, fontWeight: 600, fill: '#374151' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
        {Object.keys(d.speciesDetail).length > 0 && (
          <p className="text-xs text-gray-500 leading-relaxed">
            פירוט מינים (מידע משני):{' '}
            {Object.entries(d.speciesDetail).map(([cat, names], i) => (
              <span key={cat}>{i > 0 ? ' · ' : ''}{cat} ({names.join(', ')})</span>
            ))}
          </p>
        )}
      </div>
    ),
    compare: (d) => d.compareData.length === 0 ? <NoChartData /> : (
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={d.compareData} margin={{ bottom: 30, top: 16 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#374151' }} angle={-20} textAnchor="end" interval={0} axisLine={{ stroke: '#d1d5db' }} />
          <YAxis unit="%" tick={AXIS_TICK} axisLine={{ stroke: '#d1d5db' }} />
          <Tooltip formatter={(v) => `${v}%`} contentStyle={TOOLTIP_STYLE} />
          <Legend />
          <Bar dataKey="כלל היער" fill={TWO_TONE[0]} radius={[4, 4, 0, 0]}>
            <LabelList dataKey="כלל היער" position="top" formatter={(v) => `${v}%`} style={{ fontSize: 10, fontWeight: 600, fill: TWO_TONE[0] }} />
          </Bar>
          <Bar dataKey="שכבה ראשית" fill={TWO_TONE[1]} radius={[4, 4, 0, 0]}>
            <LabelList dataKey="שכבה ראשית" position="top" formatter={(v) => `${v}%`} style={{ fontSize: 10, fontWeight: 600, fill: TWO_TONE[1] }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    ),
    layer: (d) => d.layers.length === 0 ? <NoChartData /> : (
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={d.layers} margin={{ top: 16 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="layer" tick={{ fontSize: 11, fill: '#374151' }} axisLine={{ stroke: '#d1d5db' }} />
          <YAxis unit="%" tick={AXIS_TICK} axisLine={{ stroke: '#d1d5db' }} />
          <Tooltip formatter={(v) => `${v}%`} contentStyle={TOOLTIP_STYLE} />
          <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
            {d.layers.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
            <LabelList dataKey="percentage" position="top" formatter={(v) => `${v}%`} style={{ fontSize: 11, fontWeight: 600, fill: '#374151' }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    ),
    density: (d) => (!d.density.length && !d.composition.length) ? <NoChartData /> : (
      <div className="space-y-4">
        {d.density.length > 0 && (
          <>
            <p className="text-xs font-semibold text-gray-500">צפיפות</p>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={d.density} margin={{ top: 14 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="density" tick={{ fontSize: 10.5, fill: '#374151' }} axisLine={{ stroke: '#d1d5db' }} />
                <YAxis unit="%" tick={AXIS_TICK} axisLine={{ stroke: '#d1d5db' }} />
                <Tooltip formatter={(v) => `${v}%`} contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="percentage" fill="#0ea5e9" radius={[6, 6, 0, 0]}>
                  <LabelList dataKey="percentage" position="top" formatter={(v) => `${v}%`} style={{ fontSize: 10, fontWeight: 600, fill: '#0369a1' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
        {d.composition.length > 0 && (
          <>
            <p className="text-xs font-semibold text-gray-500">מבנה שכבות היער</p>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={d.composition} margin={{ top: 14 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="composition" tick={{ fontSize: 10.5, fill: '#374151' }} axisLine={{ stroke: '#d1d5db' }} />
                <YAxis unit="%" tick={AXIS_TICK} axisLine={{ stroke: '#d1d5db' }} />
                <Tooltip formatter={(v) => `${v}%`} contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="percentage" fill="#7c3aed" radius={[6, 6, 0, 0]}>
                  <LabelList dataKey="percentage" position="top" formatter={(v) => `${v}%`} style={{ fontSize: 10, fontWeight: 600, fill: '#6d28d9' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    ),
    health: (d) => !d.h ? <NoChartData /> : (
      <div>
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={d.healthData} margin={{ top: 16 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#374151' }} axisLine={{ stroke: '#d1d5db' }} />
            <YAxis unit="%" tick={AXIS_TICK} axisLine={{ stroke: '#d1d5db' }} />
            <Tooltip formatter={(v) => `${v}%`} contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              <Cell fill="#d97706" />
              <Cell fill="#dc2626" />
              <LabelList dataKey="value" position="top" formatter={(v) => `${v}%`} style={{ fontSize: 11, fontWeight: 600, fill: '#374151' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {d.h.invasiveFociCount > 0 && (
          <p className="text-xs text-gray-500 mt-2">מינים פולשים דווחו ב-{d.h.invasiveFociCount} עומדים</p>
        )}
      </div>
    ),
  };

  const FileInfoCard = () => jsonData && (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className={`mb-4 border rounded-lg px-4 py-3 flex items-center gap-2 ${forestName ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
        <span className="text-lg">{forestName ? '🌲' : '❓'}</span>
        <span className={`font-bold text-lg ${forestName ? 'text-green-900' : 'text-gray-400'}`}>{forestName || 'שם יער לא נמצא'}</span>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-50 p-3 rounded"><p className="text-gray-600">מספר עומדים</p><p className="text-2xl font-bold text-green-600">{jsonData.features?.length || 0}</p></div>
        <div className="bg-gray-50 p-3 rounded"><p className="text-gray-600">סך שטח (דונם)</p><p className="text-2xl font-bold text-green-600">{(jsonData.features?.reduce((s, f) => s + (f.attributes?.Dunam || 0), 0) || 0).toLocaleString('he-IL', { maximumFractionDigits: 0 })}</p></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-800">סוכן תובנות יערניות</h1>
          </div>
          <div className="flex items-center gap-3 mb-1">
            <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">v2.0</span>
            <span className="text-xs text-gray-400">עודכן לאחרונה: 08.09.2026</span>
          </div>
          <p className="text-gray-600">העלה קובץ JSON, שאל שאלה, וקבל תובנה מנוסחת</p>
        </div>

        {/* File Upload */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Upload className="w-5 h-5" />שלב 1: העלאת קובץ</h2>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-green-300 border-dashed rounded-lg cursor-pointer bg-green-50 hover:bg-green-100 transition">
            <FileJson className="w-10 h-10 mb-2 text-green-500" />
            <p className="text-sm text-gray-700"><span className="font-semibold">לחץ להעלאת קובץ JSON</span></p>
            {fileName && <p className="text-xs text-green-600 font-medium mt-1">✓ {fileName}</p>}
            <input type="file" className="hidden" accept=".json" onChange={handleFileUpload} />
          </label>
        </div>

        {error && !jsonData && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700">
            <p className="font-medium">⚠️ {error}</p>
          </div>
        )}

        {jsonData && (
          <>
            <FileInfoCard />

            {/* Merged step 2+3: insights with their charts, main view */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-semibold flex items-center gap-2"><BarChart3 className="w-5 h-5" />שלב 2: תובנות מרכזיות</h2>
                <button onClick={() => setView(view === 'report' ? 'advanced' : 'report')}
                  className="text-xs font-semibold text-green-700 hover:text-green-900 border border-green-200 rounded-full px-3 py-1 transition">
                  {view === 'report' ? 'שאלה חופשית (מתקדם)' : '← חזרה לתובנות'}
                </button>
              </div>

              {view === 'report' && (
                <>
                  <p className="text-gray-500 text-sm mb-4">כל תובנה מוצגת לצד הגרף שמבסס אותה, לבחינה חזותית מהירה</p>
                  <div className="space-y-4">
                    {reportResults.map((r, i) => (
                      <div key={i} className={`rounded-xl border-2 overflow-hidden ${r.error ? 'border-red-200' : 'border-green-200'}`}>
                        <div className={`px-4 py-2 flex items-center justify-between ${r.error ? 'bg-red-50' : 'bg-green-50'}`}>
                          <span className="font-semibold text-sm text-gray-700">{r.name}</span>
                          {r.text && (
                            <button onClick={() => copyText(r.text, i)}
                              className="flex items-center gap-1 text-xs text-green-700 hover:text-green-900 transition">
                              {copiedIdx === i ? <><Check className="w-3.5 h-3.5" />הועתק</> : <><Copy className="w-3.5 h-3.5" />העתק</>}
                            </button>
                          )}
                        </div>
                        {r.error ? (
                          <div className="p-4 flex items-center gap-2 text-red-600 text-sm"><AlertTriangle className="w-4 h-4" />{r.error}</div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                            <div>
                              <p className="text-gray-800 leading-relaxed">{r.text}</p>
                              {r.note && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 mt-2 inline-block">⚠ {r.note}</p>}
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              {chartData && CHART_RENDERERS[r.id] ? CHART_RENDERERS[r.id](chartData) : <NoChartData />}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {view === 'advanced' && (
                <div className="pt-2">
                  <p className="text-gray-500 text-sm mb-4">מצב צדדי לשאלה חופשית שלא נענית באחת מהתבניות הקבועות</p>
                  <textarea
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition text-right resize-none"
                    rows="4" placeholder="כתוב שאלה או בחר תבנית מוכנה מטה..."
                    value={prompt} onChange={e => setPrompt(e.target.value)}
                  />
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">תבניות מוכנות:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {templates.map((t, i) => (
                        <button key={i} onClick={() => setPrompt(t.rules)}
                          className="text-right bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-2 border-green-200 p-3 rounded-lg transition">
                          <div className="font-semibold text-green-800">{t.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={analyzeData} disabled={loading || !prompt}
                    className="mt-4 w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2">
                    {loading ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>מנתח...</> : <><Sparkles className="w-5 h-5" />צור תובנה</>}
                  </button>
                  {insight && (
                    <div className="mt-6 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl p-6 text-white">
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-5 h-5" />תובנה</h3>
                      <div className="bg-white/10 rounded-lg p-4"><p className="text-lg leading-relaxed">{insight}</p></div>
                      {insightNote && <p className="text-xs text-amber-100 bg-black/15 rounded-md px-3 py-2 mt-3">⚠ {insightNote}</p>}
                    </div>
                  )}
                  {error && <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700"><p className="font-medium">⚠️ {error}</p></div>}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
