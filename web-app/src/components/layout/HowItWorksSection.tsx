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
        <div className="hidden lg:block absolute top-8 left-full transform -translate-y-1/2 -translate-x-8">
          <ArrowRight className="w-8 h-8 text-slate-600" />
        </div>
      )}
    </div>
  );
}

export function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      icon: <LinkIcon className="w-10 h-10" />,
      title: "Вставте URL",
      description: "Надайте посилання на вашу публічну документацію. Підтримуємо GitBook, Notion, Confluence та інші платформи."
    },
    {
      number: 2,
      icon: <ScanLine className="w-10 h-10" />,
      title: "AI Обробка",
      description: "Наша система автоматично збирає та індексує контент, створюючи оптимізовану базу знань для AI."
    },
    {
      number: 3,
      icon: <Brain className="w-10 h-10" />,
      title: "Індексація Знань",
      description: "Контент перетворюється на векторну базу даних, яка дозволяє AI швидко знаходити релевантну інформацію."
    },
    {
      number: 4,
      icon: <MessageSquare className="w-10 h-10" />,
      title: "Спілкуйтесь з AI",
      description: "Отримайте персональний доступ до AI-асистента та почніть ставити запитання природною мовою!"
    }
  ];

  return (
    <section id="how-it-works" className="bg-slate-900 py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок секції */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-100 mb-4">
            Як це працює
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Від URL до AI-помічника за лічені хвилини
          </p>
        </div>

        {/* Кроки */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Step
              key={index}
              number={step.number}
              icon={step.icon}
              title={step.title}
              description={step.description}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>

        {/* Заклик до дії */}
        <div className="text-center mt-16">
          <p className="text-slate-400 mb-6">
            Готові спробувати? Це займе менше 5 хвилин.
          </p>
          <button
            onClick={() => {
              const heroSection = document.querySelector('section');
              heroSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-md transition-colors"
          >
            Почати Зараз
          </button>
        </div>
      </div>
    </section>
  );
} 