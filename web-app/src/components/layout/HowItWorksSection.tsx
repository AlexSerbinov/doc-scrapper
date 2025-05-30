"use client";

import { 
  LinkIcon, 
  ScanLine, 
  Brain, 
  MessageSquare,
  ArrowRight 
} from "lucide-react";

interface StepProps {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  isLast?: boolean;
}

function Step({ number, icon, title, description, isLast = false }: StepProps) {
  return (
    <div className="flex flex-col items-center text-center relative">
      {/* Номер кроку */}
      <div className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white text-xl font-bold rounded-full mb-4 relative z-10">
        {number}
      </div>
      
      {/* Іконка */}
      <div className="text-blue-400 mb-4">
        {icon}
      </div>
      
      {/* Заголовок */}
      <h3 className="text-xl font-semibold text-slate-100 mb-3">
        {title}
      </h3>
      
      {/* Опис */}
      <p className="text-slate-300 leading-relaxed max-w-sm">
        {description}
      </p>
      
      {/* Стрілка до наступного кроку */}
      {!isLast && (
        <div className="hidden lg:block absolute top-8 left-full transform translate-x-8 text-slate-600">
          <ArrowRight className="h-8 w-8" />
        </div>
      )}
    </div>
  );
}

export function HowItWorksSection() {
  const steps = [
    {
      icon: <LinkIcon className="h-10 w-10" />,
      title: "Надайте посилання",
      description: "Просто вставте URL вашої публічної документації в форму. Ми підтримуємо всі популярні платформи."
    },
    {
      icon: <ScanLine className="h-10 w-10" />,
      title: "Автоматичне сканування",
      description: "Наша система автоматично знаходить і скачує всі сторінки вашої документації, зберігаючи структуру."
    },
    {
      icon: <Brain className="h-10 w-10" />,
      title: "AI обробка",
      description: "Передові алгоритми штучного інтелекту аналізують контент і створюють розумну базу знань."
    },
    {
      icon: <MessageSquare className="h-10 w-10" />,
      title: "Готово до використання",
      description: "Отримайте інтерактивного AI-помічника, який може відповідати на будь-які запитання про вашу документацію."
    }
  ];

  return (
    <section className="py-20 bg-slate-800/30">
      <div className="container mx-auto px-4">
        {/* Заголовок секції */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-50 mb-6">
            Як це працює?
          </h2>
          <p className="text-xl text-slate-300">
            Всього чотири простих кроки до розумного AI-помічника для вашої документації
          </p>
        </div>

        {/* Кроки */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8 relative">
          {steps.map((step, index) => (
            <Step
              key={index}
              number={index + 1}
              icon={step.icon}
              title={step.title}
              description={step.description}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <p className="text-lg text-slate-300 mb-6">
            Готові спробувати? Почніть безкоштовний тріал прямо зараз!
          </p>
          <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors inline-flex items-center space-x-2">
            <span>Розпочати безкоштовний тріал</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
} 