export interface Address {
  fullAddress: string;
  street: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  latitude: number;
  longitude: number;
}

// Common UK addresses organized by postcode
export const ukAddresses: Record<string, Address[]> = {
  'SW1A': [
    {
      fullAddress: '10 Downing Street, London SW1A 2AA',
      street: '10 Downing Street',
      city: 'London',
      state: 'Greater London',
      postcode: 'SW1A 2AA',
      country: 'GB',
      latitude: 51.501476,
      longitude: -0.141099
    },
    {
      fullAddress: 'Buckingham Palace, London SW1A 1AA',
      street: 'Buckingham Palace',
      city: 'London',
      state: 'Greater London',
      postcode: 'SW1A 1AA',
      country: 'GB',
      latitude: 51.501476,
      longitude: -0.141099
    },
    {
      fullAddress: 'Houses of Parliament, London SW1A 0AA',
      street: 'Houses of Parliament',
      city: 'London',
      state: 'Greater London',
      postcode: 'SW1A 0AA',
      country: 'GB',
      latitude: 51.501476,
      longitude: -0.141099
    }
  ],
  'E1': [
    {
      fullAddress: '123 Brick Lane, London E1 6QL',
      street: '123 Brick Lane',
      city: 'London',
      state: 'Greater London',
      postcode: 'E1 6QL',
      country: 'GB',
      latitude: 51.501476,
      longitude: -0.141099
    },
    {
      fullAddress: '45 Commercial Street, London E1 6LT',
      street: '45 Commercial Street',
      city: 'London',
      state: 'Greater London',
      postcode: 'E1 6LT',
      country: 'GB',
      latitude: 51.501476,
      longitude: -0.141099
    },
    {
      fullAddress: '78 Whitechapel High Street, London E1 7QX',
      street: '78 Whitechapel High Street',
      city: 'London',
      state: 'Greater London',
      postcode: 'E1 7QX',
      country: 'GB',
      latitude: 51.501476,
      longitude: -0.141099
    }
  ],
  'M1': [
    {
      fullAddress: '15 Portland Street, Manchester M1 4GX',
      street: '15 Portland Street',
      city: 'Manchester',
      state: 'Greater Manchester',
      postcode: 'M1 4GX',
      country: 'GB',
      latitude: 53.4808,
      longitude: -2.2426
    },
    {
      fullAddress: '25 Piccadilly, Manchester M1 1LY',
      street: '25 Piccadilly',
      city: 'Manchester',
      state: 'Greater Manchester',
      postcode: 'M1 1LY',
      country: 'GB',
      latitude: 53.4808,
      longitude: -2.2426
    },
    {
      fullAddress: '100 Oxford Road, Manchester M1 5QA',
      street: '100 Oxford Road',
      city: 'Manchester',
      state: 'Greater Manchester',
      postcode: 'M1 5QA',
      country: 'GB',
      latitude: 53.4808,
      longitude: -2.2426
    }
  ],
  'B1': [
    {
      fullAddress: '45 New Street, Birmingham B1 2AA',
      street: '45 New Street',
      city: 'Birmingham',
      state: 'West Midlands',
      postcode: 'B1 2AA',
      country: 'GB',
      latitude: 52.4808,
      longitude: -1.8904
    },
    {
      fullAddress: '88 Corporation Street, Birmingham B1 3AB',
      street: '88 Corporation Street',
      city: 'Birmingham',
      state: 'West Midlands',
      postcode: 'B1 3AB',
      country: 'GB',
      latitude: 52.4808,
      longitude: -1.8904
    },
    {
      fullAddress: '120 Broad Street, Birmingham B1 1AB',
      street: '120 Broad Street',
      city: 'Birmingham',
      state: 'West Midlands',
      postcode: 'B1 1AB',
      country: 'GB',
      latitude: 52.4808,
      longitude: -1.8904
    }
  ],
  'G1': [
    {
      fullAddress: '1 Cathedral Square, Glasgow G1 2EN',
      street: '1 Cathedral Square',
      city: 'Glasgow',
      state: 'Glasgow City',
      postcode: 'G1 2EN',
      country: 'GB',
      latitude: 55.8602,
      longitude: -4.2518
    },
    {
      fullAddress: '45 Buchanan Street, Glasgow G1 3BA',
      street: '45 Buchanan Street',
      city: 'Glasgow',
      state: 'Glasgow City',
      postcode: 'G1 3BA',
      country: 'GB',
      latitude: 55.8602,
      longitude: -4.2518
    },
    {
      fullAddress: '78 Sauchiehall Street, Glasgow G1 3DL',
      street: '78 Sauchiehall Street',
      city: 'Glasgow',
      state: 'Glasgow City',
      postcode: 'G1 3DL',
      country: 'GB',
      latitude: 55.8602,
      longitude: -4.2518
    }
  ]
};

// Helper function to get all addresses
export const getAllAddresses = (): Address[] => {
  return Object.values(ukAddresses).flat();
};

// Helper function to search addresses
export const searchAddresses = (query: string): Address[] => {
  if (!query.trim()) return [];
  
  const searchUpper = query.toUpperCase();
  const results: Address[] = [];
  
  // Search by postcode
  for (const [postcode, addresses] of Object.entries(ukAddresses)) {
    if (postcode.startsWith(searchUpper)) {
      results.push(...addresses);
    }
  }
  
  // Search by address text if no postcode matches
  if (results.length === 0) {
    const searchLower = query.toLowerCase();
    for (const addresses of Object.values(ukAddresses)) {
      for (const address of addresses) {
        if (
          address.street.toLowerCase().includes(searchLower) ||
          address.city.toLowerCase().includes(searchLower) ||
          address.fullAddress.toLowerCase().includes(searchLower)
        ) {
          results.push(address);
        }
      }
    }
  }
  
  return results;
}; 