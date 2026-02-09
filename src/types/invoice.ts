export interface InvoiceItem {

  id: string;

  description: string;

  quantity: number;

  unit_price: number;

  total: number;

}

export interface Invoice {

  id: string;

  invoice_number: string;

  client_id: string;

  project_id: string;

  amount: number;

  tax: number;

  total: number;

  status: string;

  issue_date: string;

  due_date: string;

  clients?: {
    name: string;
  };

  projects?: {
    name: string;
  };

  items?: InvoiceItem[];

}
