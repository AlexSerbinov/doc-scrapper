"use client";

import { Check, Zap, Star } from "lucide-react";

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
            Найпопулярніший
          </div>
        </div>
      )}
      
      {isFree && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Безкоштовно
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

export function PricingSection() {
  const handleTrialClick = () => {
    // Прокрутити до Hero секції
    const heroSection = document.querySelector('section');
    heroSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleProClick = () => {
    // TODO: Додати обробку вибору Pro плану
    console.log("Pro план обрано");
  };

  const handleEnterpriseClick = () => {
    // TODO: Додати обробку Enterprise
    console.log("Enterprise план обрано");
  };

  // return (
  //   <section id="pricing" className="bg-slate-900 py-16 sm:py-20">
  //     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  //       {/* Заголовок секції */}
  //       <div className="text-center mb-12 sm:mb-16">
  //         <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-100 mb-4">
  //           Прозорі Тарифи для{" "}
  //           <span className="text-blue-400">Ваших Потреб</span>
  //         </h2>
  //         <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
  //           Почніть безкоштовно та масштабуйтеся за потребою
  //         </p>
  //       </div>

  //       {/* Картки тарифів */}
  //       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
  //         {/* Безкоштовний Тріал */}
  //         <PricingCard
  //           title="Безкоштовний Тріал"
  //           description="Ідеально для тестування на вашій документації"
  //           features={[
  //             "7 днів повного доступу",
  //             "100 AI-запитів",
  //             "1 сайт документації",
  //             "Посилання на оригінальні джерела",
  //             "Базова аналітика",
  //             "Кредитна картка не потрібна"
  //           ]}
  //           buttonText="Почати Безкоштовно"
  //           buttonAction={handleTrialClick}
  //           isFree={true}
  //         />

  //         {/* Pro План */}
  //         <PricingCard
  //           title="Pro"
  //           price="$29"
  //           period="/ місяць"
  //           description="Для команд, які активно працюють з документацією"
  //           features={[
  //             "Все з безкоштовного тріалу",
  //             "5,000 AI-запитів/місяць",
  //             "До 5 сайтів документації",
  //             "Пріоритетна обробка",
  //             "Розширена аналітика",
  //             "Історія всіх чатів",
  //             "Email підтримка"
  //           ]}
  //           buttonText="Обрати Pro"
  //           buttonAction={handleProClick}
  //           isPopular={true}
  //         />

  //         {/* Enterprise План */}
  //         <PricingCard
  //           title="Enterprise"
  //           price="$99"
  //           period="/ місяць"
  //           description="Для великих організацій з власними вимогами"
  //           features={[
  //             "Все з Pro плану",
  //             "Необмежена кількість запитів",
  //             "Необмежена кількість сайтів",
  //             "Власні AI моделі",
  //             "SSO інтеграція",
  //             "Белі мітки (White-label)",
  //             "Приоритетна підтримка 24/7",
  //             "Власний менеджер"
  //           ]}
  //           buttonText="Зв'язатися з нами"
  //           buttonAction={handleEnterpriseClick}
  //         />
  //       </div>

  //       {/* Додаткова інформація */}
  //       <div className="mt-16 text-center">
  //         <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-8 border border-slate-700">
  //           <div className="flex items-center justify-center gap-2 mb-4">
  //             <Zap className="w-6 h-6 text-yellow-400" />
  //             <h3 className="text-xl font-semibold text-slate-100">
  //               Швидкий старт гарантований
  //             </h3>
  //           </div>
  //           <p className="text-slate-300 max-w-2xl mx-auto">
  //             Всі плани включають миттєву активацію та підтримку. 
  //             Змінюйте план будь-коли без додаткових комісій.
  //           </p>
  //         </div>
  //       </div>
  //     </div>
  //   </section>
  // );
} 