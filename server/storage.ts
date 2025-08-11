import { type Product, type InsertProduct, type SearchHistory, type InsertSearchHistory, type ChatMessage, type InsertChatMessage } from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private searchHistory: Map<string, SearchHistory>;
  private chatMessages: Map<string, ChatMessage>;

  constructor() {
    this.products = new Map();
    this.searchHistory = new Map();
    this.chatMessages = new Map();
    this.initializeProducts();
    this.initializeChatHistory();
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
      content: "Hi! I'm Sarah. How can I help you find the perfect product today?",
      isUser: false,
      timestamp: new Date().toISOString(),
    };
    const id = randomUUID();
    this.chatMessages.set(id, { ...welcomeMessage, id });
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
}

export const storage = new MemStorage();
