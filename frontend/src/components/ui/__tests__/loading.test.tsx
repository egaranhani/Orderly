import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { Loading } from '../loading';

describe('Loading', () => {
  describe('Renderização', () => {
    it('deve renderizar componente de loading', () => {
      const { container } = render(<Loading />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('deve aplicar className customizada', () => {
      const { container } = render(<Loading className="custom-loading" />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-loading');
    });
  });

  describe('Tamanhos', () => {
    it('deve aplicar tamanho sm por padrão', () => {
      const { container } = render(<Loading size="sm" />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toHaveClass('h-4', 'w-4');
    });

    it('deve aplicar tamanho md (padrão)', () => {
      const { container } = render(<Loading />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toHaveClass('h-8', 'w-8');
    });

    it('deve aplicar tamanho lg', () => {
      const { container } = render(<Loading size="lg" />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toHaveClass('h-12', 'w-12');
    });
  });

  describe('Estrutura', () => {
    it('deve ter estrutura correta com wrapper e spinner', () => {
      const { container } = render(<Loading />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center');

      const spinner = wrapper.querySelector('.animate-spin');
      expect(spinner).toHaveClass(
        'animate-spin',
        'rounded-full',
        'border-2',
        'border-muted',
        'border-t-primary'
      );
    });
  });
});
