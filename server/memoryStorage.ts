import {
  type User,
  type InsertUser,
  type Appointment,
  type InsertAppointment,
  type Message,
  type InsertMessage,
  type Document,
  type InsertDocument
} from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";
import type { IStorage } from "./storage";

export class MemoryStorage implements IStorage {
  sessionStore: session.Store;
  
  private users: User[] = [];
  private appointments: Appointment[] = [];
  private messages: Message[] = [];
  private documents: Document[] = [];
  private nextUserId = 1;
  private nextAppointmentId = 1;
  private nextMessageId = 1;
  private nextDocumentId = 1;

  constructor() {
    const MemStore = MemoryStore(session);
    this.sessionStore = new MemStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Add some initial test data
    this.initializeTestData().catch(console.error);
  }

  private async initializeTestData() {
    // Create test users with properly hashed passwords
    const { hashPassword } = await import('./auth');
    
    const testDoctor: User = {
      id: this.nextUserId++,
      email: "doctor@doctaba.com",
      password: await hashPassword("password123"), // Properly hashed password
      firstName: "John",
      lastName: "Smith",
      userType: "doctor",
      specialty: "Cardiology",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const testPatient: User = {
      id: this.nextUserId++,
      email: "patient@doctaba.com", 
      password: await hashPassword("password123"), // Properly hashed password
      firstName: "Jane",
      lastName: "Doe",
      userType: "patient",
      specialty: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.push(testDoctor, testPatient);

    // Create test appointments
    const testAppointment1: Appointment = {
      id: this.nextAppointmentId++,
      patientId: testPatient.id,
      doctorId: testDoctor.id,
      date: "2025-01-30",
      time: "10:00 AM",
      status: "upcoming",
      type: "video",
      specialty: "Cardiology",
      notes: "Routine checkup"
    };

    const testAppointment2: Appointment = {
      id: this.nextAppointmentId++,
      patientId: testPatient.id,
      doctorId: testDoctor.id,
      date: "2025-01-25",
      time: "2:30 PM",
      status: "completed",
      type: "video",
      specialty: "Cardiology",
      notes: "Follow-up consultation"
    };

    this.appointments.push(testAppointment1, testAppointment2);

    // Create test message
    const testMessage: Message = {
      id: this.nextMessageId++,
      senderId: testPatient.id,
      receiverId: testDoctor.id,
      content: "Hello Doctor, I have a question about my medication.",
      timestamp: new Date(),
      read: false
    };

    this.messages.push(testMessage);

    // Create test document
    const testDocument: Document = {
      id: this.nextDocumentId++,
      userId: testPatient.id,
      title: "Blood Test Results",
      type: "lab_result",
      url: "/documents/blood-test-results.pdf",
      uploadDate: new Date()
    };

    this.documents.push(testDocument);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }

  async getAllUsers(): Promise<User[]> {
    return [...this.users];
  }

  async createUser(userData: InsertUser): Promise<User> {
    const user: User = {
      id: this.nextUserId++,
      ...userData,
      firstName: userData.firstName ?? null,
      lastName: userData.lastName ?? null,
      userType: userData.userType || 'patient',
      specialty: userData.specialty ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(user);
    return user;
  }

  async upsertUser(userData: any): Promise<User> {
    // Find existing user by email or create new one
    let existingUser = await this.getUserByEmail(userData.email);
    
    if (existingUser) {
      // Update existing user
      existingUser.firstName = userData.firstName || existingUser.firstName;
      existingUser.lastName = userData.lastName || existingUser.lastName;
      existingUser.updatedAt = new Date();
      return existingUser;
    } else {
      // Create new user for OAuth auth
      const newUser: User = {
        id: this.nextUserId++,
        email: userData.email,
        password: 'oauth-auth', // Placeholder for OAuth auth users
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        userType: 'patient', // Default type
        specialty: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.users.push(newUser);
      return newUser;
    }
  }

  // Appointment operations
  async getAppointments(userId: number, userType: 'doctor' | 'patient'): Promise<any[]> {
    let userAppointments;
    if (userType === 'doctor') {
      userAppointments = this.appointments.filter(apt => apt.doctorId === userId);
    } else {
      userAppointments = this.appointments.filter(apt => apt.patientId === userId);
    }

    // Enrich appointments with user information
    const enrichedAppointments = [];
    for (const appointment of userAppointments) {
      const doctor = await this.getUser(appointment.doctorId);
      const patient = await this.getUser(appointment.patientId);
      
      enrichedAppointments.push({
        ...appointment,
        doctorName: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Unknown Doctor',
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient',
        doctorSpecialty: doctor?.specialty || 'General Medicine'
      });
    }
    
    return enrichedAppointments;
  }
  
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.find(apt => apt.id === id);
  }
  
  async createAppointment(appointmentData: InsertAppointment): Promise<Appointment> {
    const appointment: Appointment = {
      id: this.nextAppointmentId++,
      ...appointmentData,
      specialty: appointmentData.specialty ?? null,
      notes: appointmentData.notes ?? null
    };
    this.appointments.push(appointment);
    return appointment;
  }
  
  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const appointment = this.appointments.find(apt => apt.id === id);
    if (appointment) {
      appointment.status = status;
    }
    return appointment;
  }
  
  // Message operations
  async getMessages(userId: number): Promise<Message[]> {
    return this.messages.filter(msg => 
      msg.senderId === userId || msg.receiverId === userId
    );
  }
  
  async getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
    return this.messages.filter(msg => 
      (msg.senderId === user1Id && msg.receiverId === user2Id) ||
      (msg.senderId === user2Id && msg.receiverId === user1Id)
    );
  }
  
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const message: Message = {
      id: this.nextMessageId++,
      ...messageData,
      timestamp: new Date(),
      read: false
    };
    this.messages.push(message);
    return message;
  }
  
  async markMessageRead(id: number): Promise<void> {
    const message = this.messages.find(msg => msg.id === id);
    if (message) {
      message.read = true;
    }
  }
  
  // Document operations
  async getUserDocuments(userId: number): Promise<Document[]> {
    return this.documents.filter(doc => doc.userId === userId);
  }
  
  async createDocument(documentData: InsertDocument): Promise<Document> {
    const document: Document = {
      id: this.nextDocumentId++,
      ...documentData,
      uploadDate: new Date()
    };
    this.documents.push(document);
    return document;
  }
}