import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { Button } from '../button';

describe('Button', () => {
  describe('Renderização', () => {
    it('deve renderizar um botão com texto', () => {
      render(<Button>Clique aqui</Button>);

      const button = screen.getByRole('button', { name: /clique aqui/i });
      expect(button).toBeInTheDocument();
    });

    it('deve renderizar um botão desabilitado', () => {
      render(<Button disabled>Botão Desabilitado</Button>);

      const button = screen.getByRole('button', { name: /botão desabilitado/i });
      expect(button).toBeDisabled();
    });

    it('deve aplicar className customizada', () => {
      render(<Button className="custom-class">Botão</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Variantes', () => {
    it('deve aplicar variante default', () => {
      render(<Button variant="default">Default</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary');
    });

    it('deve aplicar variante destructive', () => {
      render(<Button variant="destructive">Destructive</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-destructive');
    });

    it('deve aplicar variante outline', () => {
      render(<Button variant="outline">Outline</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('border');
    });

    it('deve aplicar variante secondary', () => {
      render(<Button variant="secondary">Secondary</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-secondary');
    });

    it('deve aplicar variante ghost', () => {
      render(<Button variant="ghost">Ghost</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-accent');
    });

    it('deve aplicar variante link', () => {
      render(<Button variant="link">Link</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('underline-offset-4');
    });
  });

  describe('Tamanhos', () => {
    it('deve aplicar tamanho default', () => {
      render(<Button size="default">Default</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10');
    });

    it('deve aplicar tamanho sm', () => {
      render(<Button size="sm">Small</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-9');
    });

    it('deve aplicar tamanho lg', () => {
      render(<Button size="lg">Large</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-11');
    });

    it('deve aplicar tamanho icon', () => {
      render(<Button size="icon">Icon</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10', 'w-10');
    });
  });

  describe('Interações', () => {
    it('deve chamar onClick quando clicado', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Clique</Button>);

      const button = screen.getByRole('button', { name: /clique/i });
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('não deve chamar onClick quando desabilitado', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Button onClick={handleClick} disabled>
          Desabilitado
        </Button>
      );

      const button = screen.getByRole('button', { name: /desabilitado/i });
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('deve passar props HTML nativas', () => {
      render(<Button type="submit" aria-label="Enviar formulário">Enviar</Button>);

      const button = screen.getByRole('button', { name: /enviar formulário/i });
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('asChild', () => {
    it('deve renderizar como elemento filho quando asChild é true', () => {
      render(
        <Button asChild>
          <a href="/test">Link como Botão</a>
        </Button>
      );

      const link = screen.getByRole('link', { name: /link como botão/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });
  });
});
