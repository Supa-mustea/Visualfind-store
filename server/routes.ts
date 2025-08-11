import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import { insertChatMessageSchema } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all products with optional filters
  app.get("/api/products", async (req, res) => {
    try {
      const { category, minPrice, maxPrice, brand, search } = req.query;
      
      const filters = {
        category: category as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        brand: brand as string,
        search: search as string,
      };

      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get single product by ID
  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Upload image for visual search
  app.post("/api/upload", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Simulate visual search by returning all products with mock similarity scores
      const products = await storage.getProducts();
      const resultsWithSimilarity = products.map((product, index) => ({
        ...product,
        similarity: Math.max(0.75, Math.random() * 0.25 + 0.75), // Random similarity between 75-100%
      })).sort((a, b) => b.similarity - a.similarity);

      // Add to search history
      await storage.addSearchHistory({
        imageUrl: `/uploads/${req.file.filename}`,
        searchDate: new Date().toISOString(),
        resultsFound: resultsWithSimilarity.length,
      });

      res.json({
        results: resultsWithSimilarity,
        uploadedImage: `/uploads/${req.file.filename}`,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to process image upload" });
    }
  });

  // Get search history
  app.get("/api/search-history", async (req, res) => {
    try {
      const history = await storage.getSearchHistory();
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch search history" });
    }
  });

  // Get chat messages
  app.get("/api/chat", async (req, res) => {
    try {
      const messages = await storage.getChatMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  // Add chat message
  app.post("/api/chat", async (req, res) => {
    try {
      const validatedMessage = insertChatMessageSchema.parse(req.body);
      const message = await storage.addChatMessage(validatedMessage);
      
      // Simulate bot response if user message
      if (validatedMessage.isUser) {
        setTimeout(async () => {
          const botResponse = {
            content: "Thanks for your message! I'm here to help you find the perfect product. Would you like me to help you compare some options or do you have specific questions?",
            isUser: false,
            timestamp: new Date().toISOString(),
          };
          await storage.addChatMessage(botResponse);
        }, 1000);
      }
      
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid message format" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
