import { Project, ExperienceItem, PlaygroundVignette, Testimonial, CoreTechnology, MethodologyItem, WhatYouCanBuildItem } from '../types';

export const PERSONAL_INFO = {
  name: 'Avis Ifeakor',
  title: 'Full-Stack Software Engineer & AI Systems Architect',
  tagline: 'FULL-STACK ECOSYSTEMS / DATA-DRIVEN AI / CROSS-PLATFORM MOBILE (2024 — 2026)',
  location: 'London & San Francisco',
  status: 'Available for Select Engineering Roles & Projects (2024 — 2026)',
  bioBrief: 'I build cohesive full-stack platforms, deploy data-driven AI models, and engineer cross-platform Flutter applications with uncompromising architectural discipline.',
  bioFull: [
    'Specializing in modern full-stack ecosystems (2024–2026), I architect cohesive web platforms connecting dynamic ReactJS frontends to robust Spring Boot, Jakarta EE, or Supabase services, while applying SMAC digital transformation frameworks.',
    'My technical toolkit extends from low-level memory logic in C and enterprise systems in Java and C# to Python-powered data science pipelines with PyTorch, scikit-learn, and pandas. I build cross-platform mobile apps with Dart and Flutter, manage relational and document databases (PostgreSQL, SQL Server, MongoDB), and enforce clean Object-Oriented software architecture and Agile/DevOps delivery.',
  ],
  quote: 'Engineering excellence is the seamless synergy between resilient backend architecture, disciplined data science, and intuitive, fluid human interfaces.',
  featuredAt: ['Awwwards Site of the Year', 'FWA of the Day', 'GitHub Trending', 'Type01 Magazine', 'Design Systems Coalition'],
  email: 'avisifeakor@gmail.com',
  whatsapp: '+234 815 067 5245',
  whatsappUrl: 'https://wa.me/2348150675245',
  socials: [
    { label: 'Email', url: 'mailto:avisifeakor@gmail.com' },
    { label: 'GitHub', url: 'https://github.com/avisifeakor' },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/avisifeakor' },
    { label: 'WhatsApp', url: 'https://wa.me/2348150675245' },
  ],
};

export const PROJECTS: Project[] = [
  {
    id: 'aetheria-os',
    title: 'Aetheria Spatial Canvas',
    subtitle: 'High-performance infinite node-graph and generative spatial engine',
    category: 'AI & Systems',
    year: '2025',
    role: 'Lead Systems Architect & Creative Technologist',
    client: 'Aetheria Labs',
    description: 'An infinite canvas workflow engine combining WebGL shaders with concurrent state machines. Handles 10,000+ interactive nodes at 120fps with sub-millisecond pan and zoom damping.',
    caseStudy: {
      heroTag: 'Spatial Computing & WebGL',
      summary: 'Reimagined graph-based computation into a tactile infinite surface where complex multi-model pipelines feel as effortless as drawing on paper.',
      challenge: 'Traditional node-graph software (like Blender or Unreal shader editors) stutter when rendering beyond 400 connected graph primitives on the web, causing severe DOM thrashing.',
      solution: 'Architected an instanced WebGL rendering pipeline paired with an off-thread Web Worker spatial index (R-Tree), eliminating DOM nodes for inactive clusters and maintaining continuous 120 FPS.',
      metrics: [
        { label: 'Rendering Framerate', value: '120 FPS' },
        { label: 'Active Graph Nodes', value: '10,000+' },
        { label: 'Memory Footprint', value: '-62%' },
        { label: 'Input Latency', value: '0.4ms' }
      ],
      deliverables: [
        'Custom WebGL instanced node-renderer',
        'Spatial hash & R-Tree worker acceleration',
        'Tactile bezier spline snapping system',
        'Comprehensive TypeScript design token architecture'
      ],
      techStack: ['React', 'TypeScript', 'WebGL', 'GLSL Shaders', 'Tailwind CSS', 'Framer Motion'],
      testimonial: {
        quote: 'Avis fundamentally altered how our team conceptualizes web performance. The fluidity of the canvas feels indistinguishable from native macOS software.',
        author: 'Anonymous Client',
        role: 'Verified Production Review'
      }
    },
    mockupType: 'dashboard',
    accentColor: '#4F46E5',
    featured: true,
  },
  {
    id: 'hyperion-telemetry',
    title: 'Hyperion Market Intelligence',
    subtitle: 'Sub-millisecond visual telemetry and high-frequency liquidity analyzer',
    category: 'Fintech & Web',
    year: '2025',
    role: 'Staff Frontend Engineer',
    client: 'Hyperion Protocol',
    description: 'A dark-mode institutional trading interface built for high-frequency algorithmic desks. Visualizes order books, depth heatmaps, and slippage curves in real time.',
    caseStudy: {
      heroTag: 'High-Frequency FinTech',
      summary: 'Engineered an ultra-low latency telemetry cockpit displaying 25,000 live tick updates per second without dropping frames or triggering garbage collection pauses.',
      challenge: 'React re-renders on WebSocket tick updates choked the main UI thread during market volatility spikes, freezing trader interactions.',
      solution: 'Separated UI state from data throughput using raw SharedArrayBuffers, zero-allocation ring buffers, and direct GPU canvas blitting for charts.',
      metrics: [
        { label: 'WebSocket Ticks/Sec', value: '25,000+' },
        { label: 'Garbage Collection Stalls', value: '0.0ms' },
        { label: 'Daily Trading Volume', value: '$1.4B' },
        { label: 'Execution Speedup', value: '3.8x' }
      ],
      deliverables: [
        'Zero-allocation ring buffer telemetry pipeline',
        'High-density canvas depth visualizer',
        'Keyboard-driven rapid order terminal',
        'Dark-mode financial design system tokens'
      ],
      techStack: ['React', 'TypeScript', 'Web Workers', 'SharedArrayBuffer', 'Canvas 2D', 'Tailwind'],
      testimonial: {
        quote: 'The level of technical precision Avis brings to frontend engineering is extraordinary. Our traders refuse to use anything else.',
        author: 'Anonymous Client',
        role: 'Verified Production Review'
      }
    },
    mockupType: 'macbook',
    accentColor: '#10B981',
    featured: true,
  },
  {
    id: 'verve-audio-lab',
    title: 'Verve Audio Synthesizer',
    subtitle: 'Generative ambient sound engine & real-time harmonic visualizer',
    category: 'Hardware & IoT',
    year: '2024',
    role: 'Creative Developer & DSP Engineer',
    client: 'Verve Sound Labs',
    description: 'A tactile, in-browser musical instrument and spatial acoustic simulator combining Web Audio DSP with interactive WebGL particle fluid simulations.',
    caseStudy: {
      heroTag: 'Web Audio DSP & Particle Physics',
      summary: 'Created an expressive ambient instrument where every synthesized note emits physical ripples through an interactive WebGL field.',
      challenge: 'Web Audio timing is notoriously prone to jitter when background tasks run on the browser event loop, causing audible pops and audio artifacts.',
      solution: 'Implemented AudioWorklet processors with custom WebAssembly polyphonic synth voices, achieving sample-accurate timing and smooth harmonic modulation.',
      metrics: [
        { label: 'Audio Latency', value: '< 2.8ms' },
        { label: 'Polyphonic Voices', value: '32 voices' },
        { label: 'Sound Particles', value: '50,000' },
        { label: 'User Rating', value: '4.98 ★' }
      ],
      deliverables: [
        'Custom AudioWorklet DSP synthesizer',
        'GPU-driven audio-reactive particle field',
        'MIDI hardware controller integration',
        'Tactile glass UI knob and fader physics'
      ],
      techStack: ['Web Audio API', 'AudioWorklet', 'Three.js', 'WebAssembly', 'Tailwind CSS'],
      testimonial: {
        quote: 'Working with Avis was like collaborating with an artist and a systems engineer rolled into one. The sound and touch are magical.',
        author: 'Anonymous Client',
        role: 'Verified Production Review'
      }
    },
    mockupType: 'iphone',
    accentColor: '#8B5CF6',
    featured: false,
  },
  {
    id: 'kinesis-motion-engine',
    title: 'Kinesis Design Engine',
    subtitle: 'Algorithmic motion tokens & multi-platform spring physics runtime',
    category: 'AI & Systems',
    year: '2024',
    role: 'Principal Design Technologist',
    client: 'Open Source / Enterprise',
    description: 'A cross-platform animation compiler that mathematically converts physical spring constants (stiffness, damping, mass) into optimized CSS and GLSL transitions.',
    caseStudy: {
      heroTag: 'Design Systems & Physics',
      summary: 'Unified design tokens across React, iOS Swift, and Android Compose with mathematically consistent spring physics.',
      challenge: 'Designers tuned spring curves in Figma while engineers hand-coded arbitrary easing curves in CSS, resulting in fragmented brand motion.',
      solution: 'Built a declarative AST compiler that translates continuous fourth-order Runge-Kutta physics directly into lightweight lookup tables and CSS keyframes.',
      metrics: [
        { label: 'Token Sync Speed', value: 'Real-time' },
        { label: 'Bundle Footprint', value: '1.2 KB' },
        { label: 'Active Enterprise Apps', value: '40+' },
        { label: 'Engineer NPS', value: '+88' }
      ],
      deliverables: [
        'Spring physics calculation compiler',
        'Interactive Figma visualizer plugin',
        'TypeScript and Swift runtime libraries',
        'Automated regression visual diffing suite'
      ],
      techStack: ['TypeScript', 'Node.js', 'Framer Motion', 'Figma API', 'Tailwind CSS'],
      testimonial: {
        quote: 'Kinesis solved the decade-old disconnect between our design team’s motion intent and production code. An absolute triumph of craft.',
        author: 'Anonymous Client',
        role: 'Verified Production Review'
      }
    },
    mockupType: 'watch',
    accentColor: '#F59E0B',
    featured: false,
  },
  {
    id: 'nexus-ai-pipeline',
    title: 'Nexus Predictive Intelligence',
    subtitle: 'Data-driven AI solutions, inferential statistics & local ML pipelines',
    category: 'AI & Systems',
    year: '2025',
    role: 'AI Systems Engineer & Data Scientist',
    client: 'QuantAI Research',
    description: 'Processing extensive datasets using pandas, NumPy, and PyTorch to evaluate quantitative metrics, analyze inferential statistics, and deploy local machine learning pipelines with high predictive throughput.',
    caseStudy: {
      heroTag: 'Machine Learning & Inferential Analytics',
      summary: 'Engineered an end-to-end local machine learning pipeline that preprocesses multi-gigabyte statistical datasets and executes predictive inference with sub-second latency.',
      challenge: 'Extracting actionable signals from noisy high-dimensional datasets while ensuring reproducible local training and deployment without heavy cloud inference costs.',
      solution: 'Constructed custom PyTorch model architectures alongside scikit-learn statistical validation routines, leveraging vectorized pandas transformations for memory-efficient computation.',
      metrics: [
        { label: 'Dataset Processing', value: '4.2 GB/s' },
        { label: 'Prediction Accuracy', value: '96.4%' },
        { label: 'Inference Latency', value: '< 18ms' },
        { label: 'Memory Savings', value: '54%' }
      ],
      deliverables: [
        'End-to-end PyTorch & scikit-learn model architecture',
        'Vectorized pandas ETL and data cleansing pipelines',
        'Statistical validation & inferential metric visualizers',
        'Local model inference daemon'
      ],
      techStack: ['Python', 'PyTorch', 'scikit-learn', 'pandas', 'NumPy', 'FastAPI'],
      testimonial: {
        quote: 'Avis transformed our raw data lakes into clean, high-precision predictive models. His grasp of both statistical theory and production code is top-tier.',
        author: 'Anonymous Client',
        role: 'Verified Production Review'
      }
    },
    mockupType: 'dashboard',
    accentColor: '#6366F1',
    featured: true,
  },
  {
    id: 'pulse-flutter-mobile',
    title: 'PulseFlow Mobile Ecosystem',
    subtitle: 'Modular cross-platform mobile application engineered with Flutter & Dart',
    category: 'Mobile & Health',
    year: '2025',
    role: 'Lead Mobile Architect',
    client: 'Biometric Systems',
    description: 'Architecting fluid applications from a single codebase in Dart and Flutter, ensuring smooth reactive state management, offline-first sync with Supabase, and 60+ FPS native performance.',
    caseStudy: {
      heroTag: 'Cross-Platform Mobile & Flutter',
      summary: 'Unified complex biometric telemetry and live interactive charting into a single high-performance codebase for iOS and Android.',
      challenge: 'Maintaining smooth 60+ FPS touch interactions while streaming continuous real-time data packets over BLE and REST sockets across diverse Android and iOS hardware.',
      solution: 'Engineered a modular Dart architecture utilizing scoped reactive state management, isolating background serialization and maintaining pristine render cycles.',
      metrics: [
        { label: 'UI Framerate', value: '60+ FPS' },
        { label: 'Codebase Reusability', value: '98%' },
        { label: 'Offline Sync Speed', value: '0.2s' },
        { label: 'App Store Rating', value: '4.9 ★' }
      ],
      deliverables: [
        'Single-codebase Flutter application for iOS & Android',
        'Modular Dart architecture with reactive state management',
        'Offline-first synchronization layer via Supabase & SQLite',
        'Custom interactive micro-interaction physics engine'
      ],
      techStack: ['Dart', 'Flutter', 'Supabase', 'State Management', 'REST APIs', 'PostgreSQL'],
      testimonial: {
        quote: 'The PulseFlow app delivers the exact feel of a bespoke native app on both platforms from a single codebase. Avis nailed the execution.',
        author: 'Anonymous Client',
        role: 'Verified Production Review'
      }
    },
    mockupType: 'iphone',
    accentColor: '#0EA5E9',
    featured: true,
  },
];

export const EXPERIENCE_ITEMS: ExperienceItem[] = [
  {
    id: 'vane-labs',
    company: 'Nexus Full-Stack & AI Systems',
    role: 'Staff Full-Stack & AI Systems Architect',
    period: '2024 — 2026',
    location: 'London & San Francisco (Hybrid)',
    summary: 'Architecting end-to-end full-stack ecosystems, deploying predictive AI solutions, and leading cross-platform Flutter engineering initiatives.',
    bullets: [
      'Connected high-concurrency ReactJS frontends to enterprise Spring Boot, Jakarta EE, and Supabase backends with sub-millisecond API caching and reactive WebSockets.',
      'Developed data-driven AI solutions with Python, pandas, and PyTorch, deploying local machine learning pipelines and inferential statistical modeling across massive datasets.',
      'Architected modular cross-platform mobile applications in Dart/Flutter from a single codebase with unified reactive state management.'
    ],
    tags: ['Python / PyTorch', 'ReactJS', 'Spring Boot', 'Dart & Flutter', 'Supabase', 'PostgreSQL']
  },
  {
    id: 'prisma-studio',
    company: 'Prisma Enterprise Technologies',
    role: 'Senior Software & Backend Architect',
    period: '2022 — 2024',
    location: 'San Francisco, CA',
    summary: 'Engineered heavy-duty backend services in Java and C#, structuring relational SQL Server and PostgreSQL databases and large-scale document databases via MongoDB.',
    bullets: [
      'Engineered enterprise systems using strict Object-Oriented Programming (OOP) concepts, SOLID principles, and clean scalable architecture patterns.',
      'Implemented automated Agile & DevOps delivery pipelines with CI/CD and comprehensive unit/integration test coverage across multi-service deployments.',
      'Spearheaded digital transformation initiatives leveraging SMAC (Social, Mobile, Analytics, Cloud) frameworks for Fortune 500 enterprise clients.'
    ],
    tags: ['Java & C#', 'PostgreSQL', 'SQL Server', 'MongoDB', 'Agile & DevOps', 'OOP Architecture']
  },
  {
    id: 'monolith-systems',
    company: 'Monolith Web Systems',
    role: 'Systems & Dynamic Frontend Engineer',
    period: '2020 — 2022',
    location: 'London, UK',
    summary: 'Built dynamic frontend web applications with smooth scroll animations, low-level C memory logic, and robust REST/JSON data exchange.',
    bullets: [
      'Developed responsive UI layouts utilizing HTML5, CSS3, XML, and JSON with fine-tuned scroll physics and micro-interactions.',
      'Implemented low-level algorithmic modules and memory-conscious routines in C to optimize client-side data buffering.',
      'Designed resilient REST API client gateways with JSON schema validation and error-resilience interceptors.'
    ],
    tags: ['ReactJS', 'C Programming', 'HTML5 / CSS3', 'REST APIs & JSON', 'XML']
  }
];

export const PLAYGROUND_VIGNETTES: PlaygroundVignette[] = [
  {
    id: 'prismatic-orb',
    index: '01 / 06',
    title: 'Prismatic Refraction Sphere',
    tool: 'GLSL',
    year: '2025',
    tagline: 'Real-time chromatic dispersion & caustics',
    description: 'An interactive raymarched glass orb computing internal light reflections, Fresnel shading, and wavelength-dependent chromatic split at 60fps.',
    color: '#8B5CF6',
    bgGradient: 'from-violet-950 via-neutral-950 to-black',
    type: 'dispersion'
  },
  {
    id: 'fluid-field',
    index: '02 / 06',
    title: 'Navier-Stokes Advection',
    tool: 'THREE.JS',
    year: '2025',
    tagline: 'GPU fluid velocity simulation',
    description: 'Eulerian fluid dynamics solver computed in ping-pong framebuffers. Interactive cursor drag generates fluid turbulence and viscous smoke swirls.',
    color: '#06B6D4',
    bgGradient: 'from-cyan-950 via-neutral-950 to-black',
    type: 'island'
  },
  {
    id: 'verlet-cloth',
    index: '03 / 06',
    title: 'Verlet Constraint Fabric',
    tool: 'THREE.JS',
    year: '2024',
    tagline: 'Point-mass physics with interactive tear & shear',
    description: 'A 2,500-node particle grid solved with iterative constraint relaxation. Users can grab, pull, stretch, or cut the suspended fabric mesh.',
    color: '#F59E0B',
    bgGradient: 'from-amber-950 via-neutral-950 to-black',
    type: 'card3d'
  },
  {
    id: 'ascii-matrix',
    index: '04 / 06',
    title: 'Kinetic ASCII Halftone',
    tool: 'GLSL',
    year: '2024',
    tagline: 'Dynamic character density rasterizer',
    description: 'Converts procedural video and luminance gradients into monospace typographic glyph matrices in real time via custom GPU shaders.',
    color: '#10B981',
    bgGradient: 'from-emerald-950 via-neutral-950 to-black',
    type: 'kinetic'
  },
  {
    id: 'spatial-gyro',
    index: '05 / 06',
    title: 'Geodesic Gyroscope',
    tool: 'THREE.JS',
    year: '2024',
    tagline: 'Three-axis gimbal inertial physics',
    description: 'Interactive mechanical gimbal with physical inertia, rotational damping, and specular anisotropic metallic reflections.',
    color: '#EC4899',
    bgGradient: 'from-pink-950 via-neutral-950 to-black',
    type: 'burger'
  },
  {
    id: 'harmonic-oscillator',
    index: '06 / 06',
    title: 'Harmonic Waveform Field',
    tool: 'GLSL',
    year: '2024',
    tagline: 'Multi-frequency Lissajous wave simulator',
    description: 'Simultaneous mathematical sine superposition generating evolving 3D topological wave meshes with dynamic phase interference.',
    color: '#38BDF8',
    bgGradient: 'from-sky-950 via-neutral-950 to-black',
    type: 'abstract'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'client-1',
    quote: 'Avis is that rare creative engineer who operates with equal brilliance in the realm of high-performance systems and expressive visual design. Our team was blown away by the speed and tactile polish of every deliverable.',
    author: 'Anonymous Client',
    role: 'Verified Production Review',
    company: 'Enterprise Partner',
    avatarUrl: ''
  },
  {
    id: 'client-2',
    quote: 'In fintech, latency is everything. Avis solved our frontend bottlenecks with zero-allocation buffers while delivering the most visually stunning interface our trading desk has ever worked with.',
    author: 'Anonymous Client',
    role: 'Verified Production Review',
    company: 'FinTech Protocol',
    avatarUrl: ''
  },
  {
    id: 'client-3',
    quote: 'The depth of knowledge in mathematical motion, audio synthesis, and WebGL that Avis possesses is world-class. He turns ambitious technical concepts into pure interactive poetry.',
    author: 'Anonymous Client',
    role: 'Verified Production Review',
    company: 'Acoustic Labs',
    avatarUrl: ''
  }
];

export const CORE_TECHNOLOGIES: CoreTechnology[] = [
  {
    name: 'Python',
    role: 'Data Science & Machine Learning',
    description: 'The powerhouse for data science, inferential statistics, and training complex machine learning models with frameworks like PyTorch and scikit-learn.',
    frameworks: ['PyTorch', 'scikit-learn', 'pandas', 'NumPy', 'Inferential Statistics'],
    category: 'data',
    level: 'Core Strength'
  },
  {
    name: 'Dart',
    role: 'Cross-Platform Mobile Engineering',
    description: 'Essential for engineering modular, cross-platform applications through Flutter.',
    frameworks: ['Flutter', 'Modular Architecture', 'State Management', 'Cross-Platform'],
    category: 'languages',
    level: 'Production Focus'
  },
  {
    name: 'JavaScript & ReactJS',
    role: 'Dynamic Frontend & Interactive UI',
    description: 'The engine for dynamic frontend web development, setting the stage for smooth, scroll-based animations and interactive UI design.',
    frameworks: ['ReactJS', 'ES6+ / Modern JS', 'Scroll Animations', 'Interactive UI', 'Web APIs'],
    category: 'web',
    level: 'Expertise'
  },
  {
    name: 'Java & C#',
    role: 'Enterprise Backend & Robust Architecture',
    description: 'Heavy-duty enterprise languages built for advanced backend systems, object-oriented concepts, and robust application development.',
    frameworks: ['Spring Boot', 'Jakarta EE', '.NET Core / C#', 'OOP Architecture', 'Backend Systems'],
    category: 'enterprise',
    level: 'Enterprise Ready'
  },
  {
    name: 'C',
    role: 'Foundational Systems & Memory Logic',
    description: 'The foundational language for understanding memory management and elementary programming logic.',
    frameworks: ['Manual Memory Management', 'Pointers & Data Layout', 'Algorithmic Logic', 'Systems Fundamentals'],
    category: 'languages',
    level: 'Foundational'
  },
  {
    name: 'Database Management',
    role: 'Relational & Large-Scale Document Storage',
    description: 'Structuring relational data with SQL Server and PostgreSQL, while managing large-scale document databases via MongoDB.',
    frameworks: ['SQL Server', 'PostgreSQL', 'MongoDB', 'Relational Modeling', 'NoSQL Document Store'],
    category: 'data',
    level: 'Architecture'
  },
  {
    name: 'Web Fundamentals & Data Exchange',
    role: 'Responsive Layouts & API Protocols',
    description: 'HTML5, CSS3, XML, and JSON for building responsive layouts and processing API requests seamlessly.',
    frameworks: ['HTML5 Semantic Markup', 'CSS3 Layouts / Flex & Grid', 'JSON REST APIs', 'XML Data Exchange'],
    category: 'web',
    level: 'Standard'
  }
];

export const CORE_METHODOLOGIES: MethodologyItem[] = [
  {
    title: 'AI & Deep Learning',
    discipline: 'Predictive Algorithms & NLP Solutions',
    description: 'Designing neural networks, applying NLP solutions, and running predictive algorithms for complex data analysis.',
    keyPractices: ['Neural Network Design', 'NLP Solutions', 'Predictive Algorithms', 'Complex Data Analysis']
  },
  {
    title: 'Software Architecture',
    discipline: 'OOP & Scalable System Design',
    description: 'Mastering Object-Oriented Programming (OOP) concepts and utilizing strong programming practices to write clean, scalable code.',
    keyPractices: ['Object-Oriented Programming (OOP)', 'Clean Scalable Code', 'System Design Patterns', 'Maintainable Codebases']
  },
  {
    title: 'Agile & DevOps',
    discipline: 'Continuous Delivery & Lifecycle Management',
    description: 'Implementing modern project management principles to continuously deliver, test, and maintain software lifecycles.',
    keyPractices: ['Continuous Delivery (CD)', 'Automated Testing', 'Modern Agile Frameworks', 'Software Lifecycle Maintenance']
  },
  {
    title: 'Digital Transformation',
    discipline: 'SMAC Frameworks & Future-Ready Tech',
    description: 'Leveraging SMAC (Social, Mobile, Analytics, and Cloud) frameworks to design forward-thinking tech solutions.',
    keyPractices: ['SMAC Enterprise Framework', 'Cloud Integration', 'Mobile-First Ecosystems', 'Analytics-Driven Architecture']
  }
];

export const WHAT_YOU_CAN_BUILD: WhatYouCanBuildItem[] = [
  {
    title: 'Full-Stack Ecosystems',
    subtitle: 'Cohesive, High-Performance Web Platforms',
    description: 'Connecting highly interactive frontends to powerful backend services like Spring Boot, Jakarta EE, or Supabase to create cohesive web platforms.',
    stackHighlights: ['ReactJS', 'Spring Boot', 'Jakarta EE', 'Supabase', 'RESTful Services'],
    metrics: 'End-to-End Synergy'
  },
  {
    title: 'Data-Driven AI Solutions',
    subtitle: 'Quantitative Analytics & Local ML Pipelines',
    description: 'Processing extensive datasets using tools like pandas to evaluate quantitative metrics, analyze statistics, and deploy local machine learning pipelines.',
    stackHighlights: ['Python', 'pandas', 'PyTorch', 'scikit-learn', 'Predictive Pipelines'],
    metrics: 'Statistical Precision'
  },
  {
    title: 'Cross-Platform Mobile Apps',
    subtitle: 'Unified Single-Codebase Native Apps',
    description: 'Architecting fluid applications from a single codebase, ensuring smooth state management and high performance across devices.',
    stackHighlights: ['Dart', 'Flutter', 'State Management', 'Cross-Platform', 'Fluid UI'],
    metrics: 'Seamless Multi-Device'
  }
];

