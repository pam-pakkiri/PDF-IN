import { pgTable, text, serial, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// PDF file schema
export const pdfFiles = pgTable("pdf_files", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalFilename: text("original_filename").notNull(),
  filesize: integer("filesize").notNull(),
  mimetype: text("mimetype").notNull(),
  uploadedAt: text("uploaded_at").notNull(),
  path: text("path").notNull(),
});

export const insertPdfFileSchema = createInsertSchema(pdfFiles).omit({
  id: true,
});

export type InsertPdfFile = z.infer<typeof insertPdfFileSchema>;
export type PdfFile = typeof pdfFiles.$inferSelect;

// Processing task schema
export const processingTasks = pgTable("processing_tasks", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "extract_text", "merge", "convert_to_image"
  status: text("status").notNull(), // "pending", "processing", "completed", "failed"
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  inputFiles: json("input_files").notNull().$type<number[]>(), // Array of pdf_file ids
  outputFiles: json("output_files").$type<{
    id: number;
    filename: string;
    type: string;
  }[]>(),
  error: text("error"),
});

export const insertProcessingTaskSchema = createInsertSchema(processingTasks).omit({
  id: true,
  outputFiles: true,
  error: true,
});

export type InsertProcessingTask = z.infer<typeof insertProcessingTaskSchema>;
export type ProcessingTask = typeof processingTasks.$inferSelect;

// Users schema (from original template)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
