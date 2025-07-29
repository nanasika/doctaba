import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertAppointmentSchema, 
  insertMessageSchema, 
  insertDocumentSchema 
} from "@shared/schema";

function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // User routes
  app.get("/api/users", isAuthenticated, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove password field from response for security
      const safeUsers = users.map(user => ({ ...user, password: undefined }));
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Appointment routes
  app.get("/api/appointments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const appointments = await storage.getAppointments(userId, user.userType as 'doctor' | 'patient');
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/appointments/:id", isAuthenticated, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/appointments", isAuthenticated, async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      res.status(400).json({ message: "Invalid appointment data" });
    }
  });

  app.patch("/api/appointments/:id", isAuthenticated, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const appointment = await storage.updateAppointmentStatus(appointmentId, status);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Message routes
  app.get("/api/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const messages = await storage.getMessages(userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/conversations/:user1Id/:user2Id", isAuthenticated, async (req, res) => {
    try {
      const user1Id = parseInt(req.params.user1Id);
      const user2Id = parseInt(req.params.user2Id);
      
      const messages = await storage.getConversation(user1Id, user2Id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  app.patch("/api/messages/:id/read", isAuthenticated, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      await storage.markMessageRead(messageId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Document routes
  app.get("/api/documents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const documents = await storage.getUserDocuments(userId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/documents", isAuthenticated, async (req, res) => {
    try {
      const documentData = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(documentData);
      res.status(201).json(document);
    } catch (error) {
      res.status(400).json({ message: "Invalid document data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
