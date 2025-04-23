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
import { format } from "date-fns";
// Imports for Combobox
import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
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

const webDesignServices = [
  "website design & development",
  "ui/ux design",
  "responsive design implementation",
  "website maintenance",
  "custom feature development",
  "performance optimization",
  "seo implementation",
  "website analytics setup",
];

const defaultInvoiceData: InvoiceData = {
  date: new Date().toISOString(),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
        alert(`failed to load client list: ${message}`);
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
  }, [invoiceData.clientId, clients]);

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
    setInvoiceData({
      ...invoiceData,
      items: invoiceData.items.filter((_, i) => i !== index),
    });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add check for selected client
    if (!invoiceData.clientId) {
      alert("please select a client.");
      return;
    }

    try {
      const response = await fetch("/api/invoice/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData), // invoiceData now contains clientId
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
          selectedClient?.email // Use selected client's email here
        }. a copy has been sent to your email as well.`
      );
      setSuccessDialog(true);
    } catch (error) {
      console.error("Error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "failed to generate invoice. please try again."
      );
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
            <h2 className="text-sm font-medium text-neutral-500 mb-1 lowercase">
              invoice number
            </h2>
            <p className="text-lg font-mono lowercase text-neutral-400">
              generated on submission
            </p>
          </div>
          <div className="text-right space-y-4">
            <div>
              <h2 className="text-sm font-medium text-neutral-500 mb-1 lowercase">
                date
              </h2>
              <button
                type="button"
                onClick={() => setShowCalendar("date")}
                className="text-right bg-transparent p-0 text-lg hover:text-neutral-700 dark:hover:text-neutral-300 lowercase font-light"
              >
                {format(new Date(invoiceData.date), "PPP").toLowerCase()}
              </button>
            </div>
            <div>
              <h2 className="text-sm font-medium text-neutral-500 mb-1 lowercase">
                due date
              </h2>
              <button
                type="button"
                onClick={() => setShowCalendar("dueDate")}
                className="text-right bg-transparent p-0 text-lg hover:text-neutral-700 dark:hover:text-neutral-300 lowercase font-light"
              >
                {format(new Date(invoiceData.dueDate), "PPP").toLowerCase()}
              </button>
            </div>
          </div>
        </div>

        {/* Client Details */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium border-b pb-2 lowercase border-neutral-200 dark:border-neutral-800">
            client information
          </h3>
          <div className="grid grid-cols-1 gap-6">
             {/* --- Client Combobox --- */}
             {clientsLoading && <p className="text-neutral-500 lowercase p-2">loading clients...</p>}
             {clientsError && <p className="text-red-500 lowercase p-2">error loading clients: {clientsError}</p>}
             {!clientsLoading && !clientsError && (
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={popoverOpen}
                      // Style the trigger button
                      className="w-full justify-between lowercase font-normal border-b border-neutral-200 dark:border-neutral-700 bg-transparent rounded-none hover:bg-neutral-100 dark:hover:bg-neutral-800 px-3 py-2 text-left h-auto"
                    >
                      {invoiceData.clientId
                        ? clients.find((client) => client.id === invoiceData.clientId)?.name
                        : "select client..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                     // Style popover content
                     className="w-[--radix-popover-trigger-width] p-0 rounded-none border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800" 
                     align="start"
                     avoidCollisions={false} // Prevent potential flip on scroll
                  >
                    <Command className="bg-transparent">
                      <CommandInput placeholder="search client..." className="h-9 border-b rounded-none focus:ring-0 focus:border-neutral-500 dark:focus:border-neutral-400" />
                      <CommandList>
                         <CommandEmpty className="p-2 text-sm text-neutral-500">no client found.</CommandEmpty>
                         <CommandGroup>
                          {clients.map((client) => (
                            <CommandItem
                              key={client.id}
                              value={client.id} // Use ID for value
                              onSelect={(currentValue: string) => {
                                // Set clientId in form data
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
             )}
             {/* --- End Client Combobox --- */}
            
             {/* Display selected client details (read-only) */}
             {selectedClient && (
               <div className="text-sm text-neutral-500 space-y-1 mt-2 pl-2 border-l-2 border-neutral-200 dark:border-neutral-700">
                 <p className="lowercase">address: {selectedClient.address}</p>
               </div>
             )}
          </div>
        </div>

        {/* Items */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium border-b pb-2 lowercase border-neutral-200 dark:border-neutral-800">
            services
          </h3>
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
                  onChange={(e) =>
                    updateItem(index, "description", e.target.value)
                  }
                  className="w-full p-2 bg-transparent border-b border-neutral-200 dark:border-neutral-800 focus:border-neutral-500 dark:focus:border-neutral-400 focus:ring-0 lowercase"
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
                  onChange={(e) =>
                    updateItem(index, "quantity", parseInt(e.target.value))
                  }
                  className="w-full p-2 bg-transparent border-b border-neutral-200 dark:border-neutral-800 focus:border-neutral-500 dark:focus:border-neutral-400 focus:ring-0"
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
                    onChange={(e) =>
                      updateItem(index, "price", e.target.value)
                    }
                    className="w-full p-2 pl-6 bg-transparent border-b border-neutral-200 dark:border-neutral-800 focus:border-neutral-500 dark:focus:border-neutral-400 focus:ring-0"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div className="col-span-1 text-right">
                {invoiceData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-neutral-400 hover:text-red-500 transition-colors text-lg"
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
            className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors lowercase"
          >
            + add service
          </button>
        </div>

        {/* Total */}
        <div className="border-t pt-4 border-neutral-200 dark:border-neutral-800">
          <div className="text-right text-2xl font-light lowercase">
            total £{calculateTotal().toFixed(2)}
          </div>
        </div>

        {/* Notes */}
        <div>
          <textarea
            placeholder="additional notes..."
            value={invoiceData.notes || ""}
            onChange={(e) =>
              setInvoiceData({
                ...invoiceData,
                notes: e.target.value as string | null,
              })
            }
            className="w-full p-2 bg-transparent border-b border-neutral-200 dark:border-neutral-800 focus:border-neutral-500 dark:focus:border-neutral-400 focus:ring-0 lowercase"
            rows={3}
          />
        </div>

        {/* Bank Details */}
        <div className="space-y-2 text-sm text-neutral-500">
          <h3 className="font-medium text-neutral-700 dark:text-neutral-300 lowercase">
            payment details
          </h3>
          <p>{process.env.NEXT_PUBLIC_BANK_NAME}</p>
          <p>account: {process.env.NEXT_PUBLIC_ACCOUNT_NAME}</p>
          <p>number: {process.env.NEXT_PUBLIC_ACCOUNT_NUMBER}</p>
          <p>sort code: {process.env.NEXT_PUBLIC_SORT_CODE}</p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="border border-neutral-300 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors lowercase"
          >
            generate invoice
          </button>
        </div>
      </motion.form>

      {/* Date Selection Dialog */}
      <Dialog
        open={showCalendar !== null}
        onOpenChange={() => setShowCalendar(null)}
      >
        <DialogContent className="rounded-none bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
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
              className="border border-neutral-200 dark:border-neutral-700"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successDialog} onOpenChange={setSuccessDialog}>
        <DialogContent className="rounded-none bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <DialogHeader>
            <DialogTitle className="lowercase">
              invoice generated successfully
            </DialogTitle>
            <DialogDescription className="lowercase">{successMessage}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
