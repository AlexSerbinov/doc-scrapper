"use client";

import { 
  Link, 
  Bot, 
  Database, 
  MessageSquare 
} from "lucide-react";
import { useTranslationSafe } from "../../hooks/useTranslationSafe";

interface StepCardProps {
  icon: React.ReactNode;
  step: number;
  title: string;
  description: string;
}

function StepCard({ icon, step, title, description }: StepCardProps) {
  return (
    <div className="text-center">
      <div className="relative inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6">
        <div className="text-white">
          {icon}
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-700 text-blue-400 rounded-full flex items-center justify-center text-sm font-bold">
          {step}
        </div>
      </div>
      <h3 className="text-xl font-semibold text-slate-100 mb-3">
        {title}
      </h3>
      <p className="text-slate-300 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export function HowItWorksSection() {
  const { t } = useTranslationSafe();
  
  const steps = [
    {
      icon: <Link className="w-8 h-8" />,
      title: t('howItWorks.steps.insertUrl.title'),
      description: t('howItWorks.steps.insertUrl.description')
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: t('howItWorks.steps.aiProcessing.title'),
      description: t('howItWorks.steps.aiProcessing.description')
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: t('howItWorks.steps.knowledgeIndexing.title'),
      description: t('howItWorks.steps.knowledgeIndexing.description')
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: t('howItWorks.steps.chatWithAI.title'),
      description: t('howItWorks.steps.chatWithAI.description')
    }
  ];

  return (
    <section id="how-it-works" className="bg-slate-950 py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок секції */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-100 mb-4">
            {t('howItWorks.title')}
          </h2>
        </div>

        {/* Сітка з кроків */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <StepCard
              key={index}
              icon={step.icon}
              step={index + 1}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 