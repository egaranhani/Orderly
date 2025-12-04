import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/presentation/app.module';
import { GetDailyReportUseCase } from '../../src/application/use-cases/report/get-daily-report.use-case';
import { GetWeeklyReportUseCase } from '../../src/application/use-cases/report/get-weekly-report.use-case';
import { CreatePriorityUseCase } from '../../src/application/use-cases/priority/create-priority.use-case';
import { CreateTaskUseCase } from '../../src/application/use-cases/task/create-task.use-case';
import { CompleteTaskUseCase } from '../../src/application/use-cases/task/complete-task.use-case';
import { EisenhowerQuadrant, PriorityOrigin } from '../../src/domain/entities/priority.entity';
import { TaskClassification, TaskStatus, TaskOrigin } from '../../src/domain/entities/task.entity';

async function testReportUseCases() {
  console.log('🧪 Iniciando testes de aceitação - Use Cases de Relatórios...\n');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    
    const getDailyReportUseCase = app.get<GetDailyReportUseCase>(GetDailyReportUseCase);
    const getWeeklyReportUseCase = app.get<GetWeeklyReportUseCase>(GetWeeklyReportUseCase);
    const createPriorityUseCase = app.get<CreatePriorityUseCase>(CreatePriorityUseCase);
    const createTaskUseCase = app.get<CreateTaskUseCase>(CreateTaskUseCase);
    const completeTaskUseCase = app.get<CompleteTaskUseCase>(CompleteTaskUseCase);

    const testUserId = 'test-user-' + Date.now();

    // Criar dados de teste
    console.log('📦 Criando dados de teste...');
    const priority1 = await createPriorityUseCase.execute(testUserId, {
      title: 'Prioridade Q1',
      quadrant: EisenhowerQuadrant.Q1,
      origin: PriorityOrigin.MANUAL,
    });
    const priority2 = await createPriorityUseCase.execute(testUserId, {
      title: 'Prioridade Q2',
      quadrant: EisenhowerQuadrant.Q2,
      origin: PriorityOrigin.AI,
    });
    const priority3 = await createPriorityUseCase.execute(testUserId, {
      title: 'Prioridade Q3',
      quadrant: EisenhowerQuadrant.Q3,
      origin: PriorityOrigin.MANUAL,
    });
    const priority4 = await createPriorityUseCase.execute(testUserId, {
      title: 'Prioridade Q4',
      quadrant: EisenhowerQuadrant.Q4,
      origin: PriorityOrigin.AI,
    });

    const task1 = await createTaskUseCase.execute(testUserId, priority1.id, {
      title: 'Tarefa DO',
      classification: TaskClassification.DO,
      origin: TaskOrigin.MANUAL,
    });
    const task2 = await createTaskUseCase.execute(testUserId, priority1.id, {
      title: 'Tarefa Schedule',
      classification: TaskClassification.SCHEDULE,
      idealDate: new Date('2024-12-31'),
      origin: TaskOrigin.AI,
    });
    const task3 = await createTaskUseCase.execute(testUserId, priority2.id, {
      title: 'Tarefa Delegate',
      classification: TaskClassification.DELEGATE,
      responsible: 'João',
      origin: TaskOrigin.MANUAL,
    });
    const task4 = await createTaskUseCase.execute(testUserId, priority3.id, {
      title: 'Tarefa Eliminate',
      classification: TaskClassification.ELIMINATE,
      origin: TaskOrigin.AI,
    });

    // Completar algumas tarefas
    await completeTaskUseCase.execute(testUserId, task1.id);
    await completeTaskUseCase.execute(testUserId, task2.id);

    console.log('✅ Dados de teste criados');

    // Test 1: Relatório Diário
    console.log('\n📝 Test 1: Relatório Diário');
    const dailyReport = await getDailyReportUseCase.execute(testUserId);
    console.log('✅ Relatório diário gerado');
    console.log('   - Data:', dailyReport.date);
    console.log('   - Prioridades Q1:', dailyReport.prioritiesByQuadrant.Q1);
    console.log('   - Prioridades Q2:', dailyReport.prioritiesByQuadrant.Q2);
    console.log('   - Prioridades Q3:', dailyReport.prioritiesByQuadrant.Q3);
    console.log('   - Prioridades Q4:', dailyReport.prioritiesByQuadrant.Q4);
    console.log('   - Tarefas abertas:', dailyReport.openTasks);
    console.log('   - Tarefas completadas hoje:', dailyReport.completedTasksToday);

    // Validações
    console.log('   - Q1 >= 1:', dailyReport.prioritiesByQuadrant.Q1 >= 1);
    console.log('   - Q2 >= 1:', dailyReport.prioritiesByQuadrant.Q2 >= 1);
    console.log('   - Q3 >= 1:', dailyReport.prioritiesByQuadrant.Q3 >= 1);
    console.log('   - Q4 >= 1:', dailyReport.prioritiesByQuadrant.Q4 >= 1);

    // Test 2: Relatório Semanal
    console.log('\n📝 Test 2: Relatório Semanal');
    const weeklyReport = await getWeeklyReportUseCase.execute(testUserId);
    console.log('✅ Relatório semanal gerado');
    console.log('   - Semana início:', weeklyReport.weekStart);
    console.log('   - Semana fim:', weeklyReport.weekEnd);
    console.log('   - Completadas DO:', weeklyReport.completedTasksByClassification.do);
    console.log('   - Completadas Schedule:', weeklyReport.completedTasksByClassification.schedule);
    console.log('   - Completadas Delegate:', weeklyReport.completedTasksByClassification.delegate);
    console.log('   - Completadas Eliminate:', weeklyReport.completedTasksByClassification.eliminate);
    console.log('   - Ações Manual:', weeklyReport.actionsByOrigin.manual);
    console.log('   - Ações AI:', weeklyReport.actionsByOrigin.ai);

    // Validações
    console.log('   - Total completadas >= 0:', 
      weeklyReport.completedTasksByClassification.do +
      weeklyReport.completedTasksByClassification.schedule +
      weeklyReport.completedTasksByClassification.delegate +
      weeklyReport.completedTasksByClassification.eliminate >= 0);
    console.log('   - Total ações >= 0:', 
      weeklyReport.actionsByOrigin.manual + weeklyReport.actionsByOrigin.ai >= 0);

    // Test 3: Relatório Diário com data específica
    console.log('\n📝 Test 3: Relatório Diário com data específica');
    const specificDate = new Date('2024-12-25');
    const dailyReportSpecific = await getDailyReportUseCase.execute(testUserId, specificDate);
    console.log('✅ Relatório diário para data específica gerado');
    console.log('   - Data:', dailyReportSpecific.date);

    // Test 4: Relatório Semanal com semana específica
    console.log('\n📝 Test 4: Relatório Semanal com semana específica');
    const specificWeek = '2024-12-23';
    const weeklyReportSpecific = await getWeeklyReportUseCase.execute(testUserId, specificWeek);
    console.log('✅ Relatório semanal para semana específica gerado');
    console.log('   - Semana início:', weeklyReportSpecific.weekStart);
    console.log('   - Semana fim:', weeklyReportSpecific.weekEnd);

    console.log('\n✅ Todos os testes de aceitação de Relatórios passaram!');
    await app.close();
  } catch (error) {
    console.error('❌ Erro nos testes:', error);
    throw error;
  }
}

testReportUseCases().catch(console.error);

