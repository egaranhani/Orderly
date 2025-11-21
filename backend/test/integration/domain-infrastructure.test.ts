import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/presentation/app.module';
import { IPriorityRepository } from '../../src/domain/repositories/priority.repository.interface';
import { ITaskRepository } from '../../src/domain/repositories/task.repository.interface';
import { IInboxRepository } from '../../src/domain/repositories/inbox.repository.interface';
import { Prioridade, EisenhowerQuadrant, PriorityStatus, PriorityOrigin } from '../../src/domain/entities/priority.entity';
import { Tarefa, TaskClassification, TaskStatus, TaskOrigin } from '../../src/domain/entities/task.entity';
import { InboxItem, InboxItemStatus, ActionSuggestion } from '../../src/domain/entities/inbox-item.entity';

async function testDomainInfrastructure() {
  console.log('🧪 Iniciando testes de Domain e Infrastructure (Fase 1)...\n');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    
    const priorityRepo = app.get<IPriorityRepository>('IPriorityRepository');
    const taskRepo = app.get<ITaskRepository>('ITaskRepository');
    const inboxRepo = app.get<IInboxRepository>('IInboxRepository');

    const testUserId = 'test-user-' + Date.now();

    console.log('📦 Testando Repositório de Prioridades...');
    
    const priority = new Prioridade(
      testUserId,
      'Teste de Prioridade',
      EisenhowerQuadrant.Q1,
      ['teste', 'fase1'],
      PriorityStatus.ACTIVE,
      PriorityOrigin.MANUAL,
      0,
      'Descrição de teste'
    );

    const createdPriority = await priorityRepo.create(priority);
    console.log('✅ Prioridade criada:', createdPriority.id);

    const foundPriority = await priorityRepo.findById(createdPriority.id);
    console.log('✅ Prioridade encontrada:', foundPriority?.title);

    const priorities = await priorityRepo.findByUserId(testUserId);
    console.log('✅ Prioridades do usuário:', priorities.length);

    console.log('\n📋 Testando Repositório de Tarefas...');
    
    const task = new Tarefa(
      testUserId,
      createdPriority.id,
      'Tarefa de Teste',
      TaskClassification.DO,
      TaskStatus.OPEN,
      TaskOrigin.MANUAL,
      'Descrição da tarefa'
    );

    const createdTask = await taskRepo.create(task);
    console.log('✅ Tarefa criada:', createdTask.id);

    const foundTask = await taskRepo.findById(createdTask.id);
    console.log('✅ Tarefa encontrada:', foundTask?.title);

    const tasks = await taskRepo.findByPriorityId(createdPriority.id);
    console.log('✅ Tarefas da prioridade:', tasks.length);

    console.log('\n📥 Testando Repositório de Inbox...');
    
    const suggestion = new ActionSuggestion(
      'sug-1',
      'Ação de teste sugerida',
      {
        title: 'Prioridade Sugerida',
        quadrant: EisenhowerQuadrant.Q2,
        tags: ['inbox', 'teste'],
      },
      {
        title: 'Tarefa Sugerida',
        classification: TaskClassification.SCHEDULE,
        idealDate: new Date('2024-12-31'),
      },
      'Reunião de Teste'
    );

    const inboxItem = new InboxItem(
      testUserId,
      'Conteúdo de teste da reunião',
      InboxItemStatus.PROCESSED,
      [suggestion],
      'Reunião de Teste',
      new Date()
    );

    const createdInbox = await inboxRepo.create(inboxItem);
    console.log('✅ Item de inbox criado:', createdInbox.id);

    const foundInbox = await inboxRepo.findById(createdInbox.id);
    console.log('✅ Item de inbox encontrado:', foundInbox?.meetingTitle);
    console.log('✅ Sugestões:', foundInbox?.suggestions.length);

    const inboxItems = await inboxRepo.findByUserId(testUserId);
    console.log('✅ Itens de inbox do usuário:', inboxItems.length);

    console.log('\n🧹 Limpando dados de teste...');
    await priorityRepo.delete(createdPriority.id);
    await taskRepo.delete(createdTask.id);
    await inboxRepo.delete(createdInbox.id);
    console.log('✅ Dados de teste removidos');

    console.log('\n✅ Todos os testes de Domain e Infrastructure passaram com sucesso!');
    
    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    process.exit(1);
  }
}

testDomainInfrastructure();


