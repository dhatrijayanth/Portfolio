/* ============================================================
   TXI Universe — data.js
   Project data — replace placeholder content below with real info.
============================================================ */

const PROJECTS = [
  /* ── Project 1 ── */
  {
    id: 0,
    name: 'Orbit',
    tagline: 'Connecting communities through shared creativity',
    color: '#7B61FF',
    colorRgb: '123, 97, 255',
    planetClass: 'planet-p1',
    orbitRadius: 195,
    orbitDuration: 32,
    orbitDelay: 4,

    animation: {
      type: 'network',
      bigNumber: '2,400+',
      bigLabel: 'Community Connections Made',
      story: [
        'Siloed communities with no way to connect',
        'Shared interests surfacing across groups',
        'A living network, building together',
      ],
    },

    overview: {
      heading: 'A platform built for community, by community',
      body: 'Orbit reimagines how people with shared interests find each other and build together. Smart matching and collaborative workspaces transform isolated talent into powerful, self-sustaining creative networks.',
    },

    team: [
      { name: 'Alex Chen',     role: 'Lead Designer',      initials: 'AC', bio: 'Shaped Orbit\'s visual language and interaction model from first sketch to final pixel. Believes the best interfaces disappear.' },
      { name: 'Jordan Rivera', role: 'Frontend Engineer',   initials: 'JR', bio: 'Built the real-time collaboration layer from the ground up. Specialises in making complex systems feel effortless.' },
      { name: 'Sam Patel',     role: 'Backend Engineer',    initials: 'SP', bio: 'Designed the matching algorithm and data architecture that scales without breaking. Nothing ships without her review.' },
      { name: 'Morgan Lee',    role: 'Product Manager',     initials: 'ML', bio: 'Translated community needs into a focused roadmap. Kept every sprint pointed at the right problems.' },
      { name: 'Casey Torres',  role: 'UX Researcher',       initials: 'CT', bio: 'Ran 60+ user interviews that shaped Orbit\'s core features. The team\'s constant advocate for evidence over assumption.' },
      { name: 'Riley Kim',     role: 'Data Engineer',       initials: 'RK', bio: 'Builds the pipelines powering Orbit\'s insight layer. Obsessive about data integrity at every stage.' },
    ],

    info: {
      what: 'A community connection platform enabling members to discover projects, form cross-disciplinary teams, and collaborate through a shared creative workspace with integrated messaging and file tools.',
      why: 'Community members were siloed — great ideas died because creators couldn\'t find collaborators. We needed organic, friction-free connection at scale without the noise of social media.',
      steps: [
        'Ran 8 weeks of qualitative research across 4 community verticals to define real connection barriers',
        'Designed and validated a smart interest-graph matching algorithm with a 200-person closed beta',
        'Built collaborative workspaces with integrated messaging, file sharing, and task management',
        'Iterated on the onboarding flow until week-1 retention consistently exceeded 75%',
        'Launched publicly after 4 months of beta — 2,400 connections formed in the first 30 days',
      ],
      impact: [
        '2,400+ active connections formed in the first month after launch',
        '340 cross-disciplinary projects initiated through the platform',
        '89% user satisfaction score in the post-launch survey',
        'Average team formation time reduced from 3 weeks to 4 days',
        'Featured in Tech Community Magazine as a standout community innovation',
      ],
    },
  },

  /* ── Project 2 ── */
  {
    id: 1,
    name: 'Flux',
    tagline: 'Real-time analytics, made human',
    color: '#FF6B35',
    colorRgb: '255, 107, 53',
    planetClass: 'planet-p2',
    orbitRadius: 302,
    orbitDuration: 50,
    orbitDelay: 25,

    animation: {
      type: 'flow',
      bigNumber: '10M+',
      bigLabel: 'Data Events Processed Daily',
      story: [
        'Raw data flooding in from every direction',
        'Ingested, classified, and structured in real time',
        'Clean insight, ready to act on',
      ],
    },

    overview: {
      heading: 'Turn your data stream into decisions',
      body: 'Flux is a real-time analytics dashboard that translates complex data pipelines into clear, actionable visuals — giving non-technical stakeholders the insight they need without engineering support.',
    },

    team: [
      { name: 'Devon Walsh',   role: 'Engineering Lead',       initials: 'DW', bio: 'Led the end-to-end technical architecture of Flux. Obsessed with sub-200ms latency and zero data loss at any volume.' },
      { name: 'Skylar Nguyen', role: 'Data Architect',          initials: 'SN', bio: 'Designed the ingestion and schema layer that makes Flux both fast and flexible. The pipeline\'s structural foundation.' },
      { name: 'Quinn Alvarez', role: 'Visualisation Designer',  initials: 'QA', bio: 'Turned raw data structures into charts people genuinely understand. Masters the space between data and story.' },
      { name: 'Avery Brooks',  role: 'Frontend Engineer',       initials: 'AB', bio: 'Built every interactive dashboard element. Ensures complex visualisations stay crisp, responsive, and accessible.' },
    ],

    info: {
      what: 'An analytics platform that ingests, processes, and visualises real-time data streams with a focus on clarity — from raw events to board-ready dashboards, all configurable without writing a line of code.',
      why: 'Stakeholders were making decisions on week-old data. Engineers spent 40% of their time building one-off reports. We needed a single source of truth that anyone could actually use.',
      steps: [
        'Audited 12 existing reporting tools across 6 departments to find what was failing and why',
        'Designed a schema-flexible ingestion pipeline capable of handling diverse formats and burst loads',
        'Built a real-time visualisation layer maintaining under 200ms latency at 10M+ daily events',
        'Created a no-code dashboard builder so business teams could self-serve without engineering',
        'Piloted with 2 departments, then rolled out org-wide within 90 days of initial deployment',
      ],
      impact: [
        '10 million+ events processed daily with consistent sub-200ms latency',
        'Report generation time reduced from 3 days to under 15 minutes',
        'Adopted by 6 departments, replacing 12 separate legacy tools',
        'Saved an estimated 800 engineering hours in the first quarter',
        'Zero critical data incidents or service outages since deployment',
      ],
    },
  },

  /* ── Project 3 ── */
  {
    id: 2,
    name: 'Echo',
    tagline: 'A feedback loop that actually closes',
    color: '#35FFCA',
    colorRgb: '53, 255, 202',
    planetClass: 'planet-p3',
    orbitRadius: 415,
    orbitDuration: 68,
    orbitDelay: 51,

    animation: {
      type: 'pulse',
      bigNumber: '94%',
      bigLabel: 'Issue Resolution Rate',
      story: [
        'Feedback submitted — no visibility on what happens next',
        'Intelligently routed to the right team, immediately',
        'Resolved, responded to, and closed — every time',
      ],
    },

    overview: {
      heading: 'From feedback to action, in record time',
      body: 'Echo is a structured feedback management system that captures community sentiment, routes each item to the right person, and tracks resolution — closing the loop between people and the organisations that serve them.',
    },

    team: [
      { name: 'Finley Park',  role: 'System Architect',   initials: 'FP', bio: 'Designed Echo\'s intelligent routing logic and full audit trail system. Every decision is traceable back to a rule.' },
      { name: 'Reese Monroe', role: 'Full-Stack Engineer', initials: 'RM', bio: 'Built the ingestion, routing, and resolution flows end to end. The person who makes the feedback loop actually close.' },
      { name: 'Sage Cooper',  role: 'Product Designer',   initials: 'SC', bio: 'Designed every submission and resolution interface with deep attention to community trust and communicative clarity.' },
      { name: 'River Stone',  role: 'Community Lead',     initials: 'RS', bio: 'Acted as the bridge between product and community throughout. Brought genuine empathy to every specification.' },
      { name: 'Blake Harris', role: 'QA Engineer',        initials: 'BH', bio: 'Wrote the test suite guaranteeing no feedback item is ever silently dropped or misrouted. The system\'s conscience.' },
    ],

    info: {
      what: 'A multi-channel feedback platform that aggregates input from forms, surveys, and direct messages, then intelligently routes, tracks, and resolves each item — with full audit trails and submitter notifications.',
      why: 'Community members reported their feedback was vanishing into a void. No visibility into whether issues were heard, let alone acted on. Trust was eroding and we needed radical transparency.',
      steps: [
        'Mapped the full feedback lifecycle across 3 community verticals to identify every failure point',
        'Designed an intelligent routing ruleset based on category, urgency, and team ownership',
        'Built a multi-channel ingestion layer handling forms, direct messages, and survey responses',
        'Created a public-facing status tracker showing submitters the live progress of their feedback',
        'Integrated automated resolution notifications that close the loop back to the original submitter',
      ],
      impact: [
        '94% of submitted issues resolved or formally responded to within SLA',
        'Average response time cut from 11 days to 36 hours',
        'Community trust scores increased 41% within 60 days of launch',
        '1,800+ feedback items successfully processed through the system',
        'Adopted as standard feedback infrastructure across 3 community verticals',
      ],
    },
  },
];
