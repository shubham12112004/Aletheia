import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BrainCircuit, LineChart, Sparkles, X, Activity, BookMarked } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Step = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  image?: string; // Optional visual
};

const STEPS: Step[] = [
  {
    id: 'welcome',
    title: 'Welcome to Aletheia',
    description: 'Your new institutional-grade AI research terminal. Let’s take a quick tour of your new workspace.',
    icon: <BrainCircuit className="h-10 w-10 text-emerald-500" />
  },
  {
    id: 'research',
    title: 'AI-Driven Research',
    description: 'Enter any ticker in the hero search bar. Our agent swarms will instantly analyze live market data, SEC filings, and news to generate a deterministic verdict.',
    icon: <Sparkles className="h-10 w-10 text-teal-400" />
  },
  {
    id: 'portfolio',
    title: 'Track Your Assets',
    description: 'Monitor your portfolio allocation, keep an eye on trending assets, and maintain a custom watchlist all from a single pane of glass.',
    icon: <LineChart className="h-10 w-10 text-blue-400" />
  },
  {
    id: 'chat',
    title: 'Interrogate the Data',
    description: 'After generating a report, click "Interrogate Research Agent" to ask specific questions about the company’s financials or the AI’s reasoning.',
    icon: <Activity className="h-10 w-10 text-indigo-400" />
  }
];

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasCompleted = localStorage.getItem('aletheia.hasCompletedOnboarding');
    if (!hasCompleted) {
      // Small delay to let the dashboard render first
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('aletheia.hasCompletedOnboarding', 'true');
    setIsOpen(false);
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  if (!isOpen) return null;

  const step = STEPS[currentStep];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 bg-[#09090b] shadow-2xl shadow-emerald-500/10"
          >
            {/* Top glowing edge */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

            <button
              onClick={handleClose}
              className="absolute right-6 top-6 rounded-full bg-white/5 p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-8 sm:p-12 text-center flex flex-col items-center">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center"
                >
                  <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-white/5 to-white/10 shadow-inner ring-1 ring-white/10">
                    {step.icon}
                  </div>
                  <h2 className="mb-4 text-3xl font-black text-white tracking-tight">{step.title}</h2>
                  <p className="text-base text-zinc-400 font-medium leading-relaxed max-w-sm">
                    {step.description}
                  </p>
                </motion.div>
              </AnimatePresence>

            </div>

            {/* Footer */}
            <div className="bg-white/[0.02] border-t border-white/5 p-6 flex items-center justify-between">
              {/* Pagination Dots */}
              <div className="flex gap-2 pl-4">
                {STEPS.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      idx === currentStep ? 'w-6 bg-emerald-500' : 'w-1.5 bg-white/20'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className="text-zinc-400 hover:text-white hover:bg-white/5 font-bold"
                >
                  Skip Tour
                </Button>
                <Button
                  onClick={nextStep}
                  className="bg-emerald-500 text-white hover:bg-emerald-400 font-bold px-6 shadow-lg shadow-emerald-500/20"
                >
                  {currentStep === STEPS.length - 1 ? 'Get Started' : 'Next'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
