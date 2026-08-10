import { useState } from "react";
import { Upload, Sparkles, FileJson, TrendingUp, Copy, Check, AlertTriangle } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState('single');
  const [jsonData, setJsonData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [forestName, setForestName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportResults, setReportResults] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setError('');
    setForestName('');
    setReportResults([]);
    setInsight('');
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
      } catch {
        setError('שגיאה בקריאת הקובץ. אנא ודא שזה קובץ JSON תקין.');
        setJsonData(null);
      }
    };
    reader.readAsText(file);
  };

  const isVague = (term) => ['שונות','אחרים','לא מוגדר','לא רלוונטי','אחר'].some(v => term?.includes(v));

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
      const vegDist = {}, specDist = {};
      features.forEach(f => {
        let vf = f.attributes?.ForestVegForm || 'לא מוגדר';
        if (vf.includes('חורש') || vf.includes('רחבי')) vf = 'יער רחבי עלים';
        else if (vf.includes('שיחייה') || vf.includes('בתה') || vf.includes('עשבוני')) vf = 'קומת קרקע';
        else if (vf.includes('מחטני')) vf = 'יער מחטני';
        vegDist[vf] = (vegDist[vf] || 0) + (f.attributes?.Dunam || 0);
        const ct = f.attributes?.CoverType || 'לא מוגדר';
        const st = f.attributes?.stringCoverType || '';
        const area = f.attributes?.Dunam || 0;
        if (ct.includes('מעורב') && st) {
          st.split(',').map(s => s.trim().split('-')[0].trim()).forEach(sp => { if (sp) specDist[sp] = (specDist[sp] || 0) + area / st.split(',').length; });
        } else { specDist[ct] = (specDist[ct] || 0) + area; }
      });
      res.vegFormDistribution = Object.entries(vegDist).filter(([f]) => !isVague(f)).map(([form, area]) => ({ form, area, percentage: Math.round((area / totalArea) * 100) })).sort((a, b) => b.area - a.area);
      res.speciesDistribution = Object.entries(specDist).filter(([s]) => !isVague(s)).map(([species, area]) => ({ species, area, percentage: Math.round((area / totalArea) * 100) })).sort((a, b) => b.area - a.area).slice(0, 5);
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
      const degTypeDist = {};
      const degCoverageDist = {};
      degStands.forEach(f => {
        const desc = f.attributes?.VitalForest_desc;
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
  const relGeneral = (pct) => pct > 70 ? 'רוב' : pct >= 40 ? 'כמחצית' : pct >= 25 ? 'כשליש' : pct >= 10 ? 'כרבע' : 'אחוזים בודדים';
  const relSpecies = (pct) => pct > 70 ? 'רוב' : pct >= 40 ? 'כמחצית' : pct >= 25 ? 'כשליש' : 'אחוזים בודדים';
  const relOrExact = (pct) => pct > 70 ? 'רוב' : pct >= 40 ? 'כמחצית' : pct >= 25 ? 'כשליש' : `${pct}%`;
  const relHealth = (pct) => pct > 70 ? 'רוב' : pct >= 60 ? 'כשני שלישים' : pct >= 40 ? 'כמחצית' : pct >= 25 ? 'כשליש' : pct >= 10 ? 'כרבע' : 'אחוזים בודדים';

  // ---------------------------------------------------------------------
  // Sentence-assembly layer, one function per template. Each function only
  // fills the fixed skeleton from the template's own "rules" text with the
  // already-computed values above — the LLM is not involved for these five
  // templates at all, so there's nothing left to confuse.
  // ---------------------------------------------------------------------
  const buildVegInsight = (analysis) => {
    const veg = analysis.vegFormDistribution || [];
    const species = analysis.speciesDistribution || [];
    if (!veg.length) return 'לא נמצאו נתוני תצורת צומח מספקים בקובץ.';
    const main = veg[0];
    const top = species.slice(0, 3).map(s => `${s.species} (${relSpecies(s.percentage)})`);
    const tail = top.length === 3 ? `${top[0]}, ${top[1]} ו${top[2]}` : top.length === 2 ? `${top[0]} ו${top[1]}` : top[0] || '';
    return `תצורת הצומח העיקרית ביער היא ${main.form}, המהווה ${relGeneral(main.percentage)} משטח היער.` + (tail ? ` מיני העצים הדומיננטיים הם ${tail}.` : '');
  };

  const buildCompareInsight = (analysis) => {
    const full = analysis.ForestVegForm || [];
    const primary = analysis.primary_VegForm || [];
    if (!full.length || !primary.length) return 'לא נמצאו נתונים מספקים להשוואה בין כלל היער לשכבה הראשית.';
    const primaryMap = {};
    primary.forEach(p => { primaryMap[p.vegForm] = p.percentage; });
    const overview = full.slice(0, 3).map(f => `${f.vegForm} מהווה ${relOrExact(f.percentage)}`).join(', ');
    const changes = full
      .filter(f => primaryMap[f.vegForm] !== undefined)
      .map(f => ({ name: f.vegForm, fullPct: f.percentage, primaryPct: primaryMap[f.vegForm], delta: primaryMap[f.vegForm] - f.percentage }))
      .filter(c => Math.abs(c.delta) >= 5)
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
      .slice(0, 3);
    const base = `בכלל היער, ${overview} משטח היער.`;
    if (!changes.length) return `${base} בשכבה הראשית לא נמצאו שינויים משמעותיים ביחס לכלל היער.`;
    const changeText = changes.map(c => `${c.name} ${c.delta > 0 ? 'עולה' : 'יורד'} מ-${c.fullPct}% ל-${c.primaryPct}%`).join('; ');
    return `${base} בשכבה הראשית, ${changeText}.`;
  };

  const buildLayerInsight = (analysis) => {
    const layers = analysis.primary_ForestLayer || [];
    if (!layers.length) return 'לא נמצאו נתוני קומות גובה בקובץ.';
    const [l1, l2, l3] = layers;
    let s = `מרבית השטח היערני מצוי בקומת הגובה ${l1.layer} (כ-${l1.percentage}% משטח היער)`;
    if (l2) s += `, ולאחריה קומת הגובה ${l2.layer} (כ-${l2.percentage}%)`;
    if (l3) s += ` וקומת הגובה ${l3.layer} (כ-${l3.percentage}%)`;
    return s + '.';
  };

  const buildDensityInsight = (analysis) => {
    const density = analysis.densityDistribution || [];
    const comp = analysis.compositionDistribution || [];
    if (!density.length && !comp.length) return 'לא נמצאו נתוני צפיפות ומבנה מספקים בקובץ.';
    const parts = [];
    if (density.length) parts.push(`הצפיפות הדומיננטית ביער היא ${density[0].density} (${density[0].percentage}% משטח היער)`);
    if (comp.length) parts.push(`מבנה הגילאים הנפוץ ביותר הוא ${comp[0].composition} (${comp[0].percentage}%)`);
    return parts.join('. ') + '.';
  };

  const buildHealthInsight = (analysis) => {
    const h = analysis.healthMetrics;
    if (!h) return 'לא נמצאו נתוני בריאות יער מספקים בקובץ.';
    const sentences = [];
    if (h.degPct > 0) {
      const typePart = h.topDegType ? `בעיקר ב${h.topDegType} ` : '';
      const covPart = h.topDegCoverage ? `ובכיסוי ${h.topDegCoverage}` : '';
      sentences.push((`ב${relHealth(h.degPct)} מהיער נצפו התנוונויות ${typePart}${covPart}`).trim() + '.');
    } else {
      sentences.push('לא נצפו סימני התנוונות ביער.');
    }
    if (h.harmPct > 0) {
      sentences.push(`ב${relHealth(h.harmPct)} מהיער נצפו עצים פגועים בעיקר בכיסוי ${h.topHarmSeverity}.`);
      if (h.overlapDesc) sentences.push(`האזורים בהם נצפו התנוונויות ובהם נצפו עצים פגועים הם חופפים ${h.overlapDesc}.`);
    } else {
      sentences.push('לא נצפו עצים פגועים ביער.');
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
        ? BUILDERS[matched.id](analysis)
        : await callAPI(buildPrompt(analysis, prompt));
      setInsight(text);
    } catch (err) { setError('שגיאה בניתוח: ' + err.message); }
    finally { setLoading(false); }
  };

  const generateReport = async () => {
    if (!jsonData) return;
    setReportLoading(true);
    setReportResults([]);
    const features = jsonData.features || [];
    const results = [];
    for (const t of templates) {
      try {
        const analysis = analyzeLocally(features, t.rules);
        const text = BUILDERS[t.id] ? BUILDERS[t.id](analysis) : await callAPI(buildPrompt(analysis, t.rules));
        results.push({ name: t.name, text, error: null });
      } catch (err) {
        results.push({ name: t.name, text: null, error: err.message });
      }
      setReportResults([...results]);
    }
    setReportLoading(false);
  };

  const copyText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
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
            <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">v1.2</span>
            <span className="text-xs text-gray-400">עודכן לאחרונה: 10.08.2026</span>
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

        {jsonData && (
          <>
            <FileInfoCard />

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
              <div className="flex border-b border-gray-200">
                <button onClick={() => setActiveTab('single')}
                  className={`flex-1 py-3 text-sm font-semibold transition ${activeTab === 'single' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                  תובנה בודדת
                </button>
                <button onClick={() => setActiveTab('report')}
                  className={`flex-1 py-3 text-sm font-semibold transition ${activeTab === 'report' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                  טיוטה לדוח מסכם <span className="text-xs bg-yellow-200 text-yellow-800 font-bold px-1.5 py-0.5 rounded ml-1">BETA</span>
                </button>
              </div>

              {/* Single Insight Tab */}
              {activeTab === 'single' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5" />שלב 2: מה תרצה לדעת?</h2>
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
                    </div>
                  )}
                  {error && <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700"><p className="font-medium">⚠️ {error}</p></div>}
                </div>
              )}

              {/* Report Tab */}
              {activeTab === 'report' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2 flex items-center gap-2"><TrendingUp className="w-5 h-5" />טיוטה לדוח מסכם</h2>
                  <p className="text-gray-500 text-sm mb-4">מריץ את כל 5 התבניות ברצף ומציג את התוצאות</p>
                  <button onClick={generateReport} disabled={reportLoading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2 mb-6">
                    {reportLoading ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>מעבד תבניות ({reportResults.length}/{templates.length})...</> : <><Sparkles className="w-5 h-5" />צור דוח מסכם</>}
                  </button>

                  {reportResults.length > 0 && (
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
                          <div className="p-4">
                            {r.error
                              ? <div className="flex items-center gap-2 text-red-600 text-sm"><AlertTriangle className="w-4 h-4" />{r.error}</div>
                              : <p className="text-gray-800 leading-relaxed">{r.text}</p>
                            }
                          </div>
                        </div>
                      ))}

                      {/* Loading placeholders */}
                      {reportLoading && reportResults.length < templates.length && (
                        Array.from({ length: templates.length - reportResults.length }).map((_, i) => (
                          <div key={`loading-${i}`} className="rounded-xl border-2 border-gray-200 overflow-hidden animate-pulse">
                            <div className="px-4 py-2 bg-gray-50"><div className="h-4 bg-gray-200 rounded w-1/3"></div></div>
                            <div className="p-4"><div className="h-3 bg-gray-100 rounded w-full mb-2"></div><div className="h-3 bg-gray-100 rounded w-2/3"></div></div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
