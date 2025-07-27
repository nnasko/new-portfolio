'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName: string;
  itemType: 'client' | 'invoice' | 'legal document';
  isLoading?: boolean;
  cascadeInfo?: {
    invoiceCount?: number;
    legalDocumentCount?: number;
  };
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  itemType,
  isLoading = false,
  cascadeInfo
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500" />
            </div>
            <div>
              <DialogTitle className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                {title}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <DialogDescription className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            {description}
          </DialogDescription>
          
          <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-md border border-neutral-200 dark:border-neutral-700">
            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
              {itemType === 'client' ? 'Client:' : itemType === 'invoice' ? 'Invoice:' : 'Document:'} {itemName}
            </div>
            
            {cascadeInfo && itemType === 'client' && (
              <div className="text-xs text-neutral-500 dark:text-neutral-400 space-y-1 mt-2">
                {(cascadeInfo.invoiceCount || 0) > 0 && (
                  <div className="text-red-600 dark:text-red-400">
                    • {cascadeInfo.invoiceCount} invoice{cascadeInfo.invoiceCount !== 1 ? 's' : ''} will also be deleted
                  </div>
                )}
                {(cascadeInfo.legalDocumentCount || 0) > 0 && (
                  <div className="text-red-600 dark:text-red-400">
                    • {cascadeInfo.legalDocumentCount} legal document{cascadeInfo.legalDocumentCount !== 1 ? 's' : ''} will also be deleted
                  </div>
                )}
              </div>
            )}
          </div>
          
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3">
            This action cannot be undone.
          </p>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 text-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-4 py-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 