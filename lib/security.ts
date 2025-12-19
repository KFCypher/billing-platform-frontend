/**
 * Frontend security utilities for input sanitization and validation
 */

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Escape HTML entities
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && !containsSuspiciousPatterns(email);
}

/**
 * Validate URL format and protocol
 */
export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol) && !containsSuspiciousPatterns(url);
  } catch {
    return false;
  }
}

/**
 * Check for common injection patterns
 */
export function containsSuspiciousPatterns(input: string): boolean {
  const patterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
  ];

  return patterns.some(pattern => pattern.test(input));
}

/**
 * Validate phone number format
 */
export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Validate monetary amount
 */
export function validateAmount(amount: string | number): boolean {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(num) && num >= 0 && num <= 999999999.99;
}

/**
 * Sanitize string input by removing dangerous characters
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  if (input.length > maxLength) {
    throw new Error(`Input exceeds maximum length of ${maxLength}`);
  }

  // Remove null bytes and control characters
  let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
}

/**
 * Validate API key format
 */
export function validateApiKey(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }

  // Check length
  if (apiKey.length < 32 || apiKey.length > 128) {
    return false;
  }

  // Check format (alphanumeric and some special chars)
  const apiKeyRegex = /^[a-zA-Z0-9_\-\.]+$/;
  return apiKeyRegex.test(apiKey) && !containsSuspiciousPatterns(apiKey);
}

/**
 * Sanitize object by removing potentially dangerous properties
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  allowedKeys?: string[]
): Partial<T> {
  const sanitized: Partial<T> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Skip if allowedKeys is specified and key is not in it
    if (allowedKeys && !allowedKeys.includes(key)) {
      continue;
    }

    // Skip dangerous keys
    if (['__proto__', 'constructor', 'prototype'].includes(key)) {
      continue;
    }

    // Sanitize string values
    if (typeof value === 'string') {
      if (containsSuspiciousPatterns(value)) {
        console.warn(`Suspicious pattern detected in key: ${key}`);
        continue;
      }
      sanitized[key as keyof T] = sanitizeString(value) as T[keyof T];
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively sanitize nested objects
      sanitized[key as keyof T] = sanitizeObject(value) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value;
    }
  }

  return sanitized;
}

/**
 * Securely store sensitive data in localStorage with encryption
 */
export function secureStore(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    // In production, use proper encryption. This is a basic example.
    const encoded = btoa(value);
    localStorage.setItem(key, encoded);
  } catch (error) {
    console.error('Failed to store data securely:', error);
  }
}

/**
 * Securely retrieve data from localStorage
 */
export function secureRetrieve(key: string): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const encoded = localStorage.getItem(key);
    if (!encoded) return null;
    return atob(encoded);
  } catch (error) {
    console.error('Failed to retrieve data securely:', error);
    return null;
  }
}

/**
 * Clear sensitive data from localStorage
 */
export function secureClear(key?: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    if (key) {
      localStorage.removeItem(key);
    } else {
      // Clear all sensitive keys
      const sensitiveKeys = ['access_token', 'refresh_token', 'api_key'];
      sensitiveKeys.forEach(k => localStorage.removeItem(k));
    }
  } catch (error) {
    console.error('Failed to clear data:', error);
  }
}

/**
 * Rate limiter for client-side API calls
 */
export class ClientRateLimiter {
  private calls: Map<string, number[]> = new Map();
  
  constructor(
    private maxCalls: number = 10,
    private windowMs: number = 60000
  ) {}
  
  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const timestamps = this.calls.get(key) || [];
    
    // Remove old timestamps outside the window
    const validTimestamps = timestamps.filter(ts => now - ts < this.windowMs);
    
    if (validTimestamps.length >= this.maxCalls) {
      return false;
    }
    
    validTimestamps.push(now);
    this.calls.set(key, validTimestamps);
    return true;
  }
  
  reset(key?: string): void {
    if (key) {
      this.calls.delete(key);
    } else {
      this.calls.clear();
    }
  }
}

/**
 * Content Security Policy violation reporter
 */
export function setupCSPReporter(): void {
  if (typeof window === 'undefined') return;
  
  document.addEventListener('securitypolicyviolation', (e) => {
    console.error('CSP Violation:', {
      blockedURI: e.blockedURI,
      violatedDirective: e.violatedDirective,
      originalPolicy: e.originalPolicy,
    });
    
    // In production, send to monitoring service
    // fetch('/api/csp-report', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     blockedURI: e.blockedURI,
    //     violatedDirective: e.violatedDirective,
    //   })
    // });
  });
}
