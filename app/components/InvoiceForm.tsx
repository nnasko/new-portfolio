"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { format, addDays } from "date-fns";
// Imports for Combobox
import * as React from "react"
import { Check, ChevronsUpDown, Calendar as CalendarIcon, Trash2, PlusCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Client Interface (placeholder for now)
interface Client {
  id: string;
  name: string;
  email: string;
  address: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

interface InvoiceData {
  date: string;
  dueDate: string;
  clientId: string; // Changed from name/email/address to clientId
  items: InvoiceItem[];
  notes: string | null;
}

interface ApiResponse {
  success: boolean;
  data?: {
    invoice: {
      invoiceNumber: string;
      clientEmail: string;
    };
    emailData: {
      id: string;
    };
  };
  error?: string;
  warning?: string;
}

interface FormErrors {
  clientId?: string;
  items?: string;
  general?: string;
}

const webDesignServices = [
  "website design & development",
  "ui/ux design",
  "responsive design implementation",
  "website maintenance",
  "custom feature development",
  "performance optimization",
  "seo implementation",
  "website analytics setup",
  "content creation",
  "email template design",
];

const defaultInvoiceData: InvoiceData = {
  date: new Date().toISOString(),
  dueDate: addDays(new Date(), 30).toISOString(),
  clientId: "", // Default clientId
  items: [{ description: webDesignServices[0], quantity: 1, price: 0 }],
  notes: "",
};

export function InvoiceForm() {
  const [invoiceData, setInvoiceData] =
    useState<InvoiceData>(defaultInvoiceData);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showCalendar, setShowCalendar] = useState<"date" | "dueDate" | null>(
    null
  );
  const [successDialog, setSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientsError, setClientsError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  // State for Combobox Popover
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Fetch clients on mount
  useEffect(() => {
    const fetchClients = async () => {
      setClientsLoading(true);
      setClientsError(null);
      try {
        const response = await fetch('/api/clients/list');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'failed to fetch clients');
        }
        const data = await response.json();
        setClients(data.clients || []);
      } catch (error) {
        console.error("Error fetching clients:", error);
        const message = error instanceof Error ? error.message : 'failed to load client list.';
        setClientsError(message);
        // Use formErrors instead of alert
        setFormErrors(prev => ({ ...prev, general: `failed to load client list: ${message}` }));
      } finally {
        setClientsLoading(false);
      }
    };
    fetchClients();
  }, []);

  // Update selectedClient when clientId changes in invoiceData
  useEffect(() => {
    const client = clients.find(c => c.id === invoiceData.clientId);
    setSelectedClient(client || null);
    
    // Clear client error when client is selected
    if (invoiceData.clientId && formErrors.clientId) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated.clientId;
        return updated;
      });
    }
  }, [invoiceData.clientId, clients, formErrors.clientId]);

  const addItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [
        ...invoiceData.items,
        { description: webDesignServices[0], quantity: 1, price: 0 },
      ],
    });
  };

  const removeItem = (index: number) => {
    if (invoiceData.items.length === 1) {
      setFormErrors(prev => ({ ...prev, items: "at least one service item is required" }));
      return;
    }
    
    setInvoiceData({
      ...invoiceData,
      items: invoiceData.items.filter((_, i) => i !== index),
    });
    
    // Clear items error when we still have items
    if (formErrors.items && invoiceData.items.length > 1) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated.items;
        return updated;
      });
    }
  };

  const updateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const newItems = [...invoiceData.items];
    let processedValue = value;

    // Handle price specifically to avoid NaN
    if (field === 'price') {
      const parsedPrice = typeof value === 'string' ? parseFloat(value) : value;
      // If parsing fails or results in NaN, set to 0
      processedValue = isNaN(parsedPrice) ? 0 : parsedPrice;
    } else if (field === 'quantity') {
      const parsedQuantity = typeof value === 'string' ? parseInt(value, 10) : value;
      // Ensure quantity is at least 1, default to 1 if NaN or less than 1
      processedValue = isNaN(parsedQuantity) || parsedQuantity < 1 ? 1 : parsedQuantity;
    }

    newItems[index] = {
      ...newItems[index],
      // Use the processed value
      [field]: processedValue,
    };
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const calculateTotal = () => {
    return invoiceData.items.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!invoiceData.clientId) {
      errors.clientId = "please select a client";
    }
    
    // Check if at least one item has a price > 0
    const hasValidItems = invoiceData.items.some(item => item.price > 0);
    if (!hasValidItems) {
      errors.items = "at least one service must have a price greater than 0";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      const response = await fetch("/api/invoice/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      });

      const result: ApiResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || "failed to generate invoice");
      }

      // Reset form and show success dialog
      setInvoiceData(defaultInvoiceData);
      // Update success message to use selected client's email
      setSuccessMessage(
        `invoice ${
          result.data!.invoice.invoiceNumber
        } has been generated and sent to ${
          selectedClient?.email
        }. a copy has been sent to your email as well.`
      );
      setSuccessDialog(true);
    } catch (error) {
      console.error("Error:", error);
      setFormErrors({
        general: error instanceof Error
          ? error.message
          : "failed to generate invoice. please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateSelect = (
    date: Date | undefined,
    type: "date" | "dueDate"
  ) => {
    if (date) {
      setInvoiceData((prev) => ({
        ...prev,
        [type]: date.toISOString(),
      }));
      setShowCalendar(null);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* General Error Banner */}
        {formErrors.general && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-300 p-4 mb-6 flex items-start"
          >
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm lowercase">{formErrors.general}</p>
          </motion.div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Invoice Details Card */}
          <div className="bg-neutral-100 dark:bg-neutral-800 p-6 shadow-sm">
            <h2 className="text-lg font-medium lowercase mb-4 border-b pb-2 border-neutral-200 dark:border-neutral-700">
              invoice details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-500 lowercase block">
                  invoice number
                </label>
                <p className="text-lg font-mono lowercase text-neutral-400 pl-1">
                  generated on submission
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-500 lowercase block">
                    date
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCalendar("date")}
                    className="flex items-center w-full border-b border-neutral-200 dark:border-neutral-700 p-2 text-left hover:bg-neutral-200/30 dark:hover:bg-neutral-700/30 rounded-sm transition-colors"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                    <span className="lowercase">
                      {format(new Date(invoiceData.date), "PPP").toLowerCase()}
                    </span>
                  </button>
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-500 lowercase block">
                    due date
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCalendar("dueDate")}
                    className="flex items-center w-full border-b border-neutral-200 dark:border-neutral-700 p-2 text-left hover:bg-neutral-200/30 dark:hover:bg-neutral-700/30 rounded-sm transition-colors"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                    <span className="lowercase">
                      {format(new Date(invoiceData.dueDate), "PPP").toLowerCase()}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Client Card */}
          <div className="bg-neutral-100 dark:bg-neutral-800 p-6 shadow-sm">
            <h2 className="text-lg font-medium lowercase mb-4 border-b pb-2 border-neutral-200 dark:border-neutral-700">
              client information
            </h2>
            
            <div className="space-y-4">
              {/* --- Client Combobox --- */}
              {clientsLoading ? (
                <div className="animate-pulse bg-neutral-200 dark:bg-neutral-700 h-10 w-full rounded-sm"></div>
              ) : clientsError ? (
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-300 p-3 text-sm lowercase rounded-sm">
                  error loading clients: {clientsError}
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-500 lowercase block">
                    select client
                  </label>
                  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={popoverOpen}
                        className={`w-full justify-between lowercase font-normal border-b border-neutral-200 dark:border-neutral-700 bg-transparent rounded-sm hover:bg-neutral-200/30 dark:hover:bg-neutral-700/30 px-3 py-2 text-left h-auto ${formErrors.clientId ? 'border-red-500 dark:border-red-500 text-red-500 dark:text-red-400' : ''}`}
                      >
                        {invoiceData.clientId
                          ? clients.find((client) => client.id === invoiceData.clientId)?.name
                          : "select client..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-[--radix-popover-trigger-width] p-0 rounded-sm border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800" 
                      align="start"
                    >
                      <Command className="bg-transparent">
                        <CommandInput placeholder="search clients..." className="h-9 border-b rounded-none focus:ring-0 focus:border-neutral-500 dark:focus:border-neutral-400" />
                        <CommandList>
                          <CommandEmpty className="p-2 text-sm text-neutral-500">no clients found</CommandEmpty>
                          <CommandGroup>
                            {clients.map((client) => (
                              <CommandItem
                                key={client.id}
                                value={client.id}
                                onSelect={(currentValue: string) => {
                                  setInvoiceData({ ...invoiceData, clientId: currentValue === invoiceData.clientId ? "" : currentValue });
                                  setPopoverOpen(false);
                                }}
                                className="lowercase aria-selected:bg-neutral-100 dark:aria-selected:bg-neutral-700"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    invoiceData.clientId === client.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {client.name} ({client.email})
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  
                  {formErrors.clientId && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1 pl-1 lowercase">
                      {formErrors.clientId}
                    </p>
                  )}
                </div>
              )}
              
              {/* Display selected client details (read-only) */}
              {selectedClient && (
                <div className="mt-4 p-4 bg-neutral-200/50 dark:bg-neutral-700/30 rounded-sm space-y-2">
                  <h3 className="text-sm font-medium lowercase">selected client</h3>
                  <div className="text-sm space-y-1 text-neutral-700 dark:text-neutral-300">
                    <p className="lowercase">{selectedClient.name}</p>
                    <p className="lowercase">{selectedClient.email}</p>
                    <p className="lowercase whitespace-pre-line">{selectedClient.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Services Card */}
          <div className="bg-neutral-100 dark:bg-neutral-800 p-6 shadow-sm">
            <h2 className="text-lg font-medium lowercase mb-4 border-b pb-2 border-neutral-200 dark:border-neutral-700">
              services
            </h2>
            
            {formErrors.items && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-300 p-3 mb-4 text-sm lowercase rounded-sm">
                {formErrors.items}
              </div>
            )}
            
            <div className="space-y-6">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-neutral-500 lowercase pb-2">
                <div className="col-span-6">description</div>
                <div className="col-span-2">quantity</div>
                <div className="col-span-3">price</div>
                <div className="col-span-1"></div>
              </div>
              
              {invoiceData.items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-12 gap-4 items-center"
                >
                  <div className="col-span-6">
                    <select
                      value={item.description}
                      onChange={(e) => updateItem(index, "description", e.target.value)}
                      className="w-full p-2 bg-transparent border-b border-neutral-200 dark:border-neutral-700 focus:border-neutral-500 dark:focus:border-neutral-400 focus:ring-0 lowercase rounded-sm"
                      required
                    >
                      {webDesignServices.map((service) => (
                        <option
                          key={service}
                          value={service}
                          className="bg-neutral-100 dark:bg-neutral-800 lowercase"
                        >
                          {service}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value))}
                      className="w-full p-2 bg-transparent border-b border-neutral-200 dark:border-neutral-700 focus:border-neutral-500 dark:focus:border-neutral-400 focus:ring-0 rounded-sm"
                      min="1"
                      required
                    />
                  </div>
                  <div className="col-span-3">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-500">
                        £
                      </span>
                      <input
                        type="number"
                        value={item.price === 0 ? '' : item.price}
                        onChange={(e) => updateItem(index, "price", e.target.value)}
                        className="w-full p-2 pl-6 bg-transparent border-b border-neutral-200 dark:border-neutral-700 focus:border-neutral-500 dark:focus:border-neutral-400 focus:ring-0 rounded-sm"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                      title="remove item"
                      disabled={invoiceData.items.length === 1}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
              
              <button
                type="button"
                onClick={addItem}
                className="flex items-center text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors lowercase p-2 rounded-sm hover:bg-neutral-200/30 dark:hover:bg-neutral-700/30"
              >
                <PlusCircle size={16} className="mr-2" />
                add service
              </button>
              
              {/* Total */}
              <div className="border-t pt-4 border-neutral-200 dark:border-neutral-700 flex justify-end">
                <div className="text-right">
                  <span className="block text-sm text-neutral-500 lowercase mb-1">total</span>
                  <span className="text-2xl font-light lowercase">£{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Notes Card */}
          <div className="bg-neutral-100 dark:bg-neutral-800 p-6 shadow-sm">
            <h2 className="text-lg font-medium lowercase mb-4 border-b pb-2 border-neutral-200 dark:border-neutral-700">
              additional notes
            </h2>
            
            <textarea
              placeholder="add any notes that should appear on the invoice..."
              value={invoiceData.notes || ""}
              onChange={(e) => setInvoiceData({
                ...invoiceData,
                notes: e.target.value as string | null,
              })}
              className="w-full p-3 bg-transparent border border-neutral-200 dark:border-neutral-700 focus:border-neutral-500 dark:focus:border-neutral-400 focus:ring-0 lowercase rounded-sm min-h-[100px]"
            />
          </div>
          
          {/* Payment Details Card */}
          <div className="bg-neutral-100 dark:bg-neutral-800 p-6 shadow-sm">
            <h2 className="text-lg font-medium lowercase mb-4 border-b pb-2 border-neutral-200 dark:border-neutral-700">
              payment details
            </h2>
            
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <span className="text-neutral-500 lowercase">bank:</span>
                  <span className="ml-2">{process.env.NEXT_PUBLIC_BANK_NAME}</span>
                </div>
                <div>
                  <span className="text-neutral-500 lowercase">account:</span>
                  <span className="ml-2">{process.env.NEXT_PUBLIC_ACCOUNT_NAME}</span>
                </div>
                <div>
                  <span className="text-neutral-500 lowercase">number:</span>
                  <span className="ml-2">{process.env.NEXT_PUBLIC_ACCOUNT_NUMBER}</span>
                </div>
                <div>
                  <span className="text-neutral-500 lowercase">sort code:</span>
                  <span className="ml-2">{process.env.NEXT_PUBLIC_SORT_CODE}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors lowercase
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isSubmitting ? 'generating...' : 'generate invoice'}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Date Selection Dialog */}
      <Dialog
        open={showCalendar !== null}
        onOpenChange={() => setShowCalendar(null)}
      >
        <DialogContent className="rounded-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-lg">
          <DialogHeader>
            <DialogTitle className="lowercase">
              select {showCalendar === "date" ? "invoice date" : "due date"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <Calendar
              mode="single"
              selected={
                new Date(
                  showCalendar === "date"
                    ? invoiceData.date
                    : invoiceData.dueDate
                )
              }
              onSelect={(date) =>
                handleDateSelect(date, showCalendar as "date" | "dueDate")
              }
              className="border border-neutral-200 dark:border-neutral-700 rounded-sm"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successDialog} onOpenChange={setSuccessDialog}>
        <DialogContent className="rounded-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-lg">
          <DialogHeader>
            <DialogTitle className="lowercase text-green-600 dark:text-green-400">
              invoice generated successfully
            </DialogTitle>
            <DialogDescription className="lowercase pt-2">{successMessage}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-4">
            <Button 
              onClick={() => setSuccessDialog(false)}
              className="bg-neutral-800 hover:bg-neutral-700 dark:bg-neutral-200 dark:hover:bg-neutral-300 text-white dark:text-neutral-800 lowercase rounded-sm"
            >
              close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
