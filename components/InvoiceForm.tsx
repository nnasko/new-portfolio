'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { format } from "date-fns";

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

interface InvoiceData {
  date: string;
  dueDate: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  items: InvoiceItem[];
  notes: string | null;
}

const webDesignServices = [
  'website design & development',
  'ui/ux design',
  'responsive design implementation',
  'website maintenance',
  'custom feature development',
  'performance optimization',
  'seo implementation',
  'website analytics setup',
];

const defaultInvoiceData: InvoiceData = {
  date: new Date().toISOString(),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  clientName: '',
  clientEmail: '',
  clientAddress: '',
  items: [{ description: webDesignServices[0], quantity: 1, price: 0 }],
  notes: '',
};

export function InvoiceForm() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(defaultInvoiceData);
  const [showCalendar, setShowCalendar] = useState<'date' | 'dueDate' | null>(null);
  const [successDialog, setSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const addItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, { description: webDesignServices[0], quantity: 1, price: 0 }],
    });
  };

  const removeItem = (index: number) => {
    setInvoiceData({
      ...invoiceData,
      items: invoiceData.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...invoiceData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const calculateTotal = () => {
    return invoiceData.items.reduce((total, item) => total + item.quantity * item.price, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/invoice/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate invoice');
      }

      // Reset form and show success dialog
      setInvoiceData(defaultInvoiceData);
      setSuccessMessage(`Invoice ${result.data.invoice.invoiceNumber} has been generated and sent to ${invoiceData.clientEmail}. a copy has been sent to your email as well.`);
      setSuccessDialog(true);
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate invoice. Please try again.');
    }
  };

  const handleDateSelect = (date: Date | undefined, type: 'date' | 'dueDate') => {
    if (date) {
      setInvoiceData(prev => ({
        ...prev,
        [type]: date.toISOString()
      }));
      setShowCalendar(null);
    }
  };

  return (
    <>
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onSubmit={handleSubmit}
        className="space-y-12 max-w-4xl mx-auto"
      >
        {/* Header Section */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h2 className="text-sm font-medium text-neutral-500 mb-1">invoice number</h2>
            <p className="text-lg font-mono lowercase text-neutral-400">generated on submission</p>
          </div>
          <div className="text-right space-y-4">
            <div>
              <h2 className="text-sm font-medium text-neutral-500 mb-1">date</h2>
              <button
                type="button"
                onClick={() => setShowCalendar('date')}
                className="text-right bg-transparent p-0 text-lg hover:text-neutral-700 dark:hover:text-neutral-300 lowercase"
              >
                {format(new Date(invoiceData.date), 'PPP')}
              </button>
            </div>
            <div>
              <h2 className="text-sm font-medium text-neutral-500 mb-1">due date</h2>
              <button
                type="button"
                onClick={() => setShowCalendar('dueDate')}
                className="text-right bg-transparent p-0 text-lg hover:text-neutral-700 dark:hover:text-neutral-300 lowercase"
              >
                {format(new Date(invoiceData.dueDate), 'PPP')}
              </button>
            </div>
          </div>
        </div>

        {/* Client Details */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium border-b pb-2 lowercase">client information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              placeholder="Client Name"
              value={invoiceData.clientName}
              onChange={(e) => setInvoiceData({ ...invoiceData, clientName: e.target.value })}
              className="w-full p-2 bg-transparent border-b border-neutral-200 dark:border-neutral-800 focus:border-neutral-500 focus:ring-0"
              required
            />
            <input
              type="email"
              placeholder="Client Email"
              value={invoiceData.clientEmail}
              onChange={(e) => setInvoiceData({ ...invoiceData, clientEmail: e.target.value })}
              className="w-full p-2 bg-transparent border-b border-neutral-200 dark:border-neutral-800 focus:border-neutral-500 focus:ring-0"
              required
            />
          </div>
          <textarea
            placeholder="Client Address"
            value={invoiceData.clientAddress}
            onChange={(e) => setInvoiceData({ ...invoiceData, clientAddress: e.target.value })}
            className="w-full p-2 bg-transparent border-b border-neutral-200 dark:border-neutral-800 focus:border-neutral-500 focus:ring-0"
            rows={2}
            required
          />
        </div>

        {/* Items */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium border-b pb-2 lowercase">services</h3>
          {invoiceData.items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-12 gap-4 items-center"
            >
              <div className="col-span-6">
                <select
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  className="w-full p-2 bg-transparent border-b border-neutral-200 dark:border-neutral-800 focus:border-neutral-500 focus:ring-0"
                  required
                >
                  {webDesignServices.map((service) => (
                    <option key={service} value={service} className="bg-neutral-100 dark:bg-neutral-800">
                      {service}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                  className="w-full p-2 bg-transparent border-b border-neutral-200 dark:border-neutral-800 focus:border-neutral-500 focus:ring-0"
                  min="1"
                  required
                />
              </div>
              <div className="col-span-3">
                <div className="relative">
                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-500">£</span>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                    className="w-full p-2 pl-6 bg-transparent border-b border-neutral-200 dark:border-neutral-800 focus:border-neutral-500 focus:ring-0"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div className="col-span-1 text-right">
                {invoiceData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-neutral-400 hover:text-red-500 transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
          >
            + add service
          </button>
        </div>

        {/* Total */}
        <div className="border-t pt-4">
          <div className="text-right text-2xl font-light">
            total £{calculateTotal().toFixed(2)}
          </div>
        </div>

        {/* Notes */}
        <div>
          <textarea
            placeholder="Additional Notes..."
            value={invoiceData.notes || ''}
            onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value as string | null })}
            className="w-full p-2 bg-transparent border-b border-neutral-200 dark:border-neutral-800 focus:border-neutral-500 focus:ring-0"
            rows={3}
          />
        </div>

        {/* Bank Details */}
        <div className="space-y-2 text-sm text-neutral-500">
          <h3 className="font-medium text-neutral-700 dark:text-neutral-300 lowercase">payment details</h3>
          <p>{process.env.NEXT_PUBLIC_BANK_NAME}</p>
          <p>account: {process.env.NEXT_PUBLIC_ACCOUNT_NAME}</p>
          <p>number: {process.env.NEXT_PUBLIC_ACCOUNT_NUMBER}</p>
          <p>sort code: {process.env.NEXT_PUBLIC_SORT_CODE}</p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-4 py-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            generate invoice
          </button>
        </div>
      </motion.form>

      {/* Date Selection Dialog */}
      <Dialog open={showCalendar !== null} onOpenChange={() => setShowCalendar(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="lowercase">select {showCalendar === 'date' ? 'invoice date' : 'due date'}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <Calendar
              mode="single"
              selected={new Date(showCalendar === 'date' ? invoiceData.date : invoiceData.dueDate)}
              onSelect={(date) => handleDateSelect(date, showCalendar as 'date' | 'dueDate')}
              className="rounded-md border"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successDialog} onOpenChange={setSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="lowercase">invoice generated successfully</DialogTitle>
            <DialogDescription>
              {successMessage}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
} 