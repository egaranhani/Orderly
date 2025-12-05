import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');

  const mockDailyReport = {
    date: '2024-01-15',
    prioritiesByQuadrant: {
      Q1: 5,
      Q2: 8,
      Q3: 2,
      Q4: 1,
    },
    openTasks: 12,
    completedTasksToday: 3,
  };

  const mockWeeklyReport = {
    weekStart: '2024-01-08',
    weekEnd: '2024-01-14',
    completedTasksByClassification: {
      do: 8,
      schedule: 5,
      delegate: 2,
      eliminate: 1,
    },
    actionsByOrigin: {
      manual: 10,
      ai: 6,
    },
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <p className="text-muted-foreground mt-1">
          Visualize métricas e estatísticas do seu trabalho
        </p>
      </div>

      <div className="mb-6 flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('daily')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'daily'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Relatório Diário
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'weekly'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Relatório Semanal
        </button>
      </div>

      {activeTab === 'daily' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Prioridades Q1
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {mockDailyReport.prioritiesByQuadrant.Q1}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Prioridades Q2
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {mockDailyReport.prioritiesByQuadrant.Q2}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Prioridades Q3
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {mockDailyReport.prioritiesByQuadrant.Q3}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Prioridades Q4
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {mockDailyReport.prioritiesByQuadrant.Q4}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Tarefas Abertas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {mockDailyReport.openTasks}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Tarefas Concluídas Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {mockDailyReport.completedTasksToday}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'weekly' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tarefas Concluídas por Classificação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Fazer</span>
                  <span className="text-2xl font-bold">
                    {mockWeeklyReport.completedTasksByClassification.do}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Agendar</span>
                  <span className="text-2xl font-bold">
                    {mockWeeklyReport.completedTasksByClassification.schedule}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delegar</span>
                  <span className="text-2xl font-bold">
                    {mockWeeklyReport.completedTasksByClassification.delegate}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Eliminar</span>
                  <span className="text-2xl font-bold">
                    {mockWeeklyReport.completedTasksByClassification.eliminate}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações por Origem</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Manual</span>
                  <span className="text-2xl font-bold">
                    {mockWeeklyReport.actionsByOrigin.manual}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>IA</span>
                  <span className="text-2xl font-bold">
                    {mockWeeklyReport.actionsByOrigin.ai}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
};
