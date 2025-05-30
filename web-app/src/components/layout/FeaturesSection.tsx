"use client";

import { 
  Zap, 
  Search, 
  MessageSquare, 
  Shield, 
  Globe, 
  Brain 
} from "lucide-react";

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
  const features = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Миттєва активація",
      description: "Запустіть AI-помічника для вашої документації всього за кілька хвилин. Просто введіть URL - ми зробимо решту."
    },
    {
      icon: <Search className="h-8 w-8" />,
      title: "Розумний пошук",
      description: "Не просто ключові слова - справжнє розуміння контексту. Отримуйте точні відповіді, навіть на складні запити."
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Природна розмова",
      description: "Спілкуйтеся з вашою документацією як з колегою. Ставте уточнюючі запитання та отримуйте детальні відповіді."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Безпека даних",
      description: "Ваша документація залишається безпечною. Ми не зберігаємо конфіденційну інформацію та дотримуємося найвищих стандартів безпеки."
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Підтримка всіх форматів",
      description: "Markdown, HTML, Confluence, Gitiles, Sphinx - ми підтримуємо всі популярні формати документації."
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "Постійне навчання",
      description: "AI покращується з кожним запитом, краще розуміючи специфіку вашої документації та проєкту."
    }
  ];

  return (
    <section id="features" className="py-20 bg-slate-900">
      <div className="container mx-auto px-4">
        {/* Заголовок секції */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-50 mb-6">
            Чому обирають Doc Scrapper AI?
          </h2>
          <p className="text-xl text-slate-300">
            Перетворіть статичну документацію на інтерактивного AI-помічника, 
            який знає відповіді на всі ваші запитання.
          </p>
        </div>

        {/* Сітка з карточками можливостей */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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