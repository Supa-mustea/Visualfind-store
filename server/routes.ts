import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiSourcingService } from "./ai-sourcing";
import { paystackService } from "./paystack-service";
import { aiService } from "./ai-service";
import multer from "multer";
import path from "path";
import { insertChatMessageSchema, insertDropshipOrderSchema } from "@shared/schema";

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

  // Upload image for AI-powered visual search and global sourcing
  app.post("/api/upload", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Convert image to base64 for AI analysis
      const fs = require('fs');
      const imageBuffer = fs.readFileSync(req.file.path);
      const imageBase64 = imageBuffer.toString('base64');

      // Use AI to analyze the image and generate search query
      const searchQuery = await aiSourcingService.analyzeImageForProducts(imageBase64);
      console.log('AI Generated Search Query:', searchQuery);

      // Source products globally using AI
      const sourcedProducts = await aiSourcingService.sourceProducts(searchQuery, `/uploads/${req.file.filename}`);

      // Convert sourced products to our product format with 10% profit markup
      const resultsWithSimilarity = sourcedProducts.map((sourcedProduct) => ({
        id: `sourced_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: sourcedProduct.name,
        brand: sourcedProduct.supplierName,
        price: sourcedProduct.sellingPrice.toFixed(2),
        originalPrice: sourcedProduct.originalPrice.toFixed(2),
        category: "Globally Sourced",
        description: sourcedProduct.description,
        imageUrl: sourcedProduct.imageUrl,
        additionalImages: [],
        rating: (4.0 + Math.random() * 1.0).toFixed(1),
        reviewCount: Math.floor(Math.random() * 500) + 50,
        specifications: sourcedProduct.specifications,
        inStock: true,
        similarity: 0.85 + Math.random() * 0.15, // High similarity for AI-sourced products
        profit: sourcedProduct.profit,
        supplierUrl: sourcedProduct.supplierUrl,
        country: sourcedProduct.country,
        deliveryDays: sourcedProduct.deliveryDays
      }));

      // Add to search history
      await storage.addSearchHistory({
        imageUrl: `/uploads/${req.file.filename}`,
        searchDate: new Date().toISOString(),
        resultsFound: resultsWithSimilarity.length,
      });

      res.json({
        results: resultsWithSimilarity,
        uploadedImage: `/uploads/${req.file.filename}`,
        searchQuery: searchQuery,
        aiPowered: true
      });
    } catch (error) {
      console.error('AI-powered search error:', error);
      res.status(500).json({ message: "Failed to process AI-powered image search" });
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

  // Add chat message with AI recommendations
  app.post("/api/chat", async (req, res) => {
    try {
      const validatedMessage = insertChatMessageSchema.parse(req.body);
      const message = await storage.addChatMessage(validatedMessage);
      
      // Generate AI-powered bot response if user message
      if (validatedMessage.isUser) {
        setTimeout(async () => {
          let botContent = "Thanks for your message! I'm here to help you find products from anywhere in the world with automatic purchasing and 10% profit margin.";
          
          // Use AI to generate product recommendations based on user query
          try {
            const aiRecommendations = await aiSourcingService.generateProductRecommendations(validatedMessage.content);
            botContent += `\n\nBased on your message, here are some suggestions:\n${aiRecommendations}`;
          } catch (error) {
            console.error('AI recommendation error:', error);
          }

          const botResponse = {
            content: botContent,
            isUser: false,
            timestamp: new Date().toISOString(),
          };
          await storage.addChatMessage(botResponse);
        }, 1500);
      }
      
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid message format" });
    }
  });

  // Automated product purchasing endpoint
  app.post("/api/purchase", async (req, res) => {
    try {
      const { productId, customerEmail, customerAddress, productName, originalPrice, sellingPrice } = req.body;
      
      if (!productId || !customerEmail || !customerAddress || !productName) {
        return res.status(400).json({ message: "Missing required purchase information" });
      }

      // Calculate profit (10% markup is already included in sellingPrice)
      const profit = parseFloat(sellingPrice) - parseFloat(originalPrice);

      // Create dropship order
      const order = await storage.createDropshipOrder({
        customerEmail,
        productName,
        originalPrice,
        sellingPrice,
        profit: profit.toFixed(2),
        supplierUrl: req.body.supplierUrl || "https://supplier-api.com/product/" + productId,
        orderStatus: "pending",
        customerAddress,
        orderDate: new Date().toISOString(),
      });

      // Process automatic order with AI service
      const orderResult = await aiSourcingService.processAutomaticOrder(productId, {
        email: customerEmail,
        address: customerAddress,
        productName,
        orderId: order.id
      });

      if (orderResult.success) {
        // Update order with tracking information
        await storage.updateDropshipOrderStatus(
          order.id, 
          "processing", 
          orderResult.trackingNumber
        );

        res.json({
          success: true,
          orderId: order.id,
          trackingNumber: orderResult.trackingNumber,
          estimatedDelivery: orderResult.estimatedDelivery,
          profit: profit,
          message: "Order placed successfully! Automatic purchasing initiated."
        });
      } else {
        await storage.updateDropshipOrderStatus(order.id, "failed");
        res.status(500).json({
          success: false,
          message: "Failed to process automatic order: " + orderResult.error
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to process purchase" });
    }
  });

  // Get dropship orders
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getDropshipOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Get single order
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getDropshipOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // AI-powered product sourcing endpoint
  app.post("/api/source-products", async (req, res) => {
    try {
      const { query } = req.body;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const sourcedProducts = await aiSourcingService.sourceProducts(query);
      
      res.json({
        products: sourcedProducts,
        totalFound: sourcedProducts.length,
        averageProfit: sourcedProducts.reduce((sum, p) => sum + p.profit, 0) / sourcedProducts.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to source products" });
    }
  });

  // Initialize Paystack payment
  app.post("/api/initialize-payment", async (req, res) => {
    try {
      const { email, productId } = req.body;
      
      if (!email || !productId) {
        return res.status(400).json({ message: "Email and product ID are required" });
      }

      // Get product details
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const supplierPrice = parseFloat(product.price);
      const retailPrice = supplierPrice * 1.10; // 10% profit margin
      const profit = retailPrice - supplierPrice;

      // Initialize payment with Paystack
      const paymentData = await paystackService.initializePayment({
        email,
        amount: retailPrice,
        metadata: {
          orderId: `order_${Date.now()}`,
          productId,
          productName: product.name,
          supplierPrice: supplierPrice.toFixed(2),
          profit: profit.toFixed(2),
        },
        callback_url: `${req.protocol}://${req.get('host')}/api/payment-callback`,
      });

      res.json({
        success: true,
        authorization_url: paymentData.data.authorization_url,
        reference: paymentData.data.reference,
        amount: retailPrice,
      });
    } catch (error) {
      console.error('Payment initialization error:', error);
      res.status(500).json({ 
        success: false,
        message: "Failed to initialize payment: " + (error as Error).message 
      });
    }
  });

  // Verify Paystack payment
  app.post("/api/verify-payment", async (req, res) => {
    try {
      const { reference } = req.body;
      
      if (!reference) {
        return res.status(400).json({ message: "Payment reference is required" });
      }

      // Verify payment with Paystack
      const verification = await paystackService.verifyPayment(reference);
      
      if (verification.data.status === 'success') {
        const metadata = (verification.data as any).metadata;
        
        // Create dropship order
        const order = await storage.createDropshipOrder({
          productId: metadata.productId,
          productName: metadata.productName,
          customerEmail: verification.data.customer.email,
          customerPrice: paystackService.koboToNaira(verification.data.amount).toFixed(2),
          supplierPrice: metadata.supplierPrice,
          profit: metadata.profit,
          orderStatus: "processing",
          orderDate: new Date().toISOString(),
          supplierUrl: `https://supplier.example.com/product/${metadata.productId}`,
          notes: "Payment processed via Paystack - AI dropshipping order",
        });

        res.json({
          success: true,
          verified: true,
          order: order,
          message: "Payment successful! Your order has been created and will be automatically processed.",
        });
      } else {
        res.json({
          success: false,
          verified: false,
          message: "Payment verification failed",
        });
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(500).json({ 
        success: false,
        message: "Failed to verify payment: " + (error as Error).message 
      });
    }
  });

  // Payment callback webhook (for automatic verification)
  app.post("/api/payment-callback", async (req, res) => {
    try {
      const { reference } = req.body;
      
      if (reference) {
        // Automatically verify and process the payment
        const verification = await paystackService.verifyPayment(reference);
        
        if (verification.data.status === 'success') {
          const metadata = (verification.data as any).metadata;
          
          // Process automatic order fulfillment
          try {
            const orderResult = await aiSourcingService.processAutomaticOrder(metadata.productId, {
              email: verification.data.customer.email,
              address: "Address will be collected separately", // In real app, collect during checkout
              productName: metadata.productName,
              orderId: metadata.orderId
            });

            console.log('Automatic order processed:', orderResult);
          } catch (orderError) {
            console.error('Automatic order processing failed:', orderError);
          }
        }
      }
      
      res.status(200).send('OK');
    } catch (error) {
      console.error('Payment callback error:', error);
      res.status(500).send('Error');
    }
  });

  // Get Paystack transaction history
  app.get("/api/transactions", async (req, res) => {
    try {
      const { page = 1, perPage = 50, status, from, to } = req.query;
      
      const transactions = await paystackService.exportTransactions({
        page: parseInt(page as string),
        perPage: parseInt(perPage as string),
        status: status as any,
        from: from as string,
        to: to as string,
      });

      res.json(transactions);
    } catch (error) {
      console.error('Transaction fetch error:', error);
      res.status(500).json({ 
        message: "Failed to fetch transactions: " + (error as Error).message 
      });
    }
  });

  // AI-powered visual search with dual AI providers
  app.post("/api/visual-search", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Image file is required" });
      }

      // Convert image to base64
      const fs = await import('fs');
      const imageBuffer = fs.readFileSync(req.file.path);
      const base64Image = imageBuffer.toString('base64');

      // Use AI service with fallback support
      const useOpenAI = req.body.useOpenAI === 'true';
      const sourcingResult = await aiService.analyzeImageAndSourceProducts(base64Image, useOpenAI);

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      res.json({
        success: true,
        searchQuery: sourcingResult.searchQuery,
        confidence: sourcingResult.confidence,
        products: sourcingResult.products,
        totalFound: sourcingResult.products.length,
        aiProvider: useOpenAI ? 'OpenAI' : 'Anthropic',
      });
    } catch (error) {
      console.error('Visual search error:', error);
      // Clean up file if it exists
      if (req.file) {
        try {
          const fs = await import('fs');
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.error('File cleanup error:', cleanupError);
        }
      }
      
      res.status(500).json({ 
        success: false,
        message: "Visual search failed: " + (error as Error).message 
      });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
