import { Variants } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins safely in browser
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * FRAMER MOTION VARIANT OBJECTS
 * Handcrafted bezier curves for elite creative development aesthetics
 */

export const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    y: 18,
    filter: 'blur(4px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1], // Custom snappy cubic bezier
      when: 'beforeChildren',
      staggerChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    y: -12,
    filter: 'blur(2px)',
    transition: {
      duration: 0.35,
      ease: [0.7, 0, 0.84, 0],
    },
  },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 28,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const kineticTextWordVariants: Variants = {
  initial: {
    opacity: 0,
    y: 35,
    filter: 'blur(4px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -35,
    filter: 'blur(4px)',
    transition: {
      duration: 0.35,
      ease: [0.7, 0, 0.84, 0],
    },
  },
};

export const magneticPillVariants: Variants = {
  initial: { scale: 0.96, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 380,
      damping: 26,
    },
  },
  hover: {
    scale: 1.03,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 20,
    },
  },
  tap: { scale: 0.97 },
};

export const projectCardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 35,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  hover: {
    y: -8,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

export const modalBackdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.25, ease: 'easeIn' },
  },
};

export const modalContentVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.94,
    y: 30,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 28,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 20,
    transition: {
      duration: 0.25,
      ease: 'easeInOut',
    },
  },
};

export const coverflowCardVariants: Variants = {
  center: {
    scale: 1,
    x: 0,
    zIndex: 10,
    opacity: 1,
    rotateY: 0,
    filter: 'brightness(1)',
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 26,
    },
  },
  left: (offset: number) => ({
    scale: Math.max(0.72, 1 - Math.abs(offset) * 0.14),
    x: offset * 220,
    zIndex: 10 - Math.abs(offset),
    opacity: Math.max(0.4, 1 - Math.abs(offset) * 0.28),
    rotateY: 28,
    filter: 'brightness(0.7)',
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 26,
    },
  }),
  right: (offset: number) => ({
    scale: Math.max(0.72, 1 - Math.abs(offset) * 0.14),
    x: offset * 220,
    zIndex: 10 - Math.abs(offset),
    opacity: Math.max(0.4, 1 - Math.abs(offset) * 0.28),
    rotateY: -28,
    filter: 'brightness(0.7)',
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 26,
    },
  }),
};

export const accordionVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
      opacity: { duration: 0.25 },
    },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
      opacity: { duration: 0.3, delay: 0.1 },
    },
  },
};

/**
 * GSAP SCROLLTRIGGER SEQUENCE HELPERS
 * Cinematic scroll-linked flight path and parallax orchestrations
 */

export function createScrollFlightPathTimeline(
  triggerElement: HTMLElement | string,
  airplaneElement: HTMLElement | string,
  options?: { start?: string; end?: string; scrub?: number | boolean }
) {
  if (typeof window === 'undefined') return null;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: triggerElement,
      start: options?.start || 'top top',
      end: options?.end || 'bottom bottom',
      scrub: options?.scrub !== undefined ? options?.scrub : 1.2,
    },
  });

  tl.to(airplaneElement, {
    x: '+=380',
    y: '+=650',
    rotation: 65,
    ease: 'power1.inOut',
  }).to(
    airplaneElement,
    {
      x: '-=240',
      y: '+=550',
      rotation: -35,
      ease: 'power1.inOut',
    },
    '>-0.1'
  );

  return tl;
}

export function createParallaxScrollTrigger(
  target: HTMLElement | string,
  yDistance: number = 80,
  trigger: HTMLElement | string = target
) {
  if (typeof window === 'undefined') return null;

  return gsap.to(target, {
    y: yDistance,
    ease: 'none',
    scrollTrigger: {
      trigger: trigger,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  });
}
