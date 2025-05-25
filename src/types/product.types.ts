export interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    category: string;
    images: string[];
    isManaged?: boolean;
    quantity?: number;
    isAvailable?: boolean;
}

export interface ProductResponse {
    success: boolean;
    message: string;
    data: Product[];
}

export interface Category {
    id: string;
    name: string;
    displayOrder: number;
    hidden: boolean;
    image?: string;
}

export interface CategoryResponse {
    success: boolean;
    message: string;
    data: Category[];
}

export interface ProductFilters {
    branchId?: string;
    category?: string;
    searchText?: string;
} 