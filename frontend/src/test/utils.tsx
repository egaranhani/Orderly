import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { User } from '@/types/user.types';
import { vi } from 'vitest';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface AllTheProvidersProps {
  children: React.ReactNode;
  token?: string | null;
  user?: User | null;
}

const AllTheProviders = ({
  children,
  token = 'test-token',
  user = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    workspaceDomain: 'test.orderlyai.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
}: AllTheProvidersProps) => {
  const queryClient = createTestQueryClient();

  if (token && user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    token?: string | null;
    user?: User | null;
  }
) => {
  const { token, user, ...renderOptions } = options || {};
  return render(ui, {
    wrapper: (props) => (
      <AllTheProviders {...props} token={token} user={user} />
    ),
    ...renderOptions,
  });
};

export * from '@testing-library/react';
export { customRender as render };
