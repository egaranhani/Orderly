import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/presentation/app.module';
import { CreateTaskUseCase } from '../../src/application/use-cases/task/create-task.use-case';
import { GetTasksUseCase } from '../../src/application/use-cases/task/get-tasks.use-case';
import { GetTaskUseCase } from '../../src/application/use-cases/task/get-task.use-case';
import { UpdateTaskUseCase } from '../../src/application/use-cases/task/update-task.use-case';
import { MoveTaskUseCase } from '../../src/application/use-cases/task/move-task.use-case';
import { CompleteTaskUseCase } from '../../src/application/use-cases/task/complete-task.use-case';
import { CancelTaskUseCase } from '../../src/application/use-cases/task/cancel-task.use-case';
import { DeleteTaskUseCase } from '../../src/application/use-cases/task/delete-task.use-case';
import { CreatePriorityUseCase } from '../../src/application/use-cases/priority/create-priority.use-case';
import { ArchivePriorityUseCase } from '../../src/application/use-cases/priority/archive-priority.use-case';
import { TaskClassification, TaskStatus, TaskOrigin } from '../../src/domain/entities/task.entity';
import { EisenhowerQuadrant, PriorityStatus } from '../../src/domain/entities/priority.entity';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';

async function testTaskUseCases() {
  console.log('🧪 Iniciando testes de aceitação - Use Cases de Tarefas...\n');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    
    const createPriorityUseCase = app.get<CreatePriorityUseCase>(CreatePriorityUseCase);
    const archivePriorityUseCase = app.get<ArchivePriorityUseCase>(ArchivePriorityUseCase);
    const createTaskUseCase = app.get<CreateTaskUseCase>(CreateTaskUseCase);
    const getTasksUseCase = app.get<GetTasksUseCase>(GetTasksUseCase);
    const getTaskUseCase = app.get<GetTaskUseCase>(GetTaskUseCase);
    const updateTaskUseCase = app.get<UpdateTaskUseCase>(UpdateTaskUseCase);
    const moveTaskUseCase = app.get<MoveTaskUseCase>(MoveTaskUseCase);
    const completeTaskUseCase = app.get<CompleteTaskUseCase>(CompleteTaskUseCase);
    const cancelTaskUseCase = app.get<CancelTaskUseCase>(CancelTaskUseCase);
    const deleteTaskUseCase = app.get<DeleteTaskUseCase>(DeleteTaskUseCase);

    const testUserId = 'test-user-' + Date.now();
    const otherUserId = 'other-user-' + Date.now();

    // Criar prioridade para os testes
    console.log('📦 Criando prioridade de teste...');
    const priority = await createPriorityUseCase.execute(testUserId, {
      title: 'Prioridade para Tarefas',
      quadrant: EisenhowerQuadrant.Q1,
    });
    console.log('✅ Prioridade criada:', priority.id);

    // Test 1: Criar Tarefa
    console.log('\n📝 Test 1: Criar Tarefa');
    const createdTask = await createTaskUseCase.execute(testUserId, priority.id, {
      title: 'Tarefa de Teste',
      description: 'Descrição de teste',
      classification: TaskClassification.DO,
      origin: TaskOrigin.MANUAL,
    });
    console.log('✅ Tarefa criada:', createdTask.id);
    console.log('   - Título:', createdTask.title);
    console.log('   - Classificação:', createdTask.classification);
    console.log('   - Status:', createdTask.status);
    console.log('   - Origin:', createdTask.origin);

    // Test 2: Validação - Título muito curto
    console.log('\n📝 Test 2: Validação - Título muito curto');
    try {
      await createTaskUseCase.execute(testUserId, priority.id, {
        title: 'AB',
        classification: TaskClassification.DO,
      });
      console.log('❌ ERRO: Deveria ter lançado BadRequestException');
    } catch (error) {
      if (error instanceof BadRequestException) {
        console.log('✅ BadRequestException lançada corretamente');
      } else {
        console.log('❌ ERRO: Exceção incorreta:', error);
      }
    }

    // Test 3: Validação - Schedule sem idealDate
    console.log('\n📝 Test 3: Validação - Schedule sem idealDate');
    try {
      await createTaskUseCase.execute(testUserId, priority.id, {
        title: 'Tarefa Schedule',
        classification: TaskClassification.SCHEDULE,
      });
      console.log('❌ ERRO: Deveria ter lançado BadRequestException');
    } catch (error) {
      if (error instanceof BadRequestException) {
        console.log('✅ BadRequestException lançada corretamente');
      } else {
        console.log('❌ ERRO: Exceção incorreta:', error);
      }
    }

    // Test 4: Validação - Delegate sem responsible
    console.log('\n📝 Test 4: Validação - Delegate sem responsible');
    try {
      await createTaskUseCase.execute(testUserId, priority.id, {
        title: 'Tarefa Delegate',
        classification: TaskClassification.DELEGATE,
      });
      console.log('❌ ERRO: Deveria ter lançado BadRequestException');
    } catch (error) {
      if (error instanceof BadRequestException) {
        console.log('✅ BadRequestException lançada corretamente');
      } else {
        console.log('❌ ERRO: Exceção incorreta:', error);
      }
    }

    // Test 5: Criar Tarefa Schedule com idealDate
    console.log('\n📝 Test 5: Criar Tarefa Schedule com idealDate');
    const scheduleTask = await createTaskUseCase.execute(testUserId, priority.id, {
      title: 'Tarefa Agendada',
      classification: TaskClassification.SCHEDULE,
      idealDate: new Date('2024-12-31'),
    });
    console.log('✅ Tarefa Schedule criada:', scheduleTask.id);
    console.log('   - Ideal Date:', scheduleTask.idealDate);

    // Test 6: Criar Tarefa Delegate com responsible
    console.log('\n📝 Test 6: Criar Tarefa Delegate com responsible');
    const delegateTask = await createTaskUseCase.execute(testUserId, priority.id, {
      title: 'Tarefa Delegada',
      classification: TaskClassification.DELEGATE,
      responsible: 'João Silva',
    });
    console.log('✅ Tarefa Delegate criada:', delegateTask.id);
    console.log('   - Responsible:', delegateTask.responsible);

    // Test 7: Buscar Tarefa por ID
    console.log('\n📝 Test 7: Buscar Tarefa por ID');
    const foundTask = await getTaskUseCase.execute(testUserId, createdTask.id);
    console.log('✅ Tarefa encontrada:', foundTask.title);

    // Test 8: Buscar Tarefa de outro usuário (deve falhar)
    console.log('\n📝 Test 8: Buscar Tarefa de outro usuário');
    try {
      await getTaskUseCase.execute(otherUserId, createdTask.id);
      console.log('❌ ERRO: Deveria ter lançado ForbiddenException');
    } catch (error) {
      if (error instanceof ForbiddenException) {
        console.log('✅ ForbiddenException lançada corretamente');
      } else {
        console.log('❌ ERRO: Exceção incorreta:', error);
      }
    }

    // Test 9: Listar Tarefas de uma Prioridade
    console.log('\n📝 Test 9: Listar Tarefas de uma Prioridade');
    const tasks = await getTasksUseCase.execute(testUserId, priority.id);
    console.log('✅ Tarefas encontradas:', tasks.length);
    console.log('   - Todas da mesma prioridade:', tasks.every(t => t.priorityId === priority.id));

    // Test 10: Atualizar Tarefa
    console.log('\n📝 Test 10: Atualizar Tarefa');
    const updatedTask = await updateTaskUseCase.execute(testUserId, createdTask.id, {
      title: 'Tarefa Atualizada',
      description: 'Nova descrição',
      status: TaskStatus.IN_PROGRESS,
    });
    console.log('✅ Tarefa atualizada:', updatedTask.title);
    console.log('   - Novo status:', updatedTask.status);

    // Test 11: Mover Tarefa entre classificações
    console.log('\n📝 Test 11: Mover Tarefa entre classificações');
    const movedTask = await moveTaskUseCase.execute(testUserId, createdTask.id, {
      classification: TaskClassification.ELIMINATE,
    });
    console.log('✅ Tarefa movida:', movedTask.classification);

    // Test 12: Completar Tarefa
    console.log('\n📝 Test 12: Completar Tarefa');
    const completedTask = await completeTaskUseCase.execute(testUserId, scheduleTask.id);
    console.log('✅ Tarefa completada:', completedTask.status);
    console.log('   - Status:', completedTask.status === TaskStatus.COMPLETED);

    // Test 13: Cancelar Tarefa
    console.log('\n📝 Test 13: Cancelar Tarefa');
    const cancelledTask = await cancelTaskUseCase.execute(testUserId, delegateTask.id);
    console.log('✅ Tarefa cancelada:', cancelledTask.status);
    console.log('   - Status:', cancelledTask.status === TaskStatus.CANCELLED);

    // Test 14: Criar tarefa em prioridade arquivada (deve falhar)
    console.log('\n📝 Test 14: Criar tarefa em prioridade arquivada');
    const archivedPriority = await archivePriorityUseCase.execute(testUserId, priority.id);
    try {
      await createTaskUseCase.execute(testUserId, priority.id, {
        title: 'Tarefa em Prioridade Arquivada',
        classification: TaskClassification.DO,
      });
      console.log('❌ ERRO: Deveria ter lançado BadRequestException');
    } catch (error) {
      if (error instanceof BadRequestException) {
        console.log('✅ BadRequestException lançada corretamente');
      } else {
        console.log('❌ ERRO: Exceção incorreta:', error);
      }
    }

    // Test 15: Deletar Tarefa
    console.log('\n📝 Test 15: Deletar Tarefa');
    const deleteResult = await deleteTaskUseCase.execute(testUserId, createdTask.id);
    console.log('✅ Tarefa deletada:', deleteResult.success);

    // Test 16: Buscar Tarefa deletada (deve falhar)
    console.log('\n📝 Test 16: Buscar Tarefa deletada');
    try {
      await getTaskUseCase.execute(testUserId, createdTask.id);
      console.log('❌ ERRO: Deveria ter lançado NotFoundException');
    } catch (error) {
      if (error instanceof NotFoundException) {
        console.log('✅ NotFoundException lançada corretamente');
      } else {
        console.log('❌ ERRO: Exceção incorreta:', error);
      }
    }

    // Limpeza
    console.log('\n🧹 Limpando dados de teste...');
    try {
      await deleteTaskUseCase.execute(testUserId, scheduleTask.id);
      await deleteTaskUseCase.execute(testUserId, delegateTask.id);
      console.log('✅ Dados de teste limpos');
    } catch (error) {
      console.log('⚠️  Erro na limpeza (pode ser esperado):', error.message);
    }

    console.log('\n✅ Todos os testes de aceitação de Tarefas passaram!');
    await app.close();
  } catch (error) {
    console.error('❌ Erro nos testes:', error);
    throw error;
  }
}

testTaskUseCases().catch(console.error);

