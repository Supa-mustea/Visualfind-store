import { 
  type Product, type InsertProduct, 
  type SearchHistory, type InsertSearchHistory, 
  type ChatMessage, type InsertChatMessage,
  type DropshipOrder, type InsertDropshipOrder,
  type Supplier, type InsertSupplier
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Products
  getProducts(filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    search?: string;
  }): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Search History
  getSearchHistory(): Promise<SearchHistory[]>;
  addSearchHistory(search: InsertSearchHistory): Promise<SearchHistory>;
  
  // Chat Messages
  getChatMessages(): Promise<ChatMessage[]>;
  addChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Dropship Orders
  getDropshipOrders(): Promise<DropshipOrder[]>;
  getDropshipOrder(id: string): Promise<DropshipOrder | undefined>;
  createDropshipOrder(order: InsertDropshipOrder): Promise<DropshipOrder>;
  updateDropshipOrderStatus(id: string, status: string, trackingNumber?: string): Promise<void>;
  
  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  getActiveSuppliers(): Promise<Supplier[]>;
  addSupplier(supplier: InsertSupplier): Promise<Supplier>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private searchHistory: Map<string, SearchHistory>;
  private chatMessages: Map<string, ChatMessage>;
  private dropshipOrders: Map<string, DropshipOrder>;
  private suppliers: Map<string, Supplier>;

  constructor() {
    this.products = new Map();
    this.searchHistory = new Map();
    this.chatMessages = new Map();
    this.dropshipOrders = new Map();
    this.suppliers = new Map();
    this.initializeProducts();
    this.initializeChatHistory();
    this.initializeDropshipOrders();
    this.initializeSuppliers();
  }

  private initializeProducts() {
    const sampleProducts: InsertProduct[] = [
      {
        name: "Modern L-Shaped Sectional Sofa",
        brand: "West Elm",
        price: "1299.00",
        originalPrice: "1599.00",
        category: "Furniture",
        description: "This modern L-shaped sectional sofa combines comfort and style, perfect for contemporary living spaces. Features premium cushioning and durable fabric upholstery.",
        imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        additionalImages: [
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
        ],
        rating: "4.8",
        reviewCount: 127,
        specifications: [
          "Dimensions: 108\" W x 68\" D x 32\" H",
          "Material: 100% Polyester fabric",
          "Frame: Kiln-dried hardwood",
          "Warranty: 5 years"
        ],
        inStock: true,
      },
      {
        name: "Premium Leather Armchair",
        brand: "CB2",
        price: "899.00",
        category: "Furniture",
        description: "Elegant leather armchair with premium craftsmanship and timeless design.",
        imageUrl: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        additionalImages: [],
        rating: "4.5",
        reviewCount: 89,
        specifications: [
          "Dimensions: 32\" W x 34\" D x 30\" H",
          "Material: Genuine leather",
          "Frame: Solid oak"
        ],
        inStock: true,
      },
      {
        name: "Mid-Century Coffee Table",
        brand: "Article",
        price: "449.00",
        category: "Furniture",
        description: "Clean-lined coffee table with mid-century modern aesthetic.",
        imageUrl: "https://pixabay.com/get/gca232eaae06e0b8deb774e51b2f0afcb739b3ae886630effe8a79ac884f5ba4b99619cfc82cac2bdcf125278b6a929d6f91519ba8fce4a9a10ee40d1c24f4bbf_1280.jpg",
        additionalImages: [],
        rating: "4.9",
        reviewCount: 203,
        specifications: [
          "Dimensions: 48\" W x 24\" D x 16\" H",
          "Material: Walnut veneer",
          "Style: Mid-century modern"
        ],
        inStock: true,
      },
      {
        name: "Brass Pendant Light",
        brand: "West Elm",
        price: "199.00",
        category: "Lighting",
        description: "Stylish brass pendant light perfect for dining areas and kitchens.",
        imageUrl: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        additionalImages: [],
        rating: "4.3",
        reviewCount: 156,
        specifications: [
          "Dimensions: 12\" Diameter x 8\" H",
          "Material: Brass finish",
          "Bulb: E26 (not included)"
        ],
        inStock: true,
      },
      {
        name: "Industrial Bookshelf",
        brand: "CB2",
        price: "599.00",
        category: "Furniture",
        description: "Modern industrial-style bookshelf with metal frame and wood shelves.",
        imageUrl: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        additionalImages: [],
        rating: "4.2",
        reviewCount: 74,
        specifications: [
          "Dimensions: 72\" H x 36\" W x 12\" D",
          "Material: Metal frame, wood shelves",
          "Style: Industrial modern"
        ],
        inStock: true,
      },
      {
        name: "Walnut Dining Table",
        brand: "Article",
        price: "849.00",
        category: "Furniture",
        description: "Elegant walnut dining table perfect for modern dining rooms.",
        imageUrl: "https://pixabay.com/get/gc39745c921f637f49336c36b1417ec8045569cd8e06522e138d81d687efd1b60c03d102d0e468bd7c254609fef099c4562d1b58f5cfc004a0c5f41c2d8843322_1280.jpg",
        additionalImages: [],
        rating: "4.7",
        reviewCount: 192,
        specifications: [
          "Dimensions: 72\" W x 36\" D x 30\" H",
          "Material: Solid walnut",
          "Seats: 6-8 people"
        ],
        inStock: true,
      },
      {
        name: "iPhone 15 Pro Max",
        brand: "Apple",
        price: "1199.00",
        originalPrice: "1299.00",
        category: "Mobile Phones",
        description: "Latest iPhone with A17 Pro chip, titanium design, and advanced camera system. Perfect for photography and gaming.",
        imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        additionalImages: [],
        rating: "4.9",
        reviewCount: 1543,
        specifications: [
          "Display: 6.7-inch Super Retina XDR",
          "Chip: A17 Pro",
          "Storage: 256GB",
          "Camera: 48MP Main + 12MP Ultra Wide",
          "Battery: All-day battery life"
        ],
        inStock: true,
      },
      {
        name: "Samsung Galaxy S24 Ultra",
        brand: "Samsung",
        price: "1099.00",
        originalPrice: "1199.00",
        category: "Mobile Phones",
        description: "Premium Android smartphone with S Pen, advanced cameras, and powerful performance for productivity and creativity.",
        imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        additionalImages: [],
        rating: "4.8",
        reviewCount: 1287,
        specifications: [
          "Display: 6.8-inch Dynamic AMOLED 2X",
          "Processor: Snapdragon 8 Gen 3",
          "Storage: 256GB",
          "Camera: 200MP Main + Ultra Wide + Telephoto",
          "S Pen: Built-in stylus"
        ],
        inStock: true,
      },
      {
        name: "MacBook Pro 14-inch M3",
        brand: "Apple",
        price: "1999.00",
        originalPrice: "2199.00",
        category: "Laptops",
        description: "Powerful laptop with M3 chip, stunning Liquid Retina XDR display, and all-day battery life for professionals.",
        imageUrl: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        additionalImages: [],
        rating: "4.8",
        reviewCount: 892,
        specifications: [
          "Chip: Apple M3",
          "Memory: 16GB unified memory",
          "Storage: 512GB SSD",
          "Display: 14.2-inch Liquid Retina XDR",
          "Battery: Up to 18 hours"
        ],
        inStock: true,
      },
      {
        name: "Dell XPS 13 Plus",
        brand: "Dell",
        price: "1299.00",
        originalPrice: "1499.00",
        category: "Laptops",
        description: "Ultra-thin laptop with Intel Core i7, premium build quality, and innovative design for modern professionals.",
        imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        additionalImages: [],
        rating: "4.6",
        reviewCount: 567,
        specifications: [
          "Processor: Intel Core i7-1360P",
          "Memory: 16GB LPDDR5",
          "Storage: 512GB SSD",
          "Display: 13.4-inch InfinityEdge",
          "Weight: 2.73 lbs"
        ],
        inStock: true,
      },
      {
        name: "Sony WH-1000XM5 Headphones",
        brand: "Sony",
        price: "399.99",
        originalPrice: "449.99",
        category: "Electronics",
        description: "Industry-leading noise canceling wireless headphones with exceptional sound quality and 30-hour battery life.",
        imageUrl: "https://images.unsplash.com/photo-1484704849700-f032a568e944?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        additionalImages: [],
        rating: "4.7",
        reviewCount: 2156,
        specifications: [
          "Noise Canceling: Industry-leading",
          "Battery: 30 hours playback",
          "Connectivity: Bluetooth 5.2",
          "Audio: 30mm drivers",
          "Weight: 250g"
        ],
        inStock: true,
      },
      {
        name: "Gaming Mechanical Keyboard",
        brand: "Razer",
        price: "179.99",
        originalPrice: "199.99",
        category: "Electronics",
        description: "High-performance mechanical gaming keyboard with RGB lighting and tactile switches for ultimate gaming experience.",
        imageUrl: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        additionalImages: [],
        rating: "4.8",
        reviewCount: 1647,
        specifications: [
          "Switches: Mechanical tactile",
          "Lighting: RGB Chroma",
          "Layout: Full-size 104 keys",
          "Connectivity: USB-C",
          "Features: Programmable keys"
        ],
        inStock: true,
      },
      {
        name: "Designer Leather Handbag",
        brand: "Michael Kors",
        price: "299.00",
        originalPrice: "399.00",
        category: "Accessories",
        description: "Elegant leather handbag with gold-tone hardware and spacious interior. Perfect for both work and casual occasions.",
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        additionalImages: [],
        rating: "4.6",
        reviewCount: 743,
        specifications: [
          "Material: Genuine leather",
          "Dimensions: 12\" W x 9\" H x 6\" D",
          "Hardware: Gold-tone",
          "Interior: Multiple compartments",
          "Strap: Adjustable shoulder strap"
        ],
        inStock: true,
      },
      {
        name: "Luxury Watch Collection",
        brand: "Fossil",
        price: "249.99",
        originalPrice: "299.99",
        category: "Accessories",
        description: "Premium analog watch with stainless steel case and genuine leather strap. Timeless elegance for any occasion.",
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        additionalImages: [],
        rating: "4.5",
        reviewCount: 689,
        specifications: [
          "Case: Stainless steel",
          "Strap: Genuine leather",
          "Movement: Quartz",
          "Water Resistance: 50m",
          "Warranty: 2 years"
        ],
        inStock: true,
      },
      {
        name: "Premium Cotton T-Shirt",
        brand: "Uniqlo",
        price: "29.99",
        originalPrice: "39.99",
        category: "Clothing",
        description: "Ultra-soft premium cotton t-shirt with perfect fit and breathable fabric. Available in multiple colors.",
        imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        additionalImages: [],
        rating: "4.5",
        reviewCount: 1285,
        specifications: [
          "Material: 100% Premium Cotton",
          "Fit: Regular fit",
          "Care: Machine washable",
          "Sizes: XS-XXL available",
          "Colors: 8 colors available"
        ],
        inStock: true,
      },
      {
        name: "Designer Jeans",
        brand: "Levi's",
        price: "89.99",
        originalPrice: "119.99",
        category: "Clothing",
        description: "Classic straight-fit jeans with premium denim and timeless styling. A wardrobe essential for every season.",
        imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        additionalImages: [],
        rating: "4.7",
        reviewCount: 956,
        specifications: [
          "Material: 99% Cotton, 1% Elastane",
          "Fit: Straight fit",
          "Rise: Mid-rise",
          "Care: Machine washable",
          "Sizes: 28-40 available"
        ],
        inStock: true,
      },
    ];

    sampleProducts.forEach(product => {
      const id = randomUUID();
      this.products.set(id, {
        ...product,
        id,
        description: product.description || null,
        originalPrice: product.originalPrice || null,
        additionalImages: product.additionalImages || [],
        rating: product.rating || null,
        reviewCount: product.reviewCount || 0,
        specifications: product.specifications || [],
        inStock: product.inStock ?? true,
      });
    });
  }

  private initializeChatHistory() {
    const welcomeMessage: InsertChatMessage = {
      content: "Hi! I'm Sarah. How can I help you find the perfect product today? I can help you source products from anywhere in the world with automatic purchasing and 10% profit margin!",
      isUser: false,
      timestamp: new Date().toISOString(),
    };
    const id = randomUUID();
    this.chatMessages.set(id, { ...welcomeMessage, id });
  }

  private initializeDropshipOrders() {
    const sampleOrders: InsertDropshipOrder[] = [
      {
        productId: "1",
        productName: "Modern L-Shaped Sectional Sofa",
        customerEmail: "customer@example.com",
        customerPrice: "1429.89",
        supplierPrice: "1299.00",
        profit: "130.89",
        orderStatus: "processing",
        orderDate: new Date().toISOString(),
        trackingNumber: "TN123456789",
        supplierUrl: "https://supplier.example.com/sofa",
        notes: "AI-sourced from global marketplace - 10% profit margin applied",
      },
      {
        productId: "2",
        productName: "Premium Wireless Headphones",
        customerEmail: "audiophile@example.com",
        customerPrice: "362.99",
        supplierPrice: "329.99",
        profit: "32.99",
        orderStatus: "completed",
        orderDate: new Date(Date.now() - 86400000).toISOString(),
        trackingNumber: "TN987654321",
        supplierUrl: "https://supplier.example.com/headphones",
        notes: "Fast delivery from Asia - customer very satisfied",
      },
      {
        productId: "3",
        productName: "Smart Home Security Camera",
        customerEmail: "security@example.com",
        customerPrice: "142.99",
        supplierPrice: "129.99",
        profit: "13.00",
        orderStatus: "shipped",
        orderDate: new Date(Date.now() - 172800000).toISOString(),
        trackingNumber: "TN555666777",
        supplierUrl: "https://supplier.example.com/camera",
        notes: "European supplier - excellent quality",
      }
    ];

    sampleOrders.forEach(order => {
      const id = randomUUID();
      this.dropshipOrders.set(id, { 
        ...order, 
        id,
        orderStatus: order.orderStatus || "pending",
        trackingNumber: order.trackingNumber || null,
        expectedDelivery: order.expectedDelivery || null,
        notes: order.notes || null,
      });
    });
  }

  private initializeSuppliers() {
    const globalSuppliers: InsertSupplier[] = [
      {
        name: "AliExpress Global",
        baseUrl: "https://api.aliexpress.com",
        country: "China",
        shippingCost: "15.00",
        avgDeliveryDays: 14,
        isActive: true,
      },
      {
        name: "Amazon Global",
        baseUrl: "https://api.amazon.com", 
        country: "USA",
        shippingCost: "25.00",
        avgDeliveryDays: 7,
        isActive: true,
      },
      {
        name: "Walmart Global",
        baseUrl: "https://api.walmart.com",
        country: "USA", 
        shippingCost: "20.00",
        avgDeliveryDays: 10,
        isActive: true,
      }
    ];

    globalSuppliers.forEach(supplier => {
      const id = randomUUID();
      this.suppliers.set(id, {
        ...supplier,
        id,
        apiKey: supplier.apiKey || null,
        shippingCost: supplier.shippingCost || "0",
        avgDeliveryDays: supplier.avgDeliveryDays || 7,
        isActive: supplier.isActive ?? true,
      });
    });
  }

  async getProducts(filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    search?: string;
  }): Promise<Product[]> {
    let products = Array.from(this.products.values());

    if (filters) {
      if (filters.category) {
        products = products.filter(p => 
          p.category.toLowerCase().includes(filters.category!.toLowerCase())
        );
      }
      if (filters.minPrice) {
        products = products.filter(p => parseFloat(p.price) >= filters.minPrice!);
      }
      if (filters.maxPrice) {
        products = products.filter(p => parseFloat(p.price) <= filters.maxPrice!);
      }
      if (filters.brand) {
        products = products.filter(p => 
          p.brand.toLowerCase().includes(filters.brand!.toLowerCase())
        );
      }
      if (filters.search) {
        products = products.filter(p => 
          p.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
          p.description?.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }
    }

    return products;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      id,
      description: insertProduct.description || null,
      originalPrice: insertProduct.originalPrice || null,
      additionalImages: insertProduct.additionalImages || [],
      rating: insertProduct.rating || null,
      reviewCount: insertProduct.reviewCount || 0,
      specifications: insertProduct.specifications || [],
      inStock: insertProduct.inStock ?? true,
    };
    this.products.set(id, product);
    return product;
  }

  async getSearchHistory(): Promise<SearchHistory[]> {
    return Array.from(this.searchHistory.values()).sort((a, b) => 
      new Date(b.searchDate).getTime() - new Date(a.searchDate).getTime()
    );
  }

  async addSearchHistory(insertSearch: InsertSearchHistory): Promise<SearchHistory> {
    const id = randomUUID();
    const search: SearchHistory = {
      ...insertSearch,
      id,
      resultsFound: insertSearch.resultsFound ?? 0,
    };
    this.searchHistory.set(id, search);
    return search;
  }

  async getChatMessages(): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  async addChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = { ...insertMessage, id };
    this.chatMessages.set(id, message);
    return message;
  }

  // Dropship Orders
  async getDropshipOrders(): Promise<DropshipOrder[]> {
    return Array.from(this.dropshipOrders.values()).sort((a, b) => 
      new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
    );
  }

  async getDropshipOrder(id: string): Promise<DropshipOrder | undefined> {
    return this.dropshipOrders.get(id);
  }

  async createDropshipOrder(insertOrder: InsertDropshipOrder): Promise<DropshipOrder> {
    const id = randomUUID();
    const order: DropshipOrder = {
      ...insertOrder,
      id,
      orderStatus: insertOrder.orderStatus || "pending",
      trackingNumber: insertOrder.trackingNumber || null,
      expectedDelivery: insertOrder.expectedDelivery || null,
      notes: insertOrder.notes || null,
    };
    this.dropshipOrders.set(id, order);
    return order;
  }

  async updateDropshipOrderStatus(id: string, status: string, trackingNumber?: string): Promise<void> {
    const order = this.dropshipOrders.get(id);
    if (order) {
      order.orderStatus = status;
      if (trackingNumber) {
        order.trackingNumber = trackingNumber;
      }
      this.dropshipOrders.set(id, order);
    }
  }

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }

  async getActiveSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values()).filter(supplier => supplier.isActive);
  }

  async addSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const id = randomUUID();
    const supplier: Supplier = {
      ...insertSupplier,
      id,
      apiKey: insertSupplier.apiKey || null,
      shippingCost: insertSupplier.shippingCost || "0",
      avgDeliveryDays: insertSupplier.avgDeliveryDays || 7,
      isActive: insertSupplier.isActive ?? true,
    };
    this.suppliers.set(id, supplier);
    return supplier;
  }
}

export const storage = new MemStorage();
