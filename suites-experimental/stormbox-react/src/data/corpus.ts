// Vocabulary for the generated mailbox. All people, companies and domains
// are fictional; domains use reserved example TLDs so nothing resolves.

export const FIRST_NAMES = [
  'Aisha', 'Ben', 'Carmen', 'Daniel', 'Elena', 'Farid', 'Grace', 'Hiro', 'Ines', 'Jonas',
  'Kavya', 'Liam', 'Maya', 'Noah', 'Olga', 'Pablo', 'Quinn', 'Rosa', 'Samir', 'Tara',
  'Umar', 'Vera', 'Wei', 'Ximena', 'Yusuf', 'Zoe', 'Amara', 'Bruno', 'Chloe', 'Dmitri',
  'Esther', 'Felix', 'Gabriela', 'Hassan', 'Isla', 'Jakub', 'Keiko', 'Lucas', 'Mei', 'Nadia',
  'Oscar', 'Priya', 'Rafael', 'Sofia', 'Tomas', 'Uma', 'Viktor', 'Wanjiru', 'Yara', 'Zain',
  'Anders', 'Beatriz', 'Cyrus', 'Delia', 'Emeka', 'Freya', 'Gustavo', 'Helga', 'Ivan', 'Julia',
  'Kofi', 'Leila', 'Marco', 'Nina', 'Omar', 'Paula', 'Ravi', 'Selin', 'Theo', 'Valentina',
];

export const LAST_NAMES = [
  'Abara', 'Bergström', 'Castillo', 'Dubois', 'Eriksen', 'Fischer', 'García', 'Haddad', 'Ito', 'Jansen',
  'Kowalski', 'Lindqvist', 'Moreau', 'Nakamura', 'Okafor', 'Petrov', 'Quintero', 'Rossi', 'Schmidt', 'Tanaka',
  'Usman', 'Varga', 'Wójcik', 'Xu', 'Yilmaz', 'Zhang', 'Andersson', 'Bianchi', 'Chen', 'Da Silva',
  'Eze', 'Fontaine', 'Gupta', 'Horvath', 'Ivanova', 'Jensen', 'Kim', 'Laurent', 'Müller', 'Novak',
  "O'Brien", 'Patel', 'Reyes', 'Sato', 'Torres', 'Uddin', 'Volkov', 'Weber', 'Yamamoto', 'Zielinski',
  'Achebe', 'Brennan', 'Costa', 'Delgado', 'Engel', 'Ferreira', 'Grünewald', 'Huang', 'Iyer', 'Kaur',
];

export const COMPANIES = [
  { name: 'Northwind', domain: 'northwind.example' },
  { name: 'Contoso', domain: 'contoso.example' },
  { name: 'Fabrikam', domain: 'fabrikam.example' },
  { name: 'Tailspin Labs', domain: 'tailspin.example' },
  { name: 'Wingtip', domain: 'wingtip.example' },
  { name: 'Lakeshore Health', domain: 'lakeshore.example' },
  { name: 'Adatum', domain: 'adatum.example' },
  { name: 'Litware', domain: 'litware.example' },
  { name: 'Proseware', domain: 'proseware.example' },
  { name: 'Coho Vineyard', domain: 'cohovineyard.example' },
  { name: 'Blue Yonder Air', domain: 'blueyonder.example' },
  { name: 'Trey Research', domain: 'treyresearch.example' },
  { name: 'Woodgrove Bank', domain: 'woodgrove.example' },
  { name: 'Alpine Ski House', domain: 'alpineskihouse.example' },
  { name: 'Graphic Design Institute', domain: 'gdi.example' },
  { name: 'Humongous Insurance', domain: 'humongous.example' },
  { name: 'Margie Travel', domain: 'margietravel.example' },
  { name: 'Relecloud', domain: 'relecloud.example' },
  { name: 'Southridge Video', domain: 'southridge.example' },
  { name: 'Wide World Importers', domain: 'wideworld.example' },
];

export const FREEMAIL = ['mail.example', 'post.example', 'inbox.example', 'fastpost.example'];

export const NEWSLETTERS = [
  { name: 'Web Platform Weekly', email: 'digest@webplatform.example', color: '#1f6feb' },
  { name: 'The Render Loop', email: 'hello@renderloop.example', color: '#d1495b' },
  { name: 'Systems Digest', email: 'news@systemsdigest.example', color: '#2a9d8f' },
  { name: 'Contoso Cloud', email: 'updates@contoso.example', color: '#5a4fcf' },
  { name: 'Blue Yonder Air', email: 'offers@blueyonder.example', color: '#0077b6' },
  { name: 'Margie Travel', email: 'deals@margietravel.example', color: '#f4a261' },
  { name: 'Wide World Importers', email: 'shop@wideworld.example', color: '#e76f51' },
  { name: 'Coho Vineyard', email: 'club@cohovineyard.example', color: '#7b2d26' },
  { name: 'Open Source Monthly', email: 'editors@osmonthly.example', color: '#264653' },
  { name: 'Alpine Ski House', email: 'news@alpineskihouse.example', color: '#118ab2' },
  { name: 'Graphic Design Institute', email: 'courses@gdi.example', color: '#ef476f' },
  { name: 'Relecloud Status', email: 'status@relecloud.example', color: '#3d405b' },
];

export const NOTIFIERS = [
  { name: 'Forge', email: 'notifications@forge.example' },
  { name: 'Bugtrack', email: 'bugmail@bugtrack.example' },
  { name: 'CI Bot', email: 'ci@builds.example' },
  { name: 'Calendar', email: 'calendar-noreply@calendar.example' },
  { name: 'Woodgrove Bank', email: 'alerts@woodgrove.example' },
  { name: 'Shipping Updates', email: 'track@parcels.example' },
];

export const WORDS = [
  'the', 'a', 'we', 'our', 'team', 'should', 'could', 'will', 'can', 'need', 'to', 'review', 'update',
  'plan', 'release', 'branch', 'schedule', 'meeting', 'notes', 'draft', 'proposal', 'budget', 'design',
  'feedback', 'deadline', 'next', 'week', 'today', 'tomorrow', 'quarter', 'roadmap', 'migration', 'cache',
  'layout', 'performance', 'regression', 'benchmark', 'profile', 'latency', 'memory', 'renderer', 'thread',
  'worker', 'queue', 'sync', 'server', 'client', 'account', 'folder', 'message', 'invoice', 'contract',
  'launch', 'customer', 'support', 'ticket', 'issue', 'patch', 'test', 'suite', 'flaky', 'green', 'merge',
  'conflict', 'document', 'spreadsheet', 'slides', 'agenda', 'minutes', 'follow-up', 'question', 'answer',
  'idea', 'option', 'tradeoff', 'risk', 'estimate', 'scope', 'priority', 'milestone', 'owner', 'status',
  'blocked', 'unblocked', 'shipped', 'landed', 'backed', 'out', 'again', 'still', 'already', 'probably',
  'definitely', 'maybe', 'quickly', 'carefully', 'before', 'after', 'during', 'around', 'about', 'with',
  'without', 'for', 'from', 'into', 'over', 'under', 'between', 'because', 'although', 'while', 'and',
  'but', 'or', 'so', 'then', 'that', 'this', 'these', 'those', 'it', 'they', 'you', 'everyone', 'nobody',
  'small', 'large', 'new', 'old', 'final', 'early', 'late', 'simple', 'complex', 'stable', 'nightly',
  'beta', 'staging', 'production', 'mobile', 'desktop', 'tablet', 'screen', 'scroll', 'click', 'frame',
  'paint', 'style', 'script', 'parser', 'compiler', 'garbage', 'collector', 'heap', 'graph', 'chart',
];

export const SUBJECT_TOPICS = [
  'Q3 roadmap review', 'offsite planning', 'hiring loop for the platform role', 'budget for next quarter',
  'renderer performance numbers', 'sync worker crash on reconnect', 'design review: folder manager',
  'release notes for 2.4', 'on-call handover', 'customer escalation from Contoso', 'contract renewal',
  'migration to the new cache schema', 'accessibility audit findings', 'dark mode contrast issues',
  'flaky integration tests', 'conference talk proposal', 'team lunch on Thursday', 'travel reimbursement',
  'security review checklist', 'API deprecation timeline', 'onboarding plan for new hires',
  'quarterly business review', 'retro notes', 'benchmark methodology', 'memory regression in nightly',
  'layout thrashing in the message list', 'IndexedDB quota errors', 'invoice #48213', 'weekend plans',
  'photos from the trip', 'birthday dinner', 'apartment viewing', 'book club pick', 'garden project',
];

export const NOTIFICATION_SUBJECTS = [
  (n: number) => `[atlas] PR #${n}: Fix race between sync worker and cache writer`,
  (n: number) => `[atlas] PR #${n}: Virtualize the folder manager tree`,
  (n: number) => `[borealis] Issue #${n}: Message list jumps when new mail arrives`,
  (n: number) => `Bug ${n} - Crash in layout when resizing the reading pane`,
  (n: number) => `Bug ${n} - Intermittent timeout in compose send test`,
  (n: number) => `Build #${n} failed on main`,
  (n: number) => `Build #${n} fixed on main`,
  (n: number) => `Invitation: Weekly sync @ Tue ${(n % 12) + 1}:00`,
  (n: number) => `Your statement for account ending ${String(n).slice(-4)} is ready`,
  (n: number) => `Your package ${n}-QX has shipped`,
];

export const NEWSLETTER_HEADLINES = [
  'Shipping faster layouts with containment', 'A field guide to long tasks', 'What changed in the cascade',
  'Five ways to cut bundle size this week', 'Inside a modern garbage collector', 'Scheduling work off the main thread',
  'Fall fares are here: save up to 30%', 'Members-only tasting this Saturday', 'New arrivals for the season',
  'Your weekly status summary', 'Course spotlight: typography for interfaces', 'Ski passes on sale now',
  'Understanding interaction to next paint', 'How we rebuilt our storage layer', 'Release candidate is out',
];

export const ATTACHMENT_NAMES = [
  ['roadmap-q3.pdf', 'application/pdf'],
  ['budget-2027.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  ['meeting-notes.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ['screenshot.png', 'image/png'],
  ['profile-trace.json', 'application/json'],
  ['invoice-48213.pdf', 'application/pdf'],
  ['photo-001.jpg', 'image/jpeg'],
  ['slides-final-v3.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  ['contract-signed.pdf', 'application/pdf'],
  ['logs.zip', 'application/zip'],
] as const;
