import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";
import { PDFDocument } from "pdf-lib";
import { z } from "zod";
import { insertPdfFileSchema, insertProcessingTaskSchema } from "@shared/schema";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${Date.now()}-${nanoid(6)}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only PDF files
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

const upload = multer({
  storage: storage_config,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  },
  fileFilter,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all files
  app.get("/api/files", async (req: Request, res: Response) => {
    try {
      const files = await storage.getPdfFiles();
      res.json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  // Upload PDF files
  app.post("/api/upload", upload.array("files", 5), async (req: Request, res: Response) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const savedFiles = [];

      for (const file of req.files as Express.Multer.File[]) {
        const pdfFile = {
          filename: file.filename,
          originalFilename: file.originalname,
          filesize: file.size,
          mimetype: file.mimetype,
          uploadedAt: new Date().toISOString(),
          path: file.path,
        };

        const validatedPdfFile = insertPdfFileSchema.parse(pdfFile);
        const savedFile = await storage.savePdfFile(validatedPdfFile);
        savedFiles.push(savedFile);
      }

      res.status(201).json(savedFiles);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload files" });
    }
  });

  // Delete file
  app.delete("/api/files/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid file ID" });
      }
      
      const success = await storage.deletePdfFile(id);
      if (success) {
        res.status(200).json({ message: "File deleted successfully" });
      } else {
        res.status(404).json({ message: "File not found" });
      }
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  // View PDF file
  app.get("/api/files/:id/view", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid file ID" });
      }
      
      const file = await storage.getPdfFile(id);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${file.originalFilename}"`);
      
      const fileStream = fs.createReadStream(file.path);
      fileStream.pipe(res);
    } catch (error) {
      console.error("View error:", error);
      res.status(500).json({ message: "Failed to view file" });
    }
  });

  // Download PDF file
  app.get("/api/files/:id/download", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid file ID" });
      }
      
      const file = await storage.getPdfFile(id);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      res.download(file.path, file.originalFilename);
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ message: "Failed to download file" });
    }
  });

  // Extract text from PDF
  app.post("/api/extract-text", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        fileIds: z.array(z.number()).min(1),
      });
      
      const { fileIds } = schema.parse(req.body);
      
      // Create a processing task
      const task = {
        type: "extract_text",
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        inputFiles: fileIds,
      };
      
      const validatedTask = insertProcessingTaskSchema.parse(task);
      const createdTask = await storage.createProcessingTask(validatedTask);
      
      // Process text extraction asynchronously
      extractTextFromPdf(createdTask.id, fileIds);
      
      res.status(202).json(createdTask);
    } catch (error) {
      console.error("Text extraction error:", error);
      res.status(500).json({ message: "Failed to start text extraction" });
    }
  });

  // Merge PDFs
  app.post("/api/merge", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        fileIds: z.array(z.number()).min(2),
        outputFilename: z.string().default("merged.pdf"),
      });
      
      const { fileIds, outputFilename } = schema.parse(req.body);
      
      // Create a processing task
      const task = {
        type: "merge",
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        inputFiles: fileIds,
      };
      
      const validatedTask = insertProcessingTaskSchema.parse(task);
      const createdTask = await storage.createProcessingTask(validatedTask);
      
      // Process merging asynchronously
      mergePdfFiles(createdTask.id, fileIds, outputFilename);
      
      res.status(202).json(createdTask);
    } catch (error) {
      console.error("Merge error:", error);
      res.status(500).json({ message: "Failed to start PDF merging" });
    }
  });

  // Convert PDF to images
  app.post("/api/convert-to-images", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        fileId: z.number(),
        format: z.enum(["png", "jpg"]).default("png"),
      });
      
      const { fileId, format } = schema.parse(req.body);
      
      // Create a processing task
      const task = {
        type: "convert_to_image",
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        inputFiles: [fileId],
      };
      
      const validatedTask = insertProcessingTaskSchema.parse(task);
      const createdTask = await storage.createProcessingTask(validatedTask);
      
      // Process conversion asynchronously
      convertPdfToImages(createdTask.id, fileId, format);
      
      res.status(202).json(createdTask);
    } catch (error) {
      console.error("Conversion error:", error);
      res.status(500).json({ message: "Failed to start PDF to image conversion" });
    }
  });

  // Get task status
  app.get("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const task = await storage.getProcessingTask(id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Task status error:", error);
      res.status(500).json({ message: "Failed to get task status" });
    }
  });

  // Get result file
  app.get("/api/results/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid file ID" });
      }
      
      const file = await storage.getPdfFile(id);
      if (!file) {
        return res.status(404).json({ message: "Result file not found" });
      }
      
      if (file.mimetype === 'application/pdf') {
        res.setHeader('Content-Type', 'application/pdf');
      } else if (file.mimetype === 'text/plain') {
        res.setHeader('Content-Type', 'text/plain');
      } else if (file.mimetype.startsWith('image/')) {
        res.setHeader('Content-Type', file.mimetype);
      }
      
      res.setHeader('Content-Disposition', `attachment; filename="${file.originalFilename}"`);
      
      const fileStream = fs.createReadStream(file.path);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Result file error:", error);
      res.status(500).json({ message: "Failed to get result file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Async processing functions
async function extractTextFromPdf(taskId: number, fileIds: number[]) {
  try {
    // Update task status to processing
    await storage.updateProcessingTask(taskId, {
      status: "processing",
      updatedAt: new Date().toISOString(),
    });

    const outputFiles = [];
    
    for (const fileId of fileIds) {
      const file = await storage.getPdfFile(fileId);
      if (!file) continue;
      
      try {
        // Read the PDF
        const pdfData = await fs.promises.readFile(file.path);
        const pdfDoc = await PDFDocument.load(pdfData);
        
        let extractedText = '';
        const pageCount = pdfDoc.getPageCount();
        
        for (let i = 0; i < pageCount; i++) {
          const page = pdfDoc.getPage(i);
          const textContent = await page.getTextContent();
          extractedText += `--- Page ${i+1} ---\n`;
          extractedText += textContent.items.map(item => item.str).join(' ');
          extractedText += '\n\n';
        }
        
        // Save the extracted text
        const outputFilename = `${file.originalFilename.replace('.pdf', '')}-text-${Date.now()}.txt`;
        const outputPath = path.join(uploadsDir, outputFilename);
        await fs.promises.writeFile(outputPath, extractedText);
        
        // Save file info
        const textFile = {
          filename: outputFilename,
          originalFilename: outputFilename,
          filesize: Buffer.byteLength(extractedText),
          mimetype: 'text/plain',
          uploadedAt: new Date().toISOString(),
          path: outputPath,
        };
        
        const savedFile = await storage.savePdfFile(textFile);
        outputFiles.push({
          id: savedFile.id,
          filename: savedFile.filename,
          type: 'text/plain'
        });
      } catch (error) {
        console.error(`Error extracting text from ${file.filename}:`, error);
      }
    }
    
    // Update task with output files
    await storage.updateProcessingTask(taskId, {
      status: "completed",
      updatedAt: new Date().toISOString(),
      outputFiles,
    });
  } catch (error) {
    console.error("Text extraction failed:", error);
    await storage.updateProcessingTask(taskId, {
      status: "failed",
      updatedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

async function mergePdfFiles(taskId: number, fileIds: number[], outputFilename: string) {
  try {
    // Update task status to processing
    await storage.updateProcessingTask(taskId, {
      status: "processing",
      updatedAt: new Date().toISOString(),
    });
    
    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();
    
    // Get all files and sort by fileIds order
    const files = [];
    for (const fileId of fileIds) {
      const file = await storage.getPdfFile(fileId);
      if (file) files.push(file);
    }
    
    // Merge all PDFs
    for (const file of files) {
      try {
        const pdfData = await fs.promises.readFile(file.path);
        const pdfDoc = await PDFDocument.load(pdfData);
        
        // Copy all pages from the source document
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
      } catch (error) {
        console.error(`Error merging ${file.filename}:`, error);
      }
    }
    
    // Save the merged PDF
    const pdfBytes = await mergedPdf.save();
    
    if (!outputFilename.toLowerCase().endsWith('.pdf')) {
      outputFilename += '.pdf';
    }
    
    const mergedFilename = `merged-${Date.now()}-${nanoid(6)}.pdf`;
    const outputPath = path.join(uploadsDir, mergedFilename);
    await fs.promises.writeFile(outputPath, pdfBytes);
    
    // Save file info
    const mergedFile = {
      filename: mergedFilename,
      originalFilename: outputFilename,
      filesize: Buffer.byteLength(pdfBytes),
      mimetype: 'application/pdf',
      uploadedAt: new Date().toISOString(),
      path: outputPath,
    };
    
    const savedFile = await storage.savePdfFile(mergedFile);
    
    // Update task with output file
    await storage.updateProcessingTask(taskId, {
      status: "completed",
      updatedAt: new Date().toISOString(),
      outputFiles: [{
        id: savedFile.id,
        filename: savedFile.filename,
        type: 'application/pdf'
      }],
    });
  } catch (error) {
    console.error("PDF merging failed:", error);
    await storage.updateProcessingTask(taskId, {
      status: "failed",
      updatedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

async function convertPdfToImages(taskId: number, fileId: number, format: string) {
  try {
    // Update task status to processing
    await storage.updateProcessingTask(taskId, {
      status: "processing",
      updatedAt: new Date().toISOString(),
    });
    
    const file = await storage.getPdfFile(fileId);
    if (!file) {
      throw new Error("File not found");
    }
    
    // Read the PDF
    const pdfData = await fs.promises.readFile(file.path);
    const pdfDoc = await PDFDocument.load(pdfData);
    
    const outputFiles = [];
    const pageCount = pdfDoc.getPageCount();
    
    for (let i = 0; i < pageCount; i++) {
      try {
        const page = pdfDoc.getPage(i);
        
        // Create a new document with just this page
        const singlePagePdf = await PDFDocument.create();
        const [copiedPage] = await singlePagePdf.copyPages(pdfDoc, [i]);
        singlePagePdf.addPage(copiedPage);
        
        // Save the single page PDF
        const pdfBytes = await singlePagePdf.save();
        
        const pageFilename = `${file.originalFilename.replace('.pdf', '')}-page-${i+1}-${Date.now()}.pdf`;
        const pagePath = path.join(uploadsDir, pageFilename);
        await fs.promises.writeFile(pagePath, pdfBytes);
        
        // Save file info for each page
        const pageFile = {
          filename: pageFilename,
          originalFilename: pageFilename,
          filesize: Buffer.byteLength(pdfBytes),
          mimetype: 'application/pdf',
          uploadedAt: new Date().toISOString(),
          path: pagePath,
        };
        
        const savedFile = await storage.savePdfFile(pageFile);
        outputFiles.push({
          id: savedFile.id,
          filename: savedFile.filename,
          type: 'application/pdf'
        });
      } catch (error) {
        console.error(`Error converting page ${i+1}:`, error);
      }
    }
    
    // Update task with output files
    await storage.updateProcessingTask(taskId, {
      status: "completed",
      updatedAt: new Date().toISOString(),
      outputFiles,
    });
  } catch (error) {
    console.error("PDF to image conversion failed:", error);
    await storage.updateProcessingTask(taskId, {
      status: "failed",
      updatedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
