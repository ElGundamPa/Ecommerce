import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary, { QueryErrorBoundary } from '../ErrorBoundary';

// Componente que lanza error para testing
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Mock de console.error para evitar logs en tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  test('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  test('should render error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('¡Oops! Algo salió mal')).toBeInTheDocument();
    expect(screen.getByText(/Ha ocurrido un error inesperado/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /intentar de nuevo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ir al inicio/i })).toBeInTheDocument();
  });

  test('should render custom message when provided', () => {
    const customMessage = 'Custom error message';
    
    render(
      <ErrorBoundary message={customMessage}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  test('should call retry function when retry button is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /intentar de nuevo/i });
    fireEvent.click(retryButton);

    // Después del retry, debería renderizar el componente sin error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  test('should render custom fallback when provided', () => {
    const customFallback = (error, retry) => (
      <div>
        <p>Custom fallback UI</p>
        <button onClick={retry}>Custom retry</button>
      </div>
    );

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom fallback UI')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Custom retry' })).toBeInTheDocument();
  });

  test('should show error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/detalles del error/i)).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });
});

describe('QueryErrorBoundary', () => {
  test('should render children when there is no error', () => {
    render(
      <QueryErrorBoundary>
        <ThrowError shouldThrow={false} />
      </QueryErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  test('should render default error UI when there is an error', () => {
    render(
      <QueryErrorBoundary>
        <ThrowError shouldThrow={true} />
      </QueryErrorBoundary>
    );

    expect(screen.getByText('Error al cargar los datos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
  });

  test('should render custom fallback when provided', () => {
    const customFallback = () => <div>Custom query error</div>;

    render(
      <QueryErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </QueryErrorBoundary>
    );

    expect(screen.getByText('Custom query error')).toBeInTheDocument();
  });
});
