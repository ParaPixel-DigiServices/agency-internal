import { z } from "zod";

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

export const ClientSchema = z.object({
  name: z.string().min(1, "Client name is required").max(200, "Name too long"),
  email: z
    .string()
    .email("Invalid email format")
    .max(255)
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .max(20, "Phone number too long")
    .optional()
    .or(z.literal("")),
  company: z
    .string()
    .max(200, "Company name too long")
    .optional()
    .or(z.literal("")),
  status: z.string().max(50).optional().or(z.literal("")),
});

export const ProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(200, "Name too long"),
  client_id: z
    .string()
    .uuid("Please select a valid client")
    .min(1, "Client is required"),
  budget: z
    .number()
    .nonnegative("Budget must be positive")
    .finite()
    .optional()
    .or(z.literal(0)),
  description: z
    .string()
    .max(1000, "Description too long")
    .optional()
    .or(z.literal("")),
  status: z.string().max(50).optional().or(z.literal("")),
});

export const PaymentSchema = z.object({
  client_id: z.string().uuid("Invalid client ID"),
  project_id: z
    .string()
    .uuid("Invalid project ID")
    .optional()
    .or(z.literal("")),
  amount: z.number().positive("Amount must be positive").finite(),
  method: z.string().max(50).optional().or(z.literal("")),
  payment_date: z.string().optional().or(z.literal("")),
});

export const ExpenseSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  amount: z.number().positive("Amount must be positive").finite(),
  category: z.string().max(100).optional().or(z.literal("")),
  date: z.string().optional().or(z.literal("")),
  notes: z.string().max(5000, "Notes too long").optional().or(z.literal("")),
});

export const InvoiceSchema = z.object({
  client_id: z.string().uuid("Invalid client ID"),
  project_id: z
    .string()
    .uuid("Invalid project ID")
    .optional()
    .or(z.literal("")),
  issue_date: z.string().min(1, "Issue date is required"),
  due_date: z.string().min(1, "Due date is required"),
  status: z.string().max(50).optional().or(z.literal("")),
});

export const InvoiceItemSchema = z.object({
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description too long"),
  quantity: z
    .number()
    .positive("Quantity must be positive")
    .int("Quantity must be whole number"),
  unit_price: z.number().nonnegative("Price cannot be negative").finite(),
});

// Export types
export type ClientInput = z.infer<typeof ClientSchema>;
export type ProjectInput = z.infer<typeof ProjectSchema>;
export type PaymentInput = z.infer<typeof PaymentSchema>;
export type ExpenseInput = z.infer<typeof ExpenseSchema>;
export type InvoiceInput = z.infer<typeof InvoiceSchema>;
export type InvoiceItemInput = z.infer<typeof InvoiceItemSchema>;
