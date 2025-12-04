import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '../common/Button';
import { Card, CardContent } from '../common/Card';
import { clsx } from 'clsx';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for element to highlight
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Llatria!',
    description: 'Let\'s take a quick tour of the main features. You can skip this anytime.',
  },
  {
    id: 'inventory',
    title: 'Inventory Management',
    description: 'View and manage all your inventory items here. Use the search and filters to find specific items.',
    target: '[data-tour="inventory"]',
  },
  {
    id: 'create',
    title: 'Create Listings',
    description: 'Click "Generate Listing" to create a new listing. Upload photos and let AI help you fill in the details.',
    target: '[data-tour="create-listing"]',
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Connect your platforms and manage your account settings from here.',
    target: '[data-tour="settings"]',
  },
];

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const step = tourSteps[currentStep];
    if (step.target) {
      const element = document.querySelector(step.target) as HTMLElement;
      if (element) {
        setHighlightedElement(element);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setHighlightedElement(null);
      }
    } else {
      setHighlightedElement(null);
    }
  }, [currentStep, isOpen]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('llatria-onboarding-completed', 'true');
    setCurrentStep(0);
    setHighlightedElement(null);
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isOpen) return null;

  const step = tourSteps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-[9998]"
        onClick={handleSkip}
      />

      {/* Highlight overlay */}
      {highlightedElement && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: highlightedElement.offsetTop - 4,
            left: highlightedElement.offsetLeft - 4,
            width: highlightedElement.offsetWidth + 8,
            height: highlightedElement.offsetHeight + 8,
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
          }}
        />
      )}

      {/* Tour Card */}
      <Card className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[10000] w-full max-w-md mx-4 shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
            <button
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close tour"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={clsx(
                    'h-2 rounded-full transition-all',
                    index === currentStep
                      ? 'w-8 bg-primary'
                      : 'w-2 bg-muted'
                  )}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" size="sm" onClick={handlePrevious}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
              )}
              <Button size="sm" onClick={handleNext}>
                {currentStep === tourSteps.length - 1 ? 'Get Started' : 'Next'}
                {currentStep < tourSteps.length - 1 && (
                  <ArrowRight className="h-4 w-4 ml-1" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};



