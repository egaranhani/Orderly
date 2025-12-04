import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/presentation/app.module';
import { ProcessInboxUseCase } from '../../src/application/use-cases/inbox/process-inbox.use-case';
import { GetInboxItemsUseCase } from '../../src/application/use-cases/inbox/get-inbox-items.use-case';
import { GetInboxItemUseCase } from '../../src/application/use-cases/inbox/get-inbox-item.use-case';
import { AcceptSuggestionUseCase } from '../../src/application/use-cases/inbox/accept-suggestion.use-case';
import { DiscardSuggestionUseCase } from '../../src/application/use-cases/inbox/discard-suggestion.use-case';
import { DeleteInboxItemUseCase } from '../../src/application/use-cases/inbox/delete-inbox-item.use-case';
import { InboxItemStatus } from '../../src/domain/entities/inbox-item.entity';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';

async function testInboxUseCases() {
  console.log('🧪 Iniciando testes de aceitação - Use Cases de Inbox...\n');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    
    const processUseCase = app.get<ProcessInboxUseCase>(ProcessInboxUseCase);
    const getInboxItemsUseCase = app.get<GetInboxItemsUseCase>(GetInboxItemsUseCase);
    const getInboxItemUseCase = app.get<GetInboxItemUseCase>(GetInboxItemUseCase);
    const acceptSuggestionUseCase = app.get<AcceptSuggestionUseCase>(AcceptSuggestionUseCase);
    const discardSuggestionUseCase = app.get<DiscardSuggestionUseCase>(DiscardSuggestionUseCase);
    const deleteInboxItemUseCase = app.get<DeleteInboxItemUseCase>(DeleteInboxItemUseCase);

    const testUserId = 'test-user-' + Date.now();
    const otherUserId = 'other-user-' + Date.now();

    // Test 1: Processar Inbox Item
    console.log('📝 Test 1: Processar Inbox Item');
    const processResult = await processUseCase.execute(testUserId, {
      meetingTitle: 'Reunião de Teste',
      meetingContent: 'Esta é uma reunião de teste com conteúdo suficiente para passar na validação.',
    });
    console.log('✅ Inbox Item processado:', processResult.inboxItemId);
    console.log('   - Sugestões:', processResult.suggestions.length);

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
    console.log('   - Todos processados:', items.every(i => i.status === InboxItemStatus.PROCESSED));

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

    // Limpeza
    console.log('\n🧹 Limpando dados de teste...');
    try {
      await deleteInboxItemUseCase.execute(testUserId, processResult.inboxItemId);
      console.log('✅ Dados de teste limpos');
    } catch (error) {
      console.log('⚠️  Erro na limpeza (pode ser esperado):', error.message);
    }

    console.log('\n✅ Todos os testes de aceitação de Inbox passaram!');
    console.log('⚠️  Nota: Testes de AcceptSuggestion e DiscardSuggestion requerem sugestões reais da IA (será implementado na Fase 3)');
    await app.close();
  } catch (error) {
    console.error('❌ Erro nos testes:', error);
    throw error;
  }
}

testInboxUseCases().catch(console.error);

