import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { cn } from '../../utils/cn';

const ToastContext = React.createContext(null);

export const useToast = () => {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export function ToastProvider({ children }) {
  const [open, setOpen] = React.useState(false);
  const [toast, setToast] = React.useState({ title: '', description: '', variant: 'default' });

  const show = (payload) => {
    setToast(payload);
    setOpen(true);
  };

  return (
    <ToastContext.Provider value={{ show }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        <ToastPrimitive.Root
          className={cn('fixed bottom-4 right-4 z-50 rounded-2xl border bg-card p-4 shadow-lg')}
          open={open}
          onOpenChange={setOpen}
        >
          {toast.title && <ToastPrimitive.Title className="font-semibold">{toast.title}</ToastPrimitive.Title>}
          {toast.description && (
            <ToastPrimitive.Description className="text-sm text-muted-foreground">
              {toast.description}
            </ToastPrimitive.Description>
          )}
        </ToastPrimitive.Root>
        <ToastPrimitive.Viewport className="fixed bottom-0 right-0 flex max-h-screen w-full flex-col-reverse p-4 sm:max-w-[420px]" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}


