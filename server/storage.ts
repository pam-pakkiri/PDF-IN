import { pdfFiles, type PdfFile, type InsertPdfFile, processingTasks, type ProcessingTask, type InsertProcessingTask, users, type User, type InsertUser } from "@shared/schema";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";

// Modify the interface with any CRUD methods needed
export interface IStorage {
  // PDF files
  savePdfFile(file: InsertPdfFile): Promise<PdfFile>;
  getPdfFile(id: number): Promise<PdfFile | undefined>;
  getPdfFiles(): Promise<PdfFile[]>;
  deletePdfFile(id: number): Promise<boolean>;
  
  // Processing tasks
  createProcessingTask(task: InsertProcessingTask): Promise<ProcessingTask>;
  getProcessingTask(id: number): Promise<ProcessingTask | undefined>;
  updateProcessingTask(id: number, update: Partial<ProcessingTask>): Promise<ProcessingTask | undefined>;
  
  // Original user methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private pdfFiles: Map<number, PdfFile>;
  private processingTasks: Map<number, ProcessingTask>;
  private userIdCounter: number;
  private fileIdCounter: number;
  private taskIdCounter: number;
  private uploadDir: string;

  constructor() {
    this.users = new Map();
    this.pdfFiles = new Map();
    this.processingTasks = new Map();
    this.userIdCounter = 1;
    this.fileIdCounter = 1;
    this.taskIdCounter = 1;
    this.uploadDir = path.join(process.cwd(), "uploads");
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  // PDF file methods
  async savePdfFile(file: InsertPdfFile): Promise<PdfFile> {
    const id = this.fileIdCounter++;
    const pdfFile: PdfFile = { ...file, id };
    this.pdfFiles.set(id, pdfFile);
    return pdfFile;
  }

  async getPdfFile(id: number): Promise<PdfFile | undefined> {
    return this.pdfFiles.get(id);
  }

  async getPdfFiles(): Promise<PdfFile[]> {
    return Array.from(this.pdfFiles.values());
  }

  async deletePdfFile(id: number): Promise<boolean> {
    const file = this.pdfFiles.get(id);
    if (file) {
      // Delete the actual file
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (error) {
        console.error("Error deleting file:", error);
      }
      
      // Remove from storage
      return this.pdfFiles.delete(id);
    }
    return false;
  }

  // Processing task methods
  async createProcessingTask(task: InsertProcessingTask): Promise<ProcessingTask> {
    const id = this.taskIdCounter++;
    const processingTask: ProcessingTask = { 
      ...task, 
      id, 
      outputFiles: [],
      error: null
    };
    this.processingTasks.set(id, processingTask);
    return processingTask;
  }

  async getProcessingTask(id: number): Promise<ProcessingTask | undefined> {
    return this.processingTasks.get(id);
  }

  async updateProcessingTask(id: number, update: Partial<ProcessingTask>): Promise<ProcessingTask | undefined> {
    const task = this.processingTasks.get(id);
    if (task) {
      const updatedTask = { ...task, ...update };
      this.processingTasks.set(id, updatedTask);
      return updatedTask;
    }
    return undefined;
  }

  // Original user methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
