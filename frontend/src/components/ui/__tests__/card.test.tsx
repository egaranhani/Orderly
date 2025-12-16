import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../card';

describe('Card Components', () => {
  describe('Card', () => {
    it('deve renderizar um card básico', () => {
      const { container } = render(
        <Card>
          <div>Conteúdo do card</div>
        </Card>
      );

      const card = container.querySelector('.rounded-lg.border.bg-card');
      expect(card).toBeInTheDocument();
      expect(screen.getByText('Conteúdo do card')).toBeInTheDocument();
    });

    it('deve aplicar className customizada', () => {
      const { container } = render(
        <Card className="custom-card">
          <div>Card customizado</div>
        </Card>
      );

      const card = container.querySelector('.custom-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('custom-card');
    });
  });

  describe('CardHeader', () => {
    it('deve renderizar header do card', () => {
      render(
        <Card>
          <CardHeader>Header do Card</CardHeader>
        </Card>
      );

      const header = screen.getByText('Header do Card');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
    });
  });

  describe('CardTitle', () => {
    it('deve renderizar título do card', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Título do Card</CardTitle>
          </CardHeader>
        </Card>
      );

      const title = screen.getByText('Título do Card');
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('H3');
      expect(title).toHaveClass('text-2xl', 'font-semibold');
    });
  });

  describe('CardDescription', () => {
    it('deve renderizar descrição do card', () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>Descrição do card</CardDescription>
          </CardHeader>
        </Card>
      );

      const description = screen.getByText('Descrição do card');
      expect(description).toBeInTheDocument();
      expect(description.tagName).toBe('P');
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });
  });

  describe('CardContent', () => {
    it('deve renderizar conteúdo do card', () => {
      render(
        <Card>
          <CardContent>Conteúdo principal</CardContent>
        </Card>
      );

      const content = screen.getByText('Conteúdo principal');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass('p-6', 'pt-0');
    });
  });

  describe('CardFooter', () => {
    it('deve renderizar footer do card', () => {
      render(
        <Card>
          <CardFooter>Footer do card</CardFooter>
        </Card>
      );

      const footer = screen.getByText('Footer do card');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
    });
  });

  describe('Composição Completa', () => {
    it('deve renderizar card completo com todos os componentes', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Título</CardTitle>
            <CardDescription>Descrição</CardDescription>
          </CardHeader>
          <CardContent>Conteúdo</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      );

      expect(screen.getByText('Título')).toBeInTheDocument();
      expect(screen.getByText('Descrição')).toBeInTheDocument();
      expect(screen.getByText('Conteúdo')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });
});
