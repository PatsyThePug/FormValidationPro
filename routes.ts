import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

interface PaymentFormData {
  cardNumber: string;
  cvc: string;
  expiryDate: string;
  amount: string;
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  state: string;
  postalCode: string;
  message: string;
}

interface ValidationError {
  field: string;
  message: string;
}

// Server-side validation functions
const validateCardNumber = (value: string): boolean => {
  const cleaned = value.replace(/\s/g, '');
  return /^\d{16}$/.test(cleaned);
};

const validateCVC = (value: string): boolean => {
  return /^\d{3,4}$/.test(value);
};

const validateExpiryDate = (value: string): boolean => {
  if (!/^\d{2}\/\d{2}$/.test(value)) return false;
  
  const [month, year] = value.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;
  
  const expMonth = parseInt(month);
  const expYear = parseInt(year);
  
  if (expMonth < 1 || expMonth > 12) return false;
  if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) return false;
  
  return true;
};

const validateAmount = (value: string): boolean => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

const validateEmail = (value: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const validatePostalCode = (value: string): boolean => {
  return /^\d{5}(-\d{4})?$/.test(value);
};

const validateRequired = (value: string): boolean => {
  return value.trim() !== '';
};

// Server-side form validation
const validatePaymentForm = (formData: PaymentFormData): ValidationError[] => {
  const errors: ValidationError[] = [];

  const validations = [
    { field: 'cardNumber', value: formData.cardNumber, validator: validateCardNumber, message: 'Card number must be 16 digits', required: true },
    { field: 'cvc', value: formData.cvc, validator: validateCVC, message: 'CVC must be 3-4 digits', required: true },
    { field: 'expiryDate', value: formData.expiryDate, validator: validateExpiryDate, message: 'Expiry date must be valid and in the future (MM/YY)', required: true },
    { field: 'amount', value: formData.amount, validator: validateAmount, message: 'Amount must be a valid positive number', required: true },
    { field: 'firstName', value: formData.firstName, validator: validateRequired, message: 'First name is required', required: true },
    { field: 'lastName', value: formData.lastName, validator: validateRequired, message: 'Last name is required', required: true },
    { field: 'email', value: formData.email, validator: validateEmail, message: 'Please enter a valid email address', required: true },
    { field: 'city', value: formData.city, validator: validateRequired, message: 'City is required', required: true },
    { field: 'state', value: formData.state, validator: validateRequired, message: 'State is required', required: true },
    { field: 'postalCode', value: formData.postalCode, validator: validatePostalCode, message: 'Postal code must be in format 12345 or 12345-6789', required: true },
  ];

  validations.forEach(({ field, value, validator, message, required }) => {
    if (required && !validateRequired(value)) {
      errors.push({ field, message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required` });
    } else if (value && !validator(value)) {
      errors.push({ field, message });
    }
  });

  return errors;
};

// Security utilities for input sanitization
const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>\"']/g, '') // Remove potential HTML/JS injection characters
    .substring(0, 255); // Limit length to prevent buffer overflow
};

const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim().substring(0, 254);
};

const sanitizeNumeric = (input: string): string => {
  return input.replace(/[^0-9.\-]/g, '').substring(0, 20);
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ============ PAYMENT CRUD ENDPOINTS ============
  
  /**
   * CREATE: Submit new payment (original form submission)
   * Demonstrates: Client-Server communication, validation, security
   */
  app.post('/api/payment', async (req, res) => {
    try {
      console.log('\n=== PAYMENT SUBMISSION (CREATE) ===');
      const formData: PaymentFormData = req.body;
      
      // Input sanitization for security
      const sanitizedData = {
        cardNumber: sanitizeNumeric(formData.cardNumber),
        cvc: sanitizeNumeric(formData.cvc),
        expiryDate: sanitizeInput(formData.expiryDate),
        amount: sanitizeNumeric(formData.amount),
        firstName: sanitizeInput(formData.firstName),
        lastName: sanitizeInput(formData.lastName),
        email: sanitizeEmail(formData.email),
        city: sanitizeInput(formData.city),
        state: sanitizeInput(formData.state),
        postalCode: sanitizeNumeric(formData.postalCode),
        message: sanitizeInput(formData.message || ''),
      };
      
      // Server-side validation (crucial for security)
      const validationErrors = validatePaymentForm(sanitizedData);
      
      if (validationErrors.length > 0) {
        console.log('❌ Validation failed:', validationErrors.map(e => e.message).join(', '));
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        });
      }

      // Generate unique transaction ID
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // CREATE operation: Store payment in database
      const paymentRecord = await storage.createPayment({
        ...sanitizedData,
        transactionId,
        status: 'pending'
      });

      console.log('💾 Payment stored with ID:', paymentRecord.id);

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate payment gateway response (10% failure rate for demo)
      const shouldFail = Math.random() < 0.1;
      
      if (shouldFail) {
        // UPDATE operation: Mark payment as failed
        await storage.updatePayment(paymentRecord.id, { status: 'failed' });
        console.log('❌ Payment failed - status updated to failed');
        
        return res.status(422).json({
          success: false,
          message: 'Payment could not be processed. Please try again or use a different payment method.',
          errors: [{ field: 'cardNumber', message: 'Card was declined' }]
        });
      }

      // UPDATE operation: Mark payment as completed
      const completedPayment = await storage.updatePayment(paymentRecord.id, { status: 'completed' });
      console.log('✅ Payment successful - status updated to completed');

      // Success response
      res.json({
        success: true,
        message: `Payment of $${sanitizedData.amount} processed successfully!`,
        transactionId: paymentRecord.transactionId,
        paymentId: paymentRecord.id,
        data: {
          amount: sanitizedData.amount,
          email: sanitizedData.email,
          name: `${sanitizedData.firstName} ${sanitizedData.lastName}`,
          status: completedPayment?.status || 'completed'
        }
      });

    } catch (error) {
      console.error('❌ Payment processing error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error. Please try again later.',
        errors: [{ field: 'general', message: 'Server error occurred' }]
      });
    }
  });

  /**
   * READ: Get payment by transaction ID
   * Demonstrates: Data retrieval, client-server communication
   */
  app.get('/api/payment/:transactionId', async (req, res) => {
    try {
      console.log('\n=== PAYMENT LOOKUP (READ) ===');
      const { transactionId } = req.params;
      
      // Input sanitization
      const sanitizedTxnId = sanitizeInput(transactionId);
      
      // READ operation: Fetch payment from database
      const payment = await storage.getPaymentByTransactionId(sanitizedTxnId);
      
      if (!payment) {
        console.log('❌ Payment not found');
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      console.log('✅ Payment found:', payment.id);
      
      // Return payment details (without sensitive card info)
      res.json({
        success: true,
        data: {
          id: payment.id,
          transactionId: payment.transactionId,
          amount: payment.amount,
          status: payment.status,
          customerName: `${payment.firstName} ${payment.lastName}`,
          email: payment.email,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt
        }
      });

    } catch (error) {
      console.error('❌ Payment lookup error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving payment information'
      });
    }
  });

  /**
   * READ: Get all payments by customer email
   * Demonstrates: Data filtering, customer history
   */
  app.get('/api/payments/customer/:email', async (req, res) => {
    try {
      console.log('\n=== CUSTOMER PAYMENTS (READ) ===');
      const { email } = req.params;
      
      // Input sanitization
      const sanitizedEmail = sanitizeEmail(email);
      
      // READ operation: Get customer's payment history
      const payments = await storage.getPaymentsByEmail(sanitizedEmail);
      
      console.log(`✅ Found ${payments.length} payments for customer`);
      
      // Return customer payment history (without sensitive data)
      const customerPayments = payments.map(payment => ({
        id: payment.id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        status: payment.status,
        createdAt: payment.createdAt
      }));

      res.json({
        success: true,
        data: {
          email: sanitizedEmail,
          paymentCount: payments.length,
          payments: customerPayments
        }
      });

    } catch (error) {
      console.error('❌ Customer payments lookup error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving customer payments'
      });
    }
  });

  /**
   * UPDATE: Modify payment status (admin functionality)
   * Demonstrates: Data modification, status management
   */
  app.patch('/api/payment/:id/status', async (req, res) => {
    try {
      console.log('\n=== PAYMENT STATUS UPDATE (UPDATE) ===');
      const { id } = req.params;
      const { status } = req.body;
      
      // Input sanitization and validation
      const paymentId = parseInt(id);
      const sanitizedStatus = sanitizeInput(status);
      
      if (isNaN(paymentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment ID'
        });
      }

      const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
      if (!validStatuses.includes(sanitizedStatus)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
        });
      }

      // UPDATE operation: Modify payment status
      const updatedPayment = await storage.updatePayment(paymentId, { 
        status: sanitizedStatus 
      });
      
      if (!updatedPayment) {
        console.log('❌ Payment not found for update');
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      console.log(`✅ Payment status updated from ${updatedPayment.status} to ${sanitizedStatus}`);
      
      res.json({
        success: true,
        message: `Payment status updated to ${sanitizedStatus}`,
        data: {
          id: updatedPayment.id,
          transactionId: updatedPayment.transactionId,
          status: updatedPayment.status,
          updatedAt: updatedPayment.updatedAt
        }
      });

    } catch (error) {
      console.error('❌ Payment status update error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating payment status'
      });
    }
  });

  /**
   * READ: Get payments by status (admin/reporting functionality)
   * Demonstrates: Data filtering, reporting capabilities
   */
  app.get('/api/payments/status/:status', async (req, res) => {
    try {
      console.log('\n=== PAYMENTS BY STATUS (READ) ===');
      const { status } = req.params;
      
      // Input sanitization
      const sanitizedStatus = sanitizeInput(status);
      
      // READ operation: Get payments by status
      const payments = await storage.getPaymentsByStatus(sanitizedStatus);
      
      console.log(`✅ Found ${payments.length} payments with status: ${sanitizedStatus}`);
      
      // Return filtered payments for reporting
      const statusReport = payments.map(payment => ({
        id: payment.id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        customerEmail: payment.email,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      }));

      res.json({
        success: true,
        data: {
          status: sanitizedStatus,
          count: payments.length,
          payments: statusReport
        }
      });

    } catch (error) {
      console.error('❌ Status report error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating status report'
      });
    }
  });

  /**
   * DELETE: Remove payment record (admin functionality)
   * Demonstrates: Data deletion, admin operations
   * Note: In production, you'd typically soft-delete or archive instead
   */
  app.delete('/api/payment/:id', async (req, res) => {
    try {
      console.log('\n=== PAYMENT DELETION (DELETE) ===');
      const { id } = req.params;
      
      // Input sanitization
      const paymentId = parseInt(id);
      
      if (isNaN(paymentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment ID'
        });
      }

      // First check if payment exists
      const existingPayment = await storage.getPayment(paymentId);
      if (!existingPayment) {
        console.log('❌ Payment not found for deletion');
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      // DELETE operation: Remove payment record
      const deleted = await storage.deletePayment(paymentId);
      
      if (deleted) {
        console.log('✅ Payment deleted successfully');
        res.json({
          success: true,
          message: 'Payment record deleted successfully',
          data: {
            deletedId: paymentId,
            transactionId: existingPayment.transactionId
          }
        });
      } else {
        console.log('❌ Failed to delete payment');
        res.status(500).json({
          success: false,
          message: 'Failed to delete payment record'
        });
      }

    } catch (error) {
      console.error('❌ Payment deletion error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting payment record'
      });
    }
  });

  // ============ FRAMEWORK DEMONSTRATION ============
  
  /**
   * Middleware demonstration - Request logging
   * Shows Express.js middleware functionality
   */
  app.use('/api/*', (req, res, next) => {
    console.log(`\n📊 [${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log('📊 Headers:', JSON.stringify(req.headers, null, 2));
    if (req.body && Object.keys(req.body).length > 0) {
      // Log body but mask sensitive data
      const logBody = { ...req.body };
      if (logBody.cardNumber) logBody.cardNumber = '**** **** **** ' + logBody.cardNumber.slice(-4);
      if (logBody.cvc) logBody.cvc = '***';
      console.log('📊 Body:', JSON.stringify(logBody, null, 2));
    }
    next();
  });

  const httpServer = createServer(app);

  return httpServer;
}
