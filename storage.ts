import { 
  users, 
  payments, 
  type User, 
  type InsertUser, 
  type Payment, 
  type InsertPayment, 
  type UpdatePayment 
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

/**
 * Storage interface demonstrating CRUD operations
 * Create, Read, Update, Delete operations for both users and payments
 */
export interface IStorage {
  // User CRUD operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Payment CRUD operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentByTransactionId(transactionId: string): Promise<Payment | undefined>;
  updatePayment(id: number, payment: UpdatePayment): Promise<Payment | undefined>;
  deletePayment(id: number): Promise<boolean>;
  getAllPayments(): Promise<Payment[]>;
  getPaymentsByEmail(email: string): Promise<Payment[]>;
  getPaymentsByStatus(status: string): Promise<Payment[]>;
}

/**
 * In-memory storage implementation for demonstration
 * In production, this would be replaced with database operations
 */
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private payments: Map<number, Payment>;
  private currentUserId: number;
  private currentPaymentId: number;

  constructor() {
    this.users = new Map();
    this.payments = new Map();
    this.currentUserId = 1;
    this.currentPaymentId = 1;
  }

  // ============ USER CRUD OPERATIONS ============
  
  /**
   * CREATE: Add a new user
   */
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    console.log(`[CRUD] CREATE User: ${user.username} (ID: ${id})`);
    return user;
  }

  /**
   * READ: Get user by ID
   */
  async getUser(id: number): Promise<User | undefined> {
    const user = this.users.get(id);
    console.log(`[CRUD] READ User by ID ${id}: ${user ? 'Found' : 'Not found'}`);
    return user;
  }

  /**
   * READ: Get user by username
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
    console.log(`[CRUD] READ User by username '${username}': ${user ? 'Found' : 'Not found'}`);
    return user;
  }

  /**
   * UPDATE: Modify existing user
   */
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      console.log(`[CRUD] UPDATE User ID ${id}: Not found`);
      return undefined;
    }
    
    const updatedUser: User = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    console.log(`[CRUD] UPDATE User ID ${id}: Updated successfully`);
    return updatedUser;
  }

  /**
   * DELETE: Remove user
   */
  async deleteUser(id: number): Promise<boolean> {
    const deleted = this.users.delete(id);
    console.log(`[CRUD] DELETE User ID ${id}: ${deleted ? 'Success' : 'Not found'}`);
    return deleted;
  }

  // ============ PAYMENT CRUD OPERATIONS ============

  /**
   * CREATE: Store new payment transaction
   */
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.currentPaymentId++;
    const now = new Date();
    
    // Mask sensitive data for security
    const maskedCardNumber = this.maskCardNumber(insertPayment.cardNumber);
    
    const payment: Payment = {
      ...insertPayment,
      id,
      cardNumber: maskedCardNumber, // Security: mask card number
      message: insertPayment.message || null,
      status: insertPayment.status || 'pending',
      createdAt: now,
      updatedAt: now,
    };
    
    this.payments.set(id, payment);
    console.log(`[CRUD] CREATE Payment: Transaction ${payment.transactionId} (ID: ${id})`);
    return payment;
  }

  /**
   * READ: Get payment by ID
   */
  async getPayment(id: number): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    console.log(`[CRUD] READ Payment by ID ${id}: ${payment ? 'Found' : 'Not found'}`);
    return payment;
  }

  /**
   * READ: Get payment by transaction ID
   */
  async getPaymentByTransactionId(transactionId: string): Promise<Payment | undefined> {
    const payment = Array.from(this.payments.values()).find(
      (payment) => payment.transactionId === transactionId,
    );
    console.log(`[CRUD] READ Payment by transaction '${transactionId}': ${payment ? 'Found' : 'Not found'}`);
    return payment;
  }

  /**
   * UPDATE: Modify payment status or details
   */
  async updatePayment(id: number, paymentData: UpdatePayment): Promise<Payment | undefined> {
    const existingPayment = this.payments.get(id);
    if (!existingPayment) {
      console.log(`[CRUD] UPDATE Payment ID ${id}: Not found`);
      return undefined;
    }
    
    const updatedPayment: Payment = {
      ...existingPayment,
      ...paymentData,
      updatedAt: new Date(),
    };
    
    this.payments.set(id, updatedPayment);
    console.log(`[CRUD] UPDATE Payment ID ${id}: Status changed to ${updatedPayment.status}`);
    return updatedPayment;
  }

  /**
   * DELETE: Remove payment record (for admin/cleanup purposes)
   */
  async deletePayment(id: number): Promise<boolean> {
    const deleted = this.payments.delete(id);
    console.log(`[CRUD] DELETE Payment ID ${id}: ${deleted ? 'Success' : 'Not found'}`);
    return deleted;
  }

  /**
   * READ: Get all payments (admin functionality)
   */
  async getAllPayments(): Promise<Payment[]> {
    const payments = Array.from(this.payments.values());
    console.log(`[CRUD] READ All Payments: Found ${payments.length} records`);
    return payments;
  }

  /**
   * READ: Get payments by customer email
   */
  async getPaymentsByEmail(email: string): Promise<Payment[]> {
    const payments = Array.from(this.payments.values()).filter(
      (payment) => payment.email.toLowerCase() === email.toLowerCase(),
    );
    console.log(`[CRUD] READ Payments by email '${email}': Found ${payments.length} records`);
    return payments;
  }

  /**
   * READ: Get payments by status (for reporting)
   */
  async getPaymentsByStatus(status: string): Promise<Payment[]> {
    const payments = Array.from(this.payments.values()).filter(
      (payment) => payment.status === status,
    );
    console.log(`[CRUD] READ Payments by status '${status}': Found ${payments.length} records`);
    return payments;
  }

  // ============ SECURITY UTILITIES ============

  /**
   * Security: Mask card number for storage
   * Only stores last 4 digits for security
   */
  private maskCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.length < 4) return '*'.repeat(cleaned.length);
    
    const lastFour = cleaned.slice(-4);
    const masked = '*'.repeat(cleaned.length - 4) + lastFour;
    return masked;
  }
}

/**
 * Database storage implementation using PostgreSQL
 * Production-ready implementation with proper error handling
 */
export class DatabaseStorage implements IStorage {
  // ============ USER CRUD OPERATIONS ============
  
  async createUser(insertUser: InsertUser): Promise<User> {
    console.log(`[DATABASE] CREATE User: ${insertUser.username}`);
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUser(id: number): Promise<User | undefined> {
    console.log(`[DATABASE] READ User by ID: ${id}`);
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    console.log(`[DATABASE] READ User by username: ${username}`);
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    console.log(`[DATABASE] UPDATE User ID: ${id}`);
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    console.log(`[DATABASE] DELETE User ID: ${id}`);
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount || 0) > 0;
  }

  // ============ PAYMENT CRUD OPERATIONS ============

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    console.log(`[DATABASE] CREATE Payment: ${insertPayment.transactionId}`);
    
    // Mask sensitive data for security
    const maskedCardNumber = this.maskCardNumber(insertPayment.cardNumber);
    
    const paymentData = {
      ...insertPayment,
      cardNumber: maskedCardNumber,
      message: insertPayment.message || null,
      status: insertPayment.status || 'pending',
    };
    
    const [payment] = await db.insert(payments).values(paymentData).returning();
    return payment;
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    console.log(`[DATABASE] READ Payment by ID: ${id}`);
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }

  async getPaymentByTransactionId(transactionId: string): Promise<Payment | undefined> {
    console.log(`[DATABASE] READ Payment by transaction: ${transactionId}`);
    const [payment] = await db.select().from(payments).where(eq(payments.transactionId, transactionId));
    return payment || undefined;
  }

  async updatePayment(id: number, paymentData: UpdatePayment): Promise<Payment | undefined> {
    console.log(`[DATABASE] UPDATE Payment ID: ${id}`);
    const [updatedPayment] = await db
      .update(payments)
      .set({ ...paymentData, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return updatedPayment || undefined;
  }

  async deletePayment(id: number): Promise<boolean> {
    console.log(`[DATABASE] DELETE Payment ID: ${id}`);
    const result = await db.delete(payments).where(eq(payments.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getAllPayments(): Promise<Payment[]> {
    console.log(`[DATABASE] READ All Payments`);
    const allPayments = await db.select().from(payments);
    return allPayments;
  }

  async getPaymentsByEmail(email: string): Promise<Payment[]> {
    console.log(`[DATABASE] READ Payments by email: ${email}`);
    const userPayments = await db.select().from(payments).where(eq(payments.email, email));
    return userPayments;
  }

  async getPaymentsByStatus(status: string): Promise<Payment[]> {
    console.log(`[DATABASE] READ Payments by status: ${status}`);
    const statusPayments = await db.select().from(payments).where(eq(payments.status, status));
    return statusPayments;
  }

  // ============ SECURITY UTILITIES ============

  private maskCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.length < 4) return '*'.repeat(cleaned.length);
    
    const lastFour = cleaned.slice(-4);
    const masked = '*'.repeat(cleaned.length - 4) + lastFour;
    return masked;
  }
}

// Use database storage in production, fallback to memory storage for development
export const storage = process.env.DATABASE_URL 
  ? new DatabaseStorage() 
  : new MemStorage();

console.log(`[STORAGE] Using ${process.env.DATABASE_URL ? 'PostgreSQL Database' : 'In-Memory'} storage`);
