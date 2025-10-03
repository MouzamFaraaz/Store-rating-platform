
export enum UserRole {
    ADMIN = 'System Administrator',
    NORMAL_USER = 'Normal User',
    STORE_OWNER = 'Store Owner',
}

export interface User {
    id: string;
    name: string;
    email: string;
    address: string;
    role: UserRole;
    password?: string; 
    storeId?: string; 
}

export interface Store {
    id: string;
    name: string;
    email: string;
    address: string;
    ownerId: string;
}

export interface Rating {
    id: string;
    storeId: string;
    userId: string;
    rating: number; // 1 to 5
}

export interface StoreWithRating extends Store {
    averageRating: number;
    userRating?: number;
}
