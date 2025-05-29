import axios from '../config/axios.config';

export interface DeliveryAddress {
  fullAddress: string;
  postcode: string;
  lat: number;
  lng: number;
}

export interface DeliveryZone {
  id: string;
  postcode: string;
  isActive: boolean;
  deliveryFee: number;
  minimumOrder: number;
  estimatedTime: string;
}

const deliveryService = {
  // Check if delivery is available for a postcode
  async checkDeliveryAvailability(postcode: string): Promise<DeliveryZone | null> {
    try {
      const response = await axios.get(`/api/settings/delivery-charges?postcode=${postcode}`);
      return response.data;
    } catch (error) {
      console.error('Error checking delivery availability:', error);
      return null;
    }
  },

  // Get delivery fee for a postcode
  async getDeliveryFee(postcode: string): Promise<number> {
    try {
      const response = await axios.get(`/api/settings/delivery-charges?postcode=${postcode}`);
      return response.data.deliveryFee || 0;
    } catch (error) {
      console.error('Error getting delivery fee:', error);
      return 0;
    }
  },

  // Save delivery address
  async saveDeliveryAddress(address: DeliveryAddress): Promise<boolean> {
    try {
      const response = await axios.post('/api/settings/delivery-address', address);
      return response.data.success || false;
    } catch (error) {
      console.error('Error saving delivery address:', error);
      return false;
    }
  },

  // Get all delivery zones
  async getDeliveryZones(): Promise<DeliveryZone[]> {
    try {
      const response = await axios.get('/api/settings/delivery-charges');
      return response.data;
    } catch (error) {
      console.error('Error getting delivery zones:', error);
      return [];
    }
  }
};

export default deliveryService; 