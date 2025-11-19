import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiService } from '../services/ai.service';
import { Conversation, CreateConversationDto } from '../types/conversation.types';
import './ChatPage.css';

export const ChatPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => aiService.getConversations(),
  });

  const createConversationMutation = useMutation({
    mutationFn: (dto: CreateConversationDto) => aiService.createConversation(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setSelectedConversation(data);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: (message: string) =>
      aiService.sendMessage({
        conversationId: selectedConversation!.id,
        message,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setMessage('');
    },
  });

  const handleNewConversation = () => {
    createConversationMutation.mutate({
      title: `Conversa ${new Date().toLocaleDateString()}`,
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && selectedConversation) {
      sendMessageMutation.mutate(message);
    }
  };

  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  return (
    <div className="chat-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>OrderlyAI</h2>
          <button onClick={handleNewConversation} className="new-chat-button">
            Nova Conversa
          </button>
        </div>
        <div className="conversations-list">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item ${
                selectedConversation?.id === conv.id ? 'active' : ''
              }`}
              onClick={() => setSelectedConversation(conv)}
            >
              {conv.title}
            </div>
          ))}
        </div>
        <div className="sidebar-footer">
          <div className="user-info">
            <span>{user?.name}</span>
            <button onClick={logout} className="logout-button">
              Sair
            </button>
          </div>
        </div>
      </aside>
      <main className="chat-main">
        {selectedConversation ? (
          <>
            <div className="messages-container">
              {selectedConversation.messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.role}`}>
                  <div className="message-content">{msg.content}</div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="message-form">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="message-input"
              />
              <button type="submit" className="send-button">
                Enviar
              </button>
            </form>
          </>
        ) : (
          <div className="empty-state">
            <p>Selecione uma conversa ou crie uma nova</p>
          </div>
        )}
      </main>
    </div>
  );
};

