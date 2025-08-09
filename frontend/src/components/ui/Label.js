import * as React from 'react';
import * as RadixLabel from '@radix-ui/react-label';
import { cn } from '../../utils/cn';

const Label = React.forwardRef(({ className, required, children, ...props }, ref) => (
  <RadixLabel.Root
    ref={ref}
    className={cn(
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className
    )}
    {...props}
  >
    {children}
    {required && <span className="ml-0.5 text-destructive" aria-hidden>*</span>}
  </RadixLabel.Root>
));

Label.displayName = 'Label';

export default Label;


