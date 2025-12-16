import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { Input } from '../input';

describe('Input', () => {
  describe('Renderização', () => {
    it('deve renderizar um input', () => {
      render(<Input placeholder="Digite algo" />);

      const input = screen.getByPlaceholderText('Digite algo');
      expect(input).toBeInTheDocument();
      expect(input.tagName).toBe('INPUT');
    });

    it('deve aplicar className customizada', () => {
      render(<Input className="custom-input" placeholder="Input" />);

      const input = screen.getByPlaceholderText('Input');
      expect(input).toHaveClass('custom-input');
    });

    it('deve renderizar input desabilitado', () => {
      render(<Input disabled placeholder="Desabilitado" />);

      const input = screen.getByPlaceholderText('Desabilitado');
      expect(input).toBeDisabled();
    });
  });

  describe('Tipos de Input', () => {
    it('deve renderizar input do tipo text por padrão', () => {
      render(<Input placeholder="Texto" type="text" />);

      const input = screen.getByPlaceholderText('Texto');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('deve renderizar input do tipo email', () => {
      render(<Input type="email" placeholder="Email" />);

      const input = screen.getByPlaceholderText('Email');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('deve renderizar input do tipo password', () => {
      render(<Input type="password" placeholder="Senha" />);

      const input = screen.getByPlaceholderText('Senha');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('deve renderizar input do tipo number', () => {
      render(<Input type="number" placeholder="Número" />);

      const input = screen.getByPlaceholderText('Número');
      expect(input).toHaveAttribute('type', 'number');
    });
  });

  describe('Interações', () => {
    it('deve permitir digitar texto', async () => {
      const user = userEvent.setup();
      render(<Input placeholder="Digite aqui" />);

      const input = screen.getByPlaceholderText('Digite aqui');
      await user.type(input, 'Texto digitado');

      expect(input).toHaveValue('Texto digitado');
    });

    it('deve chamar onChange quando o valor muda', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Input onChange={handleChange} placeholder="Input" />);

      const input = screen.getByPlaceholderText('Input');
      await user.type(input, 'a');

      expect(handleChange).toHaveBeenCalled();
    });

    it('não deve permitir digitar quando desabilitado', async () => {
      const user = userEvent.setup();
      render(<Input disabled placeholder="Desabilitado" />);

      const input = screen.getByPlaceholderText('Desabilitado');
      await user.type(input, 'texto');

      expect(input).toHaveValue('');
    });
  });

  describe('Atributos HTML', () => {
    it('deve passar atributos HTML nativos', () => {
      render(
        <Input
          placeholder="Input"
          id="test-input"
          name="test"
          required
          maxLength={10}
        />
      );

      const input = screen.getByPlaceholderText('Input');
      expect(input).toHaveAttribute('id', 'test-input');
      expect(input).toHaveAttribute('name', 'test');
      expect(input).toBeRequired();
      expect(input).toHaveAttribute('maxLength', '10');
    });

    it('deve aplicar value controlado', () => {
      render(<Input value="Valor controlado" onChange={() => {}} />);

      const input = screen.getByDisplayValue('Valor controlado');
      expect(input).toHaveValue('Valor controlado');
    });
  });
});
