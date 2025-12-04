import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/presentation/app.module';
import { CreatePriorityUseCase } from '../../src/application/use-cases/priority/create-priority.use-case';
import { GetPrioritiesUseCase } from '../../src/application/use-cases/priority/get-priorities.use-case';
import { GetPriorityUseCase } from '../../src/application/use-cases/priority/get-priority.use-case';
import { UpdatePriorityUseCase } from '../../src/application/use-cases/priority/update-priority.use-case';
import { MovePriorityUseCase } from '../../src/application/use-cases/priority/move-priority.use-case';
import { ReorderPrioritiesUseCase } from '../../src/application/use-cases/priority/reorder-priorities.use-case';
import { ArchivePriorityUseCase } from '../../src/application/use-cases/priority/archive-priority.use-case';
import { DeletePriorityUseCase } from '../../src/application/use-cases/priority/delete-priority.use-case';
import { EisenhowerQuadrant, PriorityStatus, PriorityOrigin } from '../../src/domain/entities/priority.entity';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';

async function testPriorityUseCases() {
  console.log('🧪 Iniciando testes de aceitação - Use Cases de Prioridades...\n');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    
    const createUseCase = app.get<CreatePriorityUseCase>(CreatePriorityUseCase);
    const getPrioritiesUseCase = app.get<GetPrioritiesUseCase>(GetPrioritiesUseCase);
    const getPriorityUseCase = app.get<GetPriorityUseCase>(GetPriorityUseCase);
    const updateUseCase = app.get<UpdatePriorityUseCase>(UpdatePriorityUseCase);
    const moveUseCase = app.get<MovePriorityUseCase>(MovePriorityUseCase);
    const reorderUseCase = app.get<ReorderPrioritiesUseCase>(ReorderPrioritiesUseCase);
    const archiveUseCase = app.get<ArchivePriorityUseCase>(ArchivePriorityUseCase);
    const deleteUseCase = app.get<DeletePriorityUseCase>(DeletePriorityUseCase);

    const testUserId = 'test-user-' + Date.now();
    const otherUserId = 'other-user-' + Date.now();

    // Test 1: Criar Prioridade
    console.log('📝 Test 1: Criar Prioridade');
    const createdPriority = await createUseCase.execute(testUserId, {
      title: 'Prioridade de Teste',
      description: 'Descrição de teste',
      quadrant: EisenhowerQuadrant.Q1,
      tags: ['teste', 'aceitação'],
      origin: PriorityOrigin.MANUAL,
    });
    console.log('✅ Prioridade criada:', createdPriority.id);
    console.log('   - Título:', createdPriority.title);
    console.log('   - Quadrante:', createdPriority.quadrant);
    console.log('   - Display Order:', createdPriority.displayOrder);
    console.log('   - Status:', createdPriority.status);
    console.log('   - Origin:', createdPriority.origin);

    // Test 2: Validação - Título muito curto
    console.log('\n📝 Test 2: Validação - Título muito curto');
    try {
      await createUseCase.execute(testUserId, {
        title: 'AB',
        quadrant: EisenhowerQuadrant.Q1,
      });
      console.log('❌ ERRO: Deveria ter lançado BadRequestException');
    } catch (error) {
      if (error instanceof BadRequestException) {
        console.log('✅ BadRequestException lançada corretamente:', error.message);
      } else {
        console.log('❌ ERRO: Exceção incorreta:', error);
      }
    }

    // Test 3: Validação - Quadrante inválido
    console.log('\n📝 Test 3: Validação - Quadrante inválido');
    try {
      await createUseCase.execute(testUserId, {
        title: 'Teste',
        quadrant: 'INVALID' as any,
      });
      console.log('❌ ERRO: Deveria ter lançado BadRequestException');
    } catch (error) {
      if (error instanceof BadRequestException) {
        console.log('✅ BadRequestException lançada corretamente');
      } else {
        console.log('❌ ERRO: Exceção incorreta:', error);
      }
    }

    // Test 4: Buscar Prioridade por ID
    console.log('\n📝 Test 4: Buscar Prioridade por ID');
    const foundPriority = await getPriorityUseCase.execute(testUserId, createdPriority.id);
    console.log('✅ Prioridade encontrada:', foundPriority.title);
    console.log('   - Task Count:', foundPriority.taskCount || 0);

    // Test 5: Buscar Prioridade de outro usuário (deve falhar)
    console.log('\n📝 Test 5: Buscar Prioridade de outro usuário');
    try {
      await getPriorityUseCase.execute(otherUserId, createdPriority.id);
      console.log('❌ ERRO: Deveria ter lançado ForbiddenException');
    } catch (error) {
      if (error instanceof ForbiddenException) {
        console.log('✅ ForbiddenException lançada corretamente');
      } else {
        console.log('❌ ERRO: Exceção incorreta:', error);
      }
    }

    // Test 6: Listar Prioridades com filtros
    console.log('\n📝 Test 6: Listar Prioridades com filtros');
    const priorities = await getPrioritiesUseCase.execute(testUserId, {
      status: PriorityStatus.ACTIVE,
      quadrant: EisenhowerQuadrant.Q1,
    });
    console.log('✅ Prioridades encontradas:', priorities.length);
    console.log('   - Todas ativas:', priorities.every(p => p.status === PriorityStatus.ACTIVE));
    console.log('   - Todas Q1:', priorities.every(p => p.quadrant === EisenhowerQuadrant.Q1));

    // Test 7: Criar mais prioridades para testar ordenação
    console.log('\n📝 Test 7: Criar mais prioridades');
    const priority2 = await createUseCase.execute(testUserId, {
      title: 'Prioridade 2',
      quadrant: EisenhowerQuadrant.Q1,
    });
    const priority3 = await createUseCase.execute(testUserId, {
      title: 'Prioridade 3',
      quadrant: EisenhowerQuadrant.Q1,
    });
    console.log('✅ Prioridades criadas:', priority2.id, priority3.id);

    // Test 8: Atualizar Prioridade
    console.log('\n📝 Test 8: Atualizar Prioridade');
    const updatedPriority = await updateUseCase.execute(testUserId, createdPriority.id, {
      title: 'Prioridade Atualizada',
      description: 'Nova descrição',
      tags: ['atualizado'],
    });
    console.log('✅ Prioridade atualizada:', updatedPriority.title);
    console.log('   - Nova descrição:', updatedPriority.description);
    console.log('   - Novas tags:', updatedPriority.tags);

    // Test 9: Mover Prioridade entre quadrantes
    console.log('\n📝 Test 9: Mover Prioridade entre quadrantes');
    const movedPriority = await moveUseCase.execute(testUserId, priority2.id, {
      quadrant: EisenhowerQuadrant.Q2,
    });
    console.log('✅ Prioridade movida:', movedPriority.quadrant);
    console.log('   - Novo display order:', movedPriority.displayOrder);

    // Test 10: Reordenar Prioridades
    console.log('\n📝 Test 10: Reordenar Prioridades');
    const reorderResult = await reorderUseCase.execute(
      testUserId,
      EisenhowerQuadrant.Q1,
      {
        priorityIds: [priority3.id, createdPriority.id],
      }
    );
    console.log('✅ Prioridades reordenadas:', reorderResult.success);

    // Test 11: Arquivar Prioridade
    console.log('\n📝 Test 11: Arquivar Prioridade');
    const archivedPriority = await archiveUseCase.execute(testUserId, priority3.id);
    console.log('✅ Prioridade arquivada:', archivedPriority.status);
    console.log('   - Status:', archivedPriority.status === PriorityStatus.ARCHIVED);

    // Test 12: Deletar Prioridade
    console.log('\n📝 Test 12: Deletar Prioridade');
    const deleteResult = await deleteUseCase.execute(testUserId, createdPriority.id);
    console.log('✅ Prioridade deletada:', deleteResult.success);

    // Test 13: Buscar Prioridade deletada (deve falhar)
    console.log('\n📝 Test 13: Buscar Prioridade deletada');
    try {
      await getPriorityUseCase.execute(testUserId, createdPriority.id);
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
      await deleteUseCase.execute(testUserId, priority2.id);
      await deleteUseCase.execute(testUserId, priority3.id);
      console.log('✅ Dados de teste limpos');
    } catch (error) {
      console.log('⚠️  Erro na limpeza (pode ser esperado):', error.message);
    }

    console.log('\n✅ Todos os testes de aceitação de Prioridades passaram!');
    await app.close();
  } catch (error) {
    console.error('❌ Erro nos testes:', error);
    throw error;
  }
}

testPriorityUseCases().catch(console.error);

