interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
    };
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
    };
  };
}

interface PaystackPaymentLinkResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    active: boolean;
    currency: string;
    type: string;
    amount: number;
    archived: boolean;
    description: string;
    line_items: any[];
    tax: any[];
    redirect_url: string;
    success_message: string;
    notification_email: string;
    invoice_limit: number;
    url: string;
    split_code: string;
    created_at: string;
    updated_at: string;
  };
}

export class PaystackService {
  private apiKey: string;
  private baseUrl = 'https://api.paystack.co';

  constructor() {
    this.apiKey = process.env.PAYSTACK_SECRET_KEY!;
    if (!this.apiKey) {
      throw new Error('PAYSTACK_SECRET_KEY is required');
    }
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Paystack API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    return await response.json();
  }

  async initializePayment(data: {
    email: string;
    amount: number; // in kobo (smallest currency unit)
    reference?: string;
    callback_url?: string;
    metadata?: {
      orderId: string;
      productId: string;
      productName: string;
      supplierPrice: string;
      profit: string;
    };
  }): Promise<PaystackInitializeResponse> {
    const paymentData = {
      ...data,
      amount: Math.round(data.amount * 100), // Convert to kobo
      reference: data.reference || `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    return await this.makeRequest('/transaction/initialize', 'POST', paymentData);
  }

  async verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
    return await this.makeRequest(`/transaction/verify/${reference}`);
  }

  async createPaymentLink(data: {
    name: string;
    description: string;
    amount: number;
    redirect_url?: string;
    metadata?: any;
  }): Promise<PaystackPaymentLinkResponse> {
    const linkData = {
      ...data,
      amount: Math.round(data.amount * 100), // Convert to kobo
      currency: 'NGN',
      type: 'payment',
    };

    return await this.makeRequest('/page', 'POST', linkData);
  }

  async createSubscriptionPlan(data: {
    name: string;
    interval: 'daily' | 'weekly' | 'monthly' | 'annually';
    amount: number;
    description?: string;
  }) {
    const planData = {
      ...data,
      amount: Math.round(data.amount * 100), // Convert to kobo
      currency: 'NGN',
    };

    return await this.makeRequest('/plan', 'POST', planData);
  }

  async createCustomer(data: {
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    metadata?: any;
  }) {
    return await this.makeRequest('/customer', 'POST', data);
  }

  async chargeAuthorization(data: {
    authorization_code: string;
    email: string;
    amount: number;
    reference?: string;
    metadata?: any;
  }) {
    const chargeData = {
      ...data,
      amount: Math.round(data.amount * 100), // Convert to kobo
      currency: 'NGN',
    };

    return await this.makeRequest('/transaction/charge_authorization', 'POST', chargeData);
  }

  async getTransactionTimeline(idOrReference: string) {
    return await this.makeRequest(`/transaction/timeline/${idOrReference}`);
  }

  async exportTransactions(params?: {
    perPage?: number;
    page?: number;
    from?: string;
    to?: string;
    customer?: string;
    status?: 'success' | 'failed' | 'abandoned';
    currency?: string;
    amount?: number;
    settled?: boolean;
    settlement?: string;
    payment_page?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/transaction${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await this.makeRequest(endpoint);
  }

  // Helper method to convert amount from Naira to Kobo
  nairaToKobo(amount: number): number {
    return Math.round(amount * 100);
  }

  // Helper method to convert amount from Kobo to Naira
  koboToNaira(amount: number): number {
    return amount / 100;
  }
}

export const paystackService = new PaystackService();