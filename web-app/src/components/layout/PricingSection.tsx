"use client";

// Temporarily disabled imports - will be needed when re-enabling pricing
// import React from 'react';
// import { Check, Star, Zap } from 'lucide-react';
// import { useTranslation } from '../../hooks/useTranslation';

// Temporarily disabled interface and component - will be needed when re-enabling pricing
/*
interface PricingCardProps {
  title: string;
  price?: string;
  period?: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonAction: () => void;
  isPopular?: boolean;
  isFree?: boolean;
}

function PricingCard({ 
  title, 
  price, 
  period, 
  description, 
  features, 
  buttonText, 
  buttonAction, 
  isPopular = false,
  isFree = false 
}: PricingCardProps) {
  const { t } = useTranslationSafe();
  
  return (
    <div className={`
      relative bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 shadow-lg
      ${isPopular ? 'border-2 border-blue-500 ring-2 ring-blue-500/20' : 'border border-slate-700'}
      ${isFree ? 'border-green-500/50' : ''}
      hover:bg-slate-800/70 transition-all duration-300
    `}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <Star className="w-4 h-4" />
            {t('pricing.mostPopular')}
          </div>
        </div>
      )}
      
      {isFree && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            {t('pricing.free')}
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-semibold text-slate-100 mb-2">
          {title}
        </h3>
        
        {price && (
          <div className="mb-2">
            <span className="text-4xl font-bold text-slate-100">{price}</span>
            {period && <span className="text-slate-400 ml-2">{period}</span>}
          </div>
        )}
        
        <p className="text-slate-300">
          {description}
        </p>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <span className="text-slate-300">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={buttonAction}
        className={`
          w-full py-3 px-6 rounded-md font-semibold transition-colors
          ${isPopular 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : isFree
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-slate-700 hover:bg-slate-600 text-slate-100'
          }
        `}
      >
        {buttonText}
      </button>
    </div>
  );
}
*/

export function PricingSection() {
  // Temporarily disabled pricing section functionality
  // TODO: Re-enable when implementing subscription system
  // All translations are already prepared:
  // - t('pricing.mostPopular') for "Найпопулярніший"
  // - t('pricing.free') for "Безкоштовно"
  return null;
} 