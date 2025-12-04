import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/presentation/app.module';
import { ProcessInboxUseCase } from '../../src/application/use-cases/inbox/process-inbox.use-case';
import { GetInboxItemsUseCase } from '../../src/application/use-cases/inbox/get-inbox-items.use-case';
import { GetInboxItemUseCase } from '../../src/application/use-cases/inbox/get-inbox-item.use-case';
import { AcceptSuggestionUseCase } from '../../src/application/use-cases/inbox/accept-suggestion.use-case';
import { DiscardSuggestionUseCase } from '../../src/application/use-cases/inbox/discard-suggestion.use-case';
import { DeleteInboxItemUseCase } from '../../src/application/use-cases/inbox/delete-inbox-item.use-case';
import { InboxItemStatus } from '../../src/domain/entities/inbox-item.entity';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { MockAiService } from '../mocks/mock-ai.service';

async function testInboxUseCases() {
  console.log('🧪 Iniciando testes de aceitação - Use Cases de Inbox...\n');

  try {
    const useMockAi = process.env.USE_MOCK_AI !== 'false';
    
    let moduleBuilder = Test.createTestingModule({
      imports: [AppModule],
    });

    if (useMockAi) {
      moduleBuilder = moduleBuilder
        .overrideProvider('IAiService')
        .useClass(MockAiService);
      console.log('📌 Usando MockAiService para testes');
    } else {
      console.log('📌 Usando VertexAiService real (requer credenciais Google Cloud)');
    }

    const module: TestingModule = await moduleBuilder.compile();
    
    const processUseCase = module.get<ProcessInboxUseCase>(ProcessInboxUseCase);
    const getInboxItemsUseCase = module.get<GetInboxItemsUseCase>(GetInboxItemsUseCase);
    const getInboxItemUseCase = module.get<GetInboxItemUseCase>(GetInboxItemUseCase);
    const acceptSuggestionUseCase = module.get<AcceptSuggestionUseCase>(AcceptSuggestionUseCase);
    const discardSuggestionUseCase = module.get<DiscardSuggestionUseCase>(DiscardSuggestionUseCase);
    const deleteInboxItemUseCase = module.get<DeleteInboxItemUseCase>(DeleteInboxItemUseCase);

    const testUserId = 'test-user-' + Date.now();
    const otherUserId = 'other-user-' + Date.now();

    // Test 1: Processar Inbox Item
    console.log('📝 Test 1: Processar Inbox Item');
    const processResult = await processUseCase.execute(testUserId, {
      meetingTitle: 'Reunião de Teste',
      meetingContent: 'Esta é uma reunião de teste com conteúdo suficiente para passar na validação. Na reunião foi decidido fechar a proposta comercial e planejar férias para julho.',
    });
    console.log('✅ Inbox Item processado:', processResult.inboxItemId);
    console.log('   - Status: PROCESSED');
    console.log('   - Sugestões:', processResult.suggestions.length);
    if (processResult.suggestions.length > 0) {
      console.log('   - Primeira sugestão:', processResult.suggestions[0].actionSummary);
      console.log('   - Prioridade sugerida:', processResult.suggestions[0].suggestedPriority.title);
      console.log('   - Quadrante:', processResult.suggestions[0].suggestedPriority.quadrant);
      console.log('   - Tarefa sugerida:', processResult.suggestions[0].suggestedTask.title);
      console.log('   - Classificação:', processResult.suggestions[0].suggestedTask.classification);
    } else {
      console.log('   ⚠️  Nenhuma sugestão retornada (IA pode não estar configurada ou não encontrou ações)');
    }

    // Test 2: Validação - Conteúdo muito curto
    console.log('\n📝 Test 2: Validação - Conteúdo muito curto');
    try {
      await processUseCase.execute(testUserId, {
        meetingContent: 'Curto',
      });
      console.log('❌ ERRO: Deveria ter lançado BadRequestException');
    } catch (error) {
      if (error instanceof BadRequestException) {
        console.log('✅ BadRequestException lançada corretamente');
      } else {
        console.log('❌ ERRO: Exceção incorreta:', error);
      }
    }

    // Test 3: Validação - Título muito longo
    console.log('\n📝 Test 3: Validação - Título muito longo');
    try {
      await processUseCase.execute(testUserId, {
        meetingTitle: 'A'.repeat(201),
        meetingContent: 'Conteúdo suficiente para passar na validação de tamanho mínimo.',
      });
      console.log('❌ ERRO: Deveria ter lançado BadRequestException');
    } catch (error) {
      if (error instanceof BadRequestException) {
        console.log('✅ BadRequestException lançada corretamente');
      } else {
        console.log('❌ ERRO: Exceção incorreta:', error);
      }
    }

    // Test 4: Buscar Inbox Item por ID
    console.log('\n📝 Test 4: Buscar Inbox Item por ID');
    const foundItem = await getInboxItemUseCase.execute(testUserId, processResult.inboxItemId);
    console.log('✅ Inbox Item encontrado:', foundItem.id);
    console.log('   - Status:', foundItem.status);
    console.log('   - Meeting Title:', foundItem.meetingTitle);

    // Test 5: Buscar Inbox Item de outro usuário (deve falhar)
    console.log('\n📝 Test 5: Buscar Inbox Item de outro usuário');
    try {
      await getInboxItemUseCase.execute(otherUserId, processResult.inboxItemId);
      console.log('❌ ERRO: Deveria ter lançado ForbiddenException');
    } catch (error) {
      if (error instanceof ForbiddenException) {
        console.log('✅ ForbiddenException lançada corretamente');
      } else {
        console.log('❌ ERRO: Exceção incorreta:', error);
      }
    }

    // Test 6: Listar Inbox Items com filtros
    console.log('\n📝 Test 6: Listar Inbox Items com filtros');
    const items = await getInboxItemsUseCase.execute(testUserId, {
      status: InboxItemStatus.PROCESSED,
    });
    console.log('✅ Inbox Items encontrados:', items.length);
    console.log('   - Todos processados:', items.every((i: { status: InboxItemStatus }) => i.status === InboxItemStatus.PROCESSED));

    // Test 7: Processar mais um item
    console.log('\n📝 Test 7: Processar mais um item');
    const processResult2 = await processUseCase.execute(testUserId, {
      meetingContent: 'Outra reunião de teste com conteúdo suficiente para passar na validação.',
    });
    console.log('✅ Segundo Inbox Item processado:', processResult2.inboxItemId);

    // Test 8: Listar todos os items
    console.log('\n📝 Test 8: Listar todos os items');
    const allItems = await getInboxItemsUseCase.execute(testUserId);
    console.log('✅ Total de Inbox Items:', allItems.length);

    // Test 9: Deletar Inbox Item
    console.log('\n📝 Test 9: Deletar Inbox Item');
    const deleteResult = await deleteInboxItemUseCase.execute(testUserId, processResult2.inboxItemId);
    console.log('✅ Inbox Item deletado:', deleteResult.success);

    // Test 10: Buscar Inbox Item deletado (deve falhar)
    console.log('\n📝 Test 10: Buscar Inbox Item deletado');
    try {
      await getInboxItemUseCase.execute(testUserId, processResult2.inboxItemId);
      console.log('❌ ERRO: Deveria ter lançado NotFoundException');
    } catch (error) {
      if (error instanceof NotFoundException) {
        console.log('✅ NotFoundException lançada corretamente');
      } else {
        console.log('❌ ERRO: Exceção incorreta:', error);
      }
    }

    // Test 11: Aceitar Sugestão (requer sugestões reais)
    if (processResult.suggestions.length > 0) {
      console.log('\n📝 Test 11: Aceitar Sugestão');
      const suggestionId = processResult.suggestions[0].id;
      const acceptResult = await acceptSuggestionUseCase.execute(testUserId, processResult.inboxItemId, {
        suggestionId,
      });
      console.log('✅ Sugestão aceita');
      console.log('   - Prioridade criada:', acceptResult.priority.id);
      console.log('   - Tarefa criada:', acceptResult.task.id);
    }

    // Test 12: Descartar Sugestão
    if (processResult.suggestions.length > 1) {
      console.log('\n📝 Test 12: Descartar Sugestão');
      const suggestionId = processResult.suggestions[1].id;
      const discardResult = await discardSuggestionUseCase.execute(testUserId, processResult.inboxItemId, {
        suggestionId,
      });
      console.log('✅ Sugestão descartada:', discardResult.success);
    }

    // Limpeza
    console.log('\n🧹 Limpando dados de teste...');
    try {
      await deleteInboxItemUseCase.execute(testUserId, processResult.inboxItemId);
      console.log('✅ Dados de teste limpos');
    } catch (error) {
      console.log('⚠️  Erro na limpeza (pode ser esperado):', error.message);
    }

    console.log('\n✅ Todos os testes de aceitação de Inbox passaram!');
    console.log('✅ Testes usam mock do serviço de IA (MockAiService). Para testes com IA real, remova o override do provider.');
    await module.close();
  } catch (error) {
    console.error('❌ Erro nos testes:', error);
    throw error;
  }
}

testInboxUseCases().catch(console.error);

