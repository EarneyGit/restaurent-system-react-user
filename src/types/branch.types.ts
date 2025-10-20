export interface Address {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export interface Contact {
    email: string;
    phone: string;
}

export interface Branch {
  id: string;
  name: string;
  address: Address;
  contact: Contact;
  isActive: boolean;
  settings?: {
    isCollectionEnabled: boolean;
    isDeliveryEnabled: boolean;
    isTableOrderingEnabled: boolean;
  };
  orderingTimes: any;
}

export interface BranchResponse {
    success: boolean;
    message: string;
    data: Branch[];
} 