"use client";

import { 
  Zap, 
  Search, 
  MessageSquare, 
  Shield, 
  Globe, 
  Brain 
} from "lucide-react";
import { useTranslationSafe } from "../../hooks/useTranslationSafe";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 hover:bg-slate-800/70 transition-colors">
      <div className="text-blue-400 mb-4">
        {icon}
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

export function FeaturesSection() {
  const { t } = useTranslationSafe();
  const features = [
    {
      icon: <Zap className="w-10 h-10" />,
      title: t('features.instantReadiness.title'),
      description: t('features.instantReadiness.description')
    },
    {
      icon: <Search className="w-10 h-10" />,
      title: t('features.accurateAnswers.title'),
      description: t('features.accurateAnswers.description')
    },
    {
      icon: <MessageSquare className="w-10 h-10" />,
      title: t('features.userFriendly.title'),
      description: t('features.userFriendly.description')
    },
    {
      icon: <Shield className="w-10 h-10" />,
      title: t('features.productivity.title'),
      description: t('features.productivity.description')
    },
    {
      icon: <Globe className="w-10 h-10" />,
      title: t('features.universalCompatibility.title'),
      description: t('features.universalCompatibility.description')
    },
    {
      icon: <Brain className="w-10 h-10" />,
      title: t('features.smartLearning.title'),
      description: t('features.smartLearning.description')
    }
  ];

  return (
    <section id="features" className="bg-slate-900 py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок секції */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-100 mb-4">
            {t('features.title')}
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>

        {/* Сітка з карток */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 