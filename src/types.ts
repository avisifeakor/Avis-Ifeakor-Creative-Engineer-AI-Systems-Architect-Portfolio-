export type NavTab = 'work' | 'about' | 'playground';

export type ThemeMode = 'light' | 'dark';

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: 'AI & Systems' | 'Mobile & Health' | 'Hardware & IoT' | 'Fintech & Web';
  year: string;
  role: string;
  client: string;
  description: string;
  caseStudy: {
    heroTag: string;
    summary: string;
    challenge: string;
    solution: string;
    metrics: { label: string; value: string }[];
    deliverables: string[];
    techStack: string[];
    testimonial?: {
      quote: string;
      author: string;
      role: string;
    };
  };
  mockupType: 'macbook' | 'iphone' | 'watch' | 'dashboard';
  accentColor: string;
  featured?: boolean;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  period: string;
  location: string;
  summary: string;
  bullets: string[];
  tags: string[];
}

export interface PlaygroundVignette {
  id: string;
  index: string;
  title: string;
  tool: 'SPLINE' | 'BLENDER' | 'GLSL' | 'FLUTTER' | 'THREE.JS';
  year: string;
  description: string;
  tagline: string;
  color: string;
  bgGradient: string;
  type: 'card3d' | 'burger' | 'island' | 'dispersion' | 'kinetic' | 'abstract';
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  avatarUrl: string;
}

export interface FlowerItem {
  id: number;
  x: number;
  y: number;
  scale: number;
  color: string;
  petalCount: number;
  stemHeight: number;
  type: 'daisy' | 'tulip' | 'wildflower' | 'lavender';
}

export interface CoreTechnology {
  name: string;
  role: string;
  description: string;
  frameworks: string[];
  category: 'languages' | 'enterprise' | 'data' | 'web';
  level?: string;
}

export interface MethodologyItem {
  title: string;
  discipline: string;
  description: string;
  keyPractices: string[];
}

export interface WhatYouCanBuildItem {
  title: string;
  subtitle: string;
  description: string;
  stackHighlights: string[];
  metrics: string;
}
