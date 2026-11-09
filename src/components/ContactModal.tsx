import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, CheckCircle2, Sparkles, Terminal, Github, Linkedin, ArrowUpRight, MessageCircle, Mail } from 'lucide-react';
import { soundManager } from '../lib/soundEffects';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROJECT_TYPES = [
  'Spatial WebGL Canvas',
  'Real-Time Telemetry',
  'Spring Motion Systems',
  'Full-Stack Architecture',
  'Executive Advisory',
];

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [selectedType, setSelectedType] = useState('Spatial WebGL Canvas');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow || '';
      document.body.style.paddingRight = originalPaddingRight || '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick(1200);
    setIsSubmitted(true);
    
    // Launch default mail client addressed to avisifeakor@gmail.com
    const subject = encodeURIComponent(`[${selectedType}] Project Inquiry from ${name || 'Prospective Client'}`);
    const body = encodeURIComponent(
      `Hi Avis,\n\nI am contacting you regarding ${selectedType}.\n\nMessage:\n${message}\n\nClient Name: ${name}\nClient Email: ${email}\n`
    );
    window.location.href = `mailto:avisifeakor@gmail.com?subject=${subject}&body=${body}`;

    setTimeout(() => {
      setIsSubmitted(false);
      setName('');
      setEmail('');
      setMessage('');
      onClose();
    }, 2800);
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden overscroll-contain select-none"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {/* Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer pointer-events-auto"
        />

        {/* Modal Sheet Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', stiffness: 340, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto overscroll-contain rounded-3xl bg-[#090D16] text-white border border-neutral-800 p-8 sm:p-10 shadow-2xl my-auto"
          id="contact-modal-sheet"
        >
          {/* Close button */}
          <button
            data-cursor="interact"
            data-cursor-text="CLOSE"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="absolute top-6 right-6 p-2 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 transition-colors"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Availability Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono uppercase tracking-wider mb-5">
            <span>AVAILABLE FOR SELECT COMMISSIONS</span>
          </div>

          <h3 className="text-3xl sm:text-4xl font-serif text-white font-bold">
            Let's engineer together.
          </h3>
          <p className="mt-2 text-sm text-neutral-400 leading-relaxed font-sans">
            Tell me about your product, timeline, or technical challenges. I respond to serious inquiries within 24 hours.
          </p>

          {/* Direct Professional Profiles */}
          <div className="mt-4 pt-3 border-t border-neutral-800/80 flex flex-wrap items-center gap-2.5">
            <span className="text-[11px] font-mono text-neutral-400">Direct Contacts:</span>
            <a
              href="mailto:avisifeakor@gmail.com"
              onClick={() => soundManager.playClick()}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-500/50 hover:border-indigo-400 text-indigo-300 hover:text-white text-xs font-mono transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>avisifeakor@gmail.com</span>
              <ArrowUpRight className="w-3 h-3 opacity-60" />
            </a>
            <a
              href="https://wa.me/2348150675245"
              target="_blank"
              rel="noreferrer"
              onClick={() => soundManager.playClick()}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-600/50 hover:border-emerald-400 text-emerald-300 hover:text-white text-xs font-mono transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp: +234 815 067 5245</span>
              <ArrowUpRight className="w-3 h-3 opacity-60" />
            </a>
            <a
              href="https://github.com/avisifeakor"
              target="_blank"
              rel="noreferrer"
              onClick={() => soundManager.playClick()}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-700/80 hover:border-neutral-500 text-neutral-200 hover:text-white text-xs font-mono transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
              <ArrowUpRight className="w-3 h-3 opacity-60" />
            </a>
            <a
              href="https://linkedin.com/in/avisifeakor"
              target="_blank"
              rel="noreferrer"
              onClick={() => soundManager.playClick()}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-700/80 hover:border-neutral-500 text-neutral-200 hover:text-white text-xs font-mono transition-colors"
            >
              <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
              <span>LinkedIn</span>
              <ArrowUpRight className="w-3 h-3 opacity-60" />
            </a>
          </div>

          {isSubmitted ? (
            <div className="py-14 text-center flex flex-col items-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3 animate-bounce" />
              <h4 className="text-2xl font-serif font-semibold text-white">Inquiry Received</h4>
              <p className="text-xs font-mono text-neutral-400 mt-2 max-w-xs leading-relaxed">
                Thank you. Your message has been prepared for <span className="text-indigo-300">avisifeakor@gmail.com</span>. Expect a prompt response within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              {/* Project Type Pills */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2">
                  DISCIPLINE / FOCUS
                </label>
                <div className="flex flex-wrap gap-2">
                  {PROJECT_TYPES.map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => {
                        soundManager.playClick(800);
                        setSelectedType(t);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                        selectedType === t
                          ? 'bg-white text-neutral-950 font-semibold shadow-sm'
                          : 'bg-neutral-800/80 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                  YOUR NAME & ORGANIZATION
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Engineering Lead / Partner"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-neutral-400 focus:outline-none text-sm text-white placeholder:text-neutral-600 font-sans transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                  DIRECT EMAIL
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@enterprise.com"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-neutral-400 focus:outline-none text-sm text-white placeholder:text-neutral-600 font-sans transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                  TECHNICAL REQUIREMENTS & TIMELINE
                </label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="A few lines regarding the engineering scope, target launch date, and budget expectations"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-neutral-400 focus:outline-none text-sm text-white placeholder:text-neutral-600 font-sans transition-colors resize-none"
                />
              </div>

              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  data-cursor="open"
                  data-cursor-text="TRANSMIT"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-white hover:bg-neutral-100 text-neutral-950 font-mono text-xs font-semibold uppercase tracking-wider active:scale-[0.98] transition-all shadow-xl shadow-black/30"
                  id="contact-submit-button"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>TRANSMIT INQUIRY</span>
                </button>

                <div className="flex items-center gap-3 my-1">
                  <div className="h-px bg-neutral-800 flex-1" />
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">or instant chat</span>
                  <div className="h-px bg-neutral-800 flex-1" />
                </div>

                <a
                  href="https://wa.me/2348150675245"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => soundManager.playClick()}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 font-mono text-xs font-medium uppercase tracking-wider active:scale-[0.98] transition-all"
                  id="contact-whatsapp-direct"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Direct WhatsApp: +234 815 067 5245</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
                </a>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
