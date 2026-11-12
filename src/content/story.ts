// ---------------------------------------------------------------------------
// ALL the words on the site live in this file. Edit here, not in the pages.
// Everything below comes from Demilade's own account. Fields left empty
// ('' or []) simply don't appear on the site. Never fill them with made-up
// dates, tools, metrics or outcomes.
// ---------------------------------------------------------------------------

export const site = {
  name: 'Demilade', // the 3D letters at the end of the page (kept short so they stay large)
  fullName: 'Coker Demilade Daniel', // the logo, the page title and the footer
  title: 'Curiosity. Code. Creation.',
  headline: ['Curiosity.', 'Code.', 'Creation.'],
  statement:
    'A curious mind exploring the intersection of design, data, and technology — transforming ideas into digital experiences.',
  identity: ['Computer & Software Engineering', 'Web Development', 'Data & AI'],
  cta: [
    { label: 'Explore My World', href: '#curiosity' },
    { label: 'Discover My Work', href: '#projects' },
  ],
  description:
    'Coker Demilade Daniel: a curious mind exploring the intersection of design, data, and technology. Computer and Software Engineering, web development, data and AI.',
};

// Top navigation. `section` matches the `section` of one or more chapters below.
export const nav = [
  { label: 'About', section: 'about', href: '#curiosity' },
  { label: 'Projects', section: 'projects', href: '#projects' },
  { label: 'Journey', section: 'journey', href: '#building' },
];

export type Chapter = { id: string; section: string; number: string; name: string; headline: string; body: string[] };

export const chapters: Record<string, Chapter> = {
  curiosity: {
    id: 'curiosity', section: 'about', number: '01', name: 'The mind',
    headline: 'IT ALL STARTED WITH CURIOSITY.',
    body: [
      'I have always been fascinated by computers and the way things work.',
      'From a young age I was a naturally logical thinker. I believed that everything happening around me had an explanation.',
      'That mindset fuelled my curiosity, and my desire to understand technology.',
    ],
  },
  spark: {
    id: 'spark', section: 'about', number: '02', name: 'The first spark',
    headline: 'A Phone. A Few Lines of Code. A World of Possibilities.',
    body: [
      'My journey into technology began on my first phone.',
      'That is where I started learning Python and CSS.',
      'What started as curiosity gradually became a passion.',
    ],
  },
  building: {
    id: 'building', section: 'journey', number: '03', name: 'Professional experience',
    headline: 'From Learning to Building',
    body: [
      'I went on to study Computer and Software Engineering at university. I kept developing my technical knowledge there, and surrounded myself with like-minded people who challenged me to aim higher.',
      'Then the learning met real work. I interned at HexAvid Smith Solutions Ltd., and saw how technology is used to solve real-world business problems.',
    ],
  },
  mind: {
    id: 'mind', section: 'journey', number: '04', name: 'How I think',
    headline: 'Inside My Mind',
    body: [
      'I am driven by curiosity, guided by logic, inspired by creativity, and motivated by the possibilities of technology.',
      'My technical journey is shaped by how I think, not just by what I know.',
    ],
  },
  interests: {
    id: 'interests', section: 'journey', number: '05', name: 'Technical interests',
    headline: 'The Curiosity Lab',
    body: [
      'I am passionate about the intersection of creativity, technology, data and problem-solving.',
      'These are the six areas I am exploring. They are interests, not titles, and each one feeds the others.',
    ],
  },
  playground: {
    id: 'playground', section: 'journey', number: '06', name: 'Experiments',
    headline: 'The Interactive Playground',
    body: [
      'Reading about curiosity only goes so far.',
      'Here are three small experiments to try. Change the inputs and watch what happens.',
    ],
  },
  projects: {
    id: 'projects', section: 'projects', number: '07', name: 'Projects',
    headline: 'Ideas Made Real',
    body: ['My journey has been about learning, experimenting, building and continuously evolving. These are three of the things I have worked on.'],
  },
  next: {
    id: 'next', section: 'vision', number: '08', name: 'The vision',
    headline: 'The Next Version of Me',
    body: [
      'My story is still unfolding.',
      'I am not there yet, and that is the point. These are the directions I am working towards.',
    ],
  },
};

// The Interactive Playground: the words around the three experiments.
// (How each one works lives in src/scripts/playground.js and src/scripts/creative.js.)
export const experiments = {
  data: {
    label: 'Experiment A',
    title: 'Data in Motion',
    intro: 'A chart that redraws itself the moment its numbers change.',
    how: 'Edit any value, switch between bars and a line, then sort or shuffle the data.',
    shows: 'A visualization is a mapping from numbers to shapes. Change the data and the picture has to follow.',
    note: 'Demonstration data: made-up sample values, not real measurements.',
    sample: [
      { label: 'A', value: 24 }, { label: 'B', value: 58 }, { label: 'C', value: 37 },
      { label: 'D', value: 81 }, { label: 'E', value: 46 }, { label: 'F', value: 65 },
    ],
  },
  logic: {
    label: 'Experiment B',
    title: 'The Logic Machine',
    intro: 'A straight line fitted to scattered points, recalculated as you move them.',
    how: 'Drag any point, or change the slope, the noise and the number of points. Moving a slider draws a fresh set of points.',
    shows: 'Simple linear regression: the most basic way of asking how one thing changes with another, and how far to trust the answer.',
    note: 'Demonstration data: the points are generated by the page from the settings below.',
    logic: [
      'The line is the one that makes the vertical gaps between it and the points (the residuals) as small as possible once each gap is squared and they are all added up. This is the least squares method.',
      'slope = Σ(x − x̄)(y − ȳ) ÷ Σ(x − x̄)², and intercept = ȳ − slope × x̄, where x̄ and ȳ are the averages.',
      'R² = 1 − (sum of squared residuals ÷ total variation in y). It is the share of the variation in y that the line accounts for: 1 is a perfect fit, 0 means the line explains nothing. Add noise and watch it fall.',
    ],
  },
  creative: {
    label: 'Experiment C',
    title: 'The Creative Engine',
    intro: 'A form made of particles, generated entirely by code.',
    how: 'Move your pointer or finger through it. Adjust the density, the speed and the rotation.',
    shows: 'Creative coding: a few lines of trigonometry, repeated for thousands of points, become something that looks alive.',
    fallback: 'This experiment needs 3D graphics, which this browser or device is not providing.',
  },
};

// Inside My Mind: the five nodes of the 3D structure, in order around the ring (first one at the top).
// `links` lists which nodes connect, as pairs of positions in `nodes` (0 = the first node).
export const mind = {
  hint: 'Drag to look around. Select a node to open it.',
  nodes: [
    { name: 'Curiosity', text: 'My desire to understand how things work and explore new possibilities.' },
    { name: 'Logic', text: 'My analytical approach to understanding problems and finding explanations.' },
    { name: 'Creativity', text: 'My interest in transforming ideas into visual and functional experiences.' },
    { name: 'Problem-Solving', text: 'My passion for exploring challenges and developing practical solutions.' },
    { name: 'Growth', text: 'My commitment to continuous learning, experimentation, and improvement.' },
  ],
  // Curiosity feeds logic and creativity; both of those feed problem-solving; growth connects to everything.
  links: [[0, 1], [0, 2], [1, 3], [2, 3], [4, 0], [4, 1], [4, 2], [4, 3]] as [number, number][],
};

// Chapter 03 timeline. No dates until they are confirmed: add them to `when`.
export const timeline: { when: string; title: string; text: string; roles?: string[] }[] = [
  {
    when: 'University',
    title: 'Computer and Software Engineering',
    text: 'Where curiosity was given structure, among people who challenged me to aim higher.',
  },
  {
    when: 'Internship',
    title: 'HexAvid Smith Solutions Ltd.',
    roles: ['Operations Team Member', 'Web Developer', 'Web Designer'],
    text: 'A valuable learning journey. I learned to work under pressure, to deliver work to a high standard, to collaborate with others, and to approach technical challenges with a solution-oriented mindset.',
  },
  {
    when: 'What it taught me',
    title: 'Technology for real problems',
    text: 'I gained experience working with ERP software, understanding business processes and building functional models. It expanded my understanding of how technology can solve real-world business problems.',
  },
  { when: 'Now', title: 'Still evolving', text: 'Learning, experimenting, building. The next entries are being written.' },
];

// The Curiosity Lab. The order here is the order of the 3D structures around the ring.
// These are interests, not job titles. For each area:
//   used     = tools and technologies Demilade has actually used
//   learning = what is being learned right now
//   explore  = what Demilade wants to explore next
//   projects = ids of related projects from the `projects` list below
// Empty lists are simply not shown. Only add things that are true.
export type Discipline = {
  name: string; line: string; intro: string;
  used: string[]; learning: string[]; explore: string[]; projects: string[];
};
export const lab = {
  hint: 'Select a structure to step inside.',
  groups: { used: 'Have used', learning: 'Learning now', explore: 'Want to explore' },
};
export const disciplines: Discipline[] = [
  {
    name: 'Web Development', line: 'Where ideas become things people can use.',
    intro: 'My interest in building functional and interactive digital experiences.',
    used: ['CSS'], learning: [], explore: [], projects: ['helloglow'],
  },
  {
    name: 'Web Design', line: 'How it looks, how it feels, how it makes sense.',
    intro: 'My interest in user experience, interface design, and visual storytelling.',
    used: [], learning: [], explore: [], projects: ['hexavid', 'helloglow'],
  },
  {
    name: 'Data Analytics', line: 'Finding out what the numbers are saying.',
    intro: 'My interest in understanding data, discovering patterns, and generating insights.',
    used: [], learning: [], explore: [], projects: [],
  },
  {
    name: 'Statistical Modelling', line: 'Turning patterns into explanations.',
    intro: 'My interest in mathematical relationships, analytical methods, and predictive thinking.',
    used: [], learning: [], explore: [], projects: ['oddsvision'],
  },
  {
    name: 'Data Engineering', line: 'Moving and shaping data so it can be used.',
    intro: 'My interest in data processing, transformation, pipelines, and data infrastructure.',
    used: [], learning: [], explore: [], projects: ['oddsvision'],
  },
  {
    name: 'Artificial Intelligence', line: 'Systems that learn from all of it.',
    intro: 'My interest in intelligent systems and emerging technological possibilities.',
    used: [], learning: [], explore: [], projects: [],
  },
];

// Chapter 05. Each project is a case study. Only filled fields are shown.
export type Project = {
  id: string;
  client: string;
  title: string;
  visual: 'web-a' | 'web-b' | 'data'; // the drawn diagram, used when there is no image
  image?: string; // a screenshot in public/projects/, e.g. '/projects/hexavid.webp'
  imageAlt?: string;
  imageRatio?: string; // optional crop, as 'width / height'; the image is kept from the top
  withDiagram?: boolean; // also show the drawn diagram under the screenshot
  overview: string;
  role: string[];
  objective: string; // the problem or goal
  tools: string[]; // only tools Demilade has confirmed
  approach: string;
  contributions: string[];
  results: string; // only real, confirmed outcomes
  link: string;
};

export const projects: Project[] = [
  {
    id: 'hexavid',
    client: 'HexAvid Smith Solutions Ltd.',
    title: 'Website Design Revamp',
    visual: 'web-a',
    image: '/projects/hexavid.webp',
    imageAlt: 'The HexAvid Smith Solutions home page: a green hero with the headline "Make Your Business Systems Work Better Together" beside dashboard cards.',
    overview: 'Revamping the website design and digital presence of HexAvid Smith Solutions Ltd.',
    role: ['Web design'],
    objective: '', tools: [], approach: '', contributions: [], results: '', link: '',
  },
  {
    id: 'helloglow',
    client: 'HelloGlow NG',
    title: 'Website Design and Development',
    visual: 'web-b',
    image: '/projects/helloglow.webp',
    imageAlt: 'The HelloGlow NG home page: a skincare shop with search, cart and the headline "Elevate Your Skin Enhance Your Beauty".',
    overview: 'Designing and developing the HelloGlow NG website.',
    role: ['Web design', 'Web development'],
    objective: '', tools: [], approach: '', contributions: [], results: '', link: '',
  },
  {
    id: 'oddsvision',
    client: 'OddsVision Ltd.',
    title: 'Statistical Modelling, Data Scraping and Data Filtering',
    visual: 'data',
    image: '/projects/oddsvision.png',
    imageAlt: 'The OddsVision dashboard: a daily summary with lists such as Safest, Value, Draws and Streaks, and a tracker of how the model is doing.',
    imageRatio: '1560 / 800', // trims the screenshot tool bar at the bottom of the capture
    withDiagram: true,
    overview: 'Statistical modelling, data scraping, and the filtering and processing of a large dataset.',
    role: ['Statistical modelling', 'Data scraping', 'Data filtering and processing'],
    objective: '', tools: [], approach: '', contributions: [], results: '', link: '',
  },
];

// Chapter 06. Aspirations, not current titles.
export const aspirations = ['Senior Data Engineer', 'Data Analytics Specialist', 'Senior Web Developer and Engineer'];

export const closing = {
  statement: ['I am not just building a career in technology.', 'I am continuing a journey that started with curiosity.'],
  signoff: 'To be continued.',
};

// Leave email empty and links [] to hide the contact block and the Contact nav link.
export const contact: { email: string; links: { label: string; href: string }[] } = {
  email: 'cokerdan20@gmail.com',
  links: [],
};
