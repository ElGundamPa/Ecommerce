import * as React from 'react';
import { useForm as useHookForm, FormProvider as RHFProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '../../utils/cn';
import Label from './Label';

export function useForm({ schema, defaultValues }) {
  return useHookForm({ resolver: schema ? zodResolver(schema) : undefined, defaultValues, mode: 'onBlur' });
}

export function FormProvider({ children, methods, onSubmit, className }) {
  return (
    <RHFProvider {...methods}>
      <form onSubmit={onSubmit} className={cn('space-y-6', className)}>
        {children}
      </form>
    </RHFProvider>
  );
}

export function FormField({ name, label, required, children, error }) {
  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name} required={required}>
          {label}
        </Label>
      )}
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}


