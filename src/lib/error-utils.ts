/**
 * Centralized error sanitizer to prevent leaking technical details to users
 * while preserving useful error messages for debugging (via console.error).
 */

type ErrorContext = 'auth' | 'database' | 'general';

/**
 * Sanitizes error messages to prevent information disclosure.
 * Maps technical errors to user-friendly messages based on context.
 * 
 * @param error - The error object or message
 * @param context - The type of operation that failed
 * @returns A safe, user-friendly error message
 */
export function sanitizeErrorMessage(error: unknown, context: ErrorContext): string {
  const errorStr = getErrorString(error).toLowerCase();
  
  // Auth-specific patterns
  if (context === 'auth') {
    if (errorStr.includes('invalid login') || errorStr.includes('invalid credentials')) {
      return 'Invalid email or password.';
    }
    if (errorStr.includes('email not confirmed')) {
      return 'Please confirm your email address before signing in.';
    }
    if (errorStr.includes('already registered') || errorStr.includes('user already registered')) {
      return 'This email is already registered.';
    }
    if (errorStr.includes('password') && errorStr.includes('weak')) {
      return 'Password is too weak. Please use a stronger password.';
    }
    if (errorStr.includes('rate limit') || errorStr.includes('too many requests')) {
      return 'Too many attempts. Please try again later.';
    }
    return 'Authentication failed. Please try again.';
  }
  
  // Database patterns
  if (context === 'database') {
    if (errorStr.includes('duplicate') || errorStr.includes('unique constraint') || errorStr.includes('already exists')) {
      return 'This record already exists.';
    }
    if (errorStr.includes('foreign key') || errorStr.includes('violates')) {
      return 'Invalid data reference. Please check your information.';
    }
    if (errorStr.includes('permission') || errorStr.includes('policy') || errorStr.includes('not authorized')) {
      return 'You do not have permission to perform this action.';
    }
    if (errorStr.includes('not found')) {
      return 'The requested record was not found.';
    }
    if (errorStr.includes('connection') || errorStr.includes('timeout')) {
      return 'Connection error. Please try again.';
    }
    return 'Database operation failed. Please try again.';
  }
  
  // General context - check for common patterns
  if (errorStr.includes('rate limit') || errorStr.includes('too many')) {
    return 'Too many requests. Please try again later.';
  }
  if (errorStr.includes('network') || errorStr.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }
  if (errorStr.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }
  
  // Generic fallback
  return 'An error occurred. Please try again or contact support.';
}

/**
 * Extracts the error message string from various error types
 */
function getErrorString(error: unknown): string {
  if (!error) return '';
  
  if (typeof error === 'string') return error;
  
  if (error instanceof Error) return error.message;
  
  if (typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  
  return String(error);
}

/**
 * Logs the full error details for debugging while returning a sanitized message.
 * Use this when you want to both log and display the error.
 * 
 * @param error - The error object
 * @param context - The type of operation that failed
 * @param logPrefix - Optional prefix for the console log
 * @returns A safe, user-friendly error message
 */
export function logAndSanitizeError(
  error: unknown, 
  context: ErrorContext, 
  logPrefix: string = 'Error'
): string {
  console.error(`${logPrefix}:`, error);
  return sanitizeErrorMessage(error, context);
}
