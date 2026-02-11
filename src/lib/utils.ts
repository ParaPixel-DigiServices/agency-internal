import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats database error messages into user-friendly messages
 */
export function formatDatabaseError(error: {
  message: string;
  code?: string;
}): string {
  const message = error.message.toLowerCase();

  // UUID validation errors
  if (message.includes("invalid input syntax for type uuid")) {
    if (message.includes('""')) {
      return "Please select a valid option from the dropdown";
    }
    return "Invalid ID format. Please select from the available options";
  }

  // Foreign key constraint errors
  if (
    message.includes("foreign key constraint") ||
    message.includes("violates foreign key")
  ) {
    return "The selected item no longer exists. Please refresh and try again";
  }

  // Not null constraint errors
  if (
    message.includes("null value in column") &&
    message.includes("violates not-null constraint")
  ) {
    const match = message.match(/column "([^"]+)"/);
    const column = match ? match[1].replace("_", " ") : "required field";
    return `${column.charAt(0).toUpperCase() + column.slice(1)} is required`;
  }

  // Unique constraint errors
  if (
    message.includes("duplicate key value") ||
    message.includes("violates unique constraint")
  ) {
    return "This record already exists";
  }

  // Permission errors
  if (
    message.includes("permission denied") ||
    message.includes("insufficient privileges")
  ) {
    return "You do not have permission to perform this action";
  }

  // Default fallback
  return "An error occurred. Please check your input and try again";
}
