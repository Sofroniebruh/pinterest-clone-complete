import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui-components/ui/dialog';
import React from 'react';

interface Props {
  triggerButton: React.ReactNode,
  title: string,
  description?: string,
  children: React.ReactNode,
  className?: string,
  classNameForTriggerButton?: string,
  openState?: boolean,
}

export const DialogComponent = ({
                                  triggerButton,
                                  title,
                                  description,
                                  children,
                                  className,
                                  openState,
                                  classNameForTriggerButton,
                                }: Props) => {
  return (
    <Dialog open={openState}>
      <DialogTrigger className={classNameForTriggerButton}>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};