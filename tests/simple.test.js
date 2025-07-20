import { describe, it, expect } from 'vitest';
import { validateUAEPhone, formatUAEPhone, formatUAEPhoneInternational } from '../utils/phoneUtils.js';

describe('UAE Phone Utils', () => {
  describe('validateUAEPhone', () => {
    it('should validate correct UAE mobile numbers', () => {
      const validNumbers = [
        '+971501234567',
        '+971521234567', 
        '+971541234567',
        '+971551234567',
        '+971561234567',
        '+971581234567',
        '971501234567',
        '0501234567'
      ];

      validNumbers.forEach(number => {
        expect(validateUAEPhone(number)).toBe(true);
      });
    });

    it('should reject invalid UAE numbers', () => {
      const invalidNumbers = [
        '+971401234567', // Invalid prefix
        '+97150123456',  // Too short
        '+9715012345678', // Too long
        '+966501234567', // Saudi Arabia
        'invalid-phone',
        ''
      ];

      invalidNumbers.forEach(number => {
        expect(validateUAEPhone(number)).toBe(false);
      });
    });
  });

  describe('formatUAEPhone', () => {
    it('should format phone numbers to local format', () => {
      expect(formatUAEPhone('0501234567')).toBe('0501234567');
      expect(formatUAEPhone('971501234567')).toBe('0501234567');
      expect(formatUAEPhone('+971501234567')).toBe('0501234567');
    });

    it('should return empty string for invalid numbers', () => {
      expect(formatUAEPhone('invalid')).toBe('');
      expect(formatUAEPhone('')).toBe('');
    });
  });

  describe('formatUAEPhoneInternational', () => {
    it('should format phone numbers to international format', () => {
      expect(formatUAEPhoneInternational('0501234567')).toBe('+971501234567');
      expect(formatUAEPhoneInternational('971501234567')).toBe('+971501234567');
      expect(formatUAEPhoneInternational('+971501234567')).toBe('+971501234567');
    });
  });
});