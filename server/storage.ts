import {
  type User,
  type InsertUser,
  type Appointment,
  type InsertAppointment,
  type Message,
  type InsertMessage,
  type Document,
  type InsertDocument,
  users,
  appointments,
  messages,
  documents
} from "@shared/schema";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, or, and } from "drizzle-orm";
import { hashPassword } from "./auth";

export interface IStorage {
  sessionStore: session.Store;
  
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: any): Promise<User>;
  
  // Appointments
  getAppointments(userId: number, userType: 'doctor' | 'patient'): Promise<any[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined>;
  
  // Messages
  getMessages(userId: number): Promise<Message[]>;
  getConversation(user1Id: number, user2Id: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageRead(id: number): Promise<void>;
  
  // Documents
  getUserDocuments(userId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    const PgSession = connectPgSimple(session);
    this.sessionStore = new PgSession({
      pool: pool,
      tableName: 'sessions'
    });
    
    // Initialize test data
    this.initializeTestData().catch(console.error);
  }

  private async initializeTestData() {
    try {
      // Check if test users already exist
      const existingDoctor = await this.getUserByEmail("doctor@doctaba.com");
      const existingPatient = await this.getUserByEmail("patient@doctaba.com");
      
      if (existingDoctor && existingPatient) {
        return; // Test data already exists
      }

      // Create test doctor
      const testDoctor = await db.insert(users).values({
        email: "doctor@doctaba.com",
        password: await hashPassword("password123"),
        firstName: "John",
        lastName: "Smith",
        userType: "doctor",
        specialty: "Cardiology"
      }).returning();

      // Create test patient
      const testPatient = await db.insert(users).values({
        email: "patient@doctaba.com",
        password: await hashPassword("password123"),
        firstName: "Jane",
        lastName: "Doe",
        userType: "patient"
      }).returning();

      // Create test appointments
      await db.insert(appointments).values([
        {
          patientId: testPatient[0].id,
          doctorId: testDoctor[0].id,
          date: "2025-01-30",
          time: "10:00 AM",
          status: "upcoming",
          type: "video",
          specialty: "Cardiology",
          notes: "Routine checkup"
        },
        {
          patientId: testPatient[0].id,
          doctorId: testDoctor[0].id,
          date: "2025-01-25", 
          time: "2:30 PM",
          status: "completed",
          type: "video",
          specialty: "Cardiology",
          notes: "Follow-up consultation"
        }
      ]);

      // Create test message
      await db.insert(messages).values({
        senderId: testPatient[0].id,
        receiverId: testDoctor[0].id,
        content: "Hello Doctor, I have a question about my medication."
      });

      // Create test document
      await db.insert(documents).values({
        userId: testPatient[0].id,
        title: "Blood Test Results",
        type: "lab_result",
        url: "/documents/blood-test-results.pdf"
      });

    } catch (error) {
      console.error("Error initializing test data:", error);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        firstName: insertUser.firstName ?? null,
        lastName: insertUser.lastName ?? null,
        userType: insertUser.userType || 'patient',
        specialty: insertUser.specialty ?? null
      })
      .returning();
    return user;
  }

  async upsertUser(userData: any): Promise<User> {
    // Find existing user by email or create new one
    let existingUser = await this.getUserByEmail(userData.email);
    
    if (existingUser) {
      // Update existing user
      const [updatedUser] = await db
        .update(users)
        .set({
          firstName: userData.firstName || existingUser.firstName,
          lastName: userData.lastName || existingUser.lastName,
          updatedAt: new Date()
        })
        .where(eq(users.id, existingUser.id))
        .returning();
      return updatedUser;
    } else {
      // Create new user for OAuth auth
      const [newUser] = await db
        .insert(users)
        .values({
          email: userData.email,
          password: 'oauth-auth',
          firstName: userData.firstName || null,
          lastName: userData.lastName || null,
          userType: 'patient'
        })
        .returning();
      return newUser;
    }
  }

  async getAppointments(userId: number, userType: 'doctor' | 'patient'): Promise<any[]> {
    let userAppointments;
    
    if (userType === 'doctor') {
      userAppointments = await db
        .select({
          id: appointments.id,
          patientId: appointments.patientId,
          doctorId: appointments.doctorId,
          date: appointments.date,
          time: appointments.time,
          status: appointments.status,
          type: appointments.type,
          specialty: appointments.specialty,
          notes: appointments.notes,
          doctorName: users.firstName,
          doctorLastName: users.lastName,
          doctorSpecialty: users.specialty
        })
        .from(appointments)
        .leftJoin(users, eq(appointments.doctorId, users.id))
        .where(eq(appointments.doctorId, userId));
    } else {
      userAppointments = await db
        .select({
          id: appointments.id,
          patientId: appointments.patientId,
          doctorId: appointments.doctorId,
          date: appointments.date,
          time: appointments.time,
          status: appointments.status,
          type: appointments.type,
          specialty: appointments.specialty,
          notes: appointments.notes,
          doctorName: users.firstName,
          doctorLastName: users.lastName,
          doctorSpecialty: users.specialty
        })
        .from(appointments)
        .leftJoin(users, eq(appointments.doctorId, users.id))
        .where(eq(appointments.patientId, userId));
    }

    // Get patient names for each appointment
    const enrichedAppointments = [];
    for (const appointment of userAppointments) {
      const patient = await this.getUser(appointment.patientId);
      enrichedAppointments.push({
        ...appointment,
        doctorName: `Dr. ${appointment.doctorName} ${appointment.doctorLastName}`,
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient',
        doctorSpecialty: appointment.doctorSpecialty || 'General Medicine'
      });
    }
    
    return enrichedAppointments;
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment || undefined;
  }

  async createAppointment(appointmentData: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db
      .insert(appointments)
      .values({
        ...appointmentData,
        specialty: appointmentData.specialty ?? null,
        notes: appointmentData.notes ?? null
      })
      .returning();
    return appointment;
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const [appointment] = await db
      .update(appointments)
      .set({ status })
      .where(eq(appointments.id, id))
      .returning();
    return appointment || undefined;
  }

  async getMessages(userId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)));
  }

  async getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.senderId, user1Id), eq(messages.receiverId, user2Id)),
          and(eq(messages.senderId, user2Id), eq(messages.receiverId, user1Id))
        )
      );
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(messageData)
      .returning();
    return message;
  }

  async markMessageRead(id: number): Promise<void> {
    await db
      .update(messages)
      .set({ read: true })
      .where(eq(messages.id, id));
  }

  async getUserDocuments(userId: number): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.userId, userId));
  }

  async createDocument(documentData: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values(documentData)
      .returning();
    return document;
  }
}

export const storage = new DatabaseStorage();
