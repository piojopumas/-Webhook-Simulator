export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  buyerData: {
    name: string;
    email: string;
    document: string;
    documentType: string;
    country: string;
    city: string;
    productName: string;
    productUcode: string;
    planName: string;
    price: number;
    currency: string;
    hottok: string;
  };
}

export interface WebhookLog {
  id: string;
  webhookId: string;
  timestamp: string;
  event: string;
  duration: number;
  status: 'success' | 'failure';
  request: any;
  response: any;
  error?: string;
}
