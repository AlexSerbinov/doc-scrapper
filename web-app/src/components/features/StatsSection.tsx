'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { RAGStats } from '@/lib/types';
import { FileText, Database, Clock, TrendingUp } from 'lucide-react';

export function StatsSection() {
  const [stats, setStats] = useState<RAGStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: 'Документів',
      value: stats.totalDocuments.toLocaleString(),
      icon: FileText,
      description: 'Індексовано сторінок',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Фрагментів',
      value: stats.totalChunks.toLocaleString(),
      icon: Database,
      description: 'Векторних сегментів',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Швидкість',
      value: `${(stats.averageResponseTime / 1000).toFixed(1)}с`,
      icon: Clock,
      description: 'Середній час відповіді',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Популярних',
      value: stats.popularQueries.length,
      icon: TrendingUp,
      description: 'Типів запитів',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Статистика системи
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Наша RAG система обробила велику кількість технічної документації 
            для надання вам найточніших відповідей
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className={`w-12 h-12 ${stat.bgColor} ${stat.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                  <stat.icon size={24} />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  {stat.title}
                </div>
                <div className="text-xs text-gray-500">
                  {stat.description}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Popular Queries */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Популярні запити</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {stats.popularQueries.map((query, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 border"
                >
                  💬 {query}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
} 