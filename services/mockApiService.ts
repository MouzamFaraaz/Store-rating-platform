
import { User, UserRole, Store, Rating, StoreWithRating } from '../types';

// Helper to generate unique IDs, simulating database primary keys.
const uuid = () => crypto.randomUUID();

// --- MOCK DATABASE ---
// A simple in-memory data store to simulate a real database.

let MOCK_USERS: User[] = [
    { id: 'admin-1', name: 'System Administrator User', email: 'admin@storly.com', address: '1 Admin Way, Suite 100, Adminville, AD 12345', role: UserRole.ADMIN, password: 'Password!1' },
    { id: 'user-1', name: 'Alice Liddell Wonderland', email: 'alice@test.com', address: '123 Rabbit Hole, Wonderland, WL 54321', role: UserRole.NORMAL_USER, password: 'Password!1' },
    { id: 'user-2', name: 'Robert "Bob" The Builder', email: 'bob@test.com', address: '456 Construction Rd, Builderville, BV 67890', role: UserRole.NORMAL_USER, password: 'Password!1' },
    { id: 'owner-1', name: 'Charles "Charlie" Bucket', email: 'charlie@store.com', address: '789 Factory Lane, Candytown, CT 09876', role: UserRole.STORE_OWNER, password: 'Password!1', storeId: 'store-1' },
    { id: 'owner-2', name: 'Diana Prince of Themyscira', email: 'diana@store.com', address: '1 Paradise Island, Themyscira, TH 11223', role: UserRole.STORE_OWNER, password: 'Password!1', storeId: 'store-2' },
    { id: 'owner-3', name: 'Gerald "Gerry" Goodman', email: 'gerry@store.com', address: '100 Main Street, Metropolis, MT 33445', role: UserRole.STORE_OWNER, password: 'Password!1', storeId: 'store-3' },
];

let MOCK_STORES: Store[] = [
    { id: 'store-1', name: 'Charlie\'s Candy Corner', email: 'contact@charlies.com', address: '1 Candy Street, Candytown, CT 09876', ownerId: 'owner-1' },
    { id: 'store-2', name: 'Diana\'s Designer Boutique', email: 'support@dianas.com', address: '2 Fashion Avenue, Metropolis, MT 33445', ownerId: 'owner-2' },
    { id: 'store-3', name: 'Goodman\'s General Goods', email: 'info@goodmans.com', address: '99 Market Square, Metropolis, MT 33445', ownerId: 'owner-3' },
];

let MOCK_RATINGS: Rating[] = [
    { id: 'rating-1', storeId: 'store-1', userId: 'user-1', rating: 5 },
    { id: 'rating-2', storeId: 'store-1', userId: 'user-2', rating: 4 },
    { id: 'rating-3', storeId: 'store-2', userId: 'user-1', rating: 3 },
    { id: 'rating-4', storeId: 'store-3', userId: 'user-2', rating: 5 },
];

// To simulate network latency for a more realistic user experience.
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));


// --- API Service Implementation ---
export const mockApiService = {
    async login(email: string, password: string): Promise<User | null> {
        await delay(500);
        const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        return user ? { ...user } : null; // Return a copy to prevent mutation
    },

    async signup(userData: Omit<User, 'id' | 'role'>): Promise<User | null> {
        await delay(500);
        if (MOCK_USERS.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
            return null; // Email already exists
        }
        const newUser: User = {
            id: uuid(),
            ...userData,
            role: UserRole.NORMAL_USER,
        };
        MOCK_USERS.push(newUser);
        return { ...newUser };
    },

    async updatePassword(userId: string, newPass: string): Promise<boolean> {
        await delay(500);
        const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
        if (userIndex > -1) {
            MOCK_USERS[userIndex].password = newPass;
            return true;
        }
        return false;
    },

    async getAdminDashboardStats() {
        await delay(300);
        return {
            users: MOCK_USERS.length,
            stores: MOCK_STORES.length,
            ratings: MOCK_RATINGS.length,
        };
    },

    async getUsers(filters: { name: string; email: string; address: string; role: string; }): Promise<User[]> {
        await delay(400);
        return MOCK_USERS.filter(user => {
            return (
                (filters.name ? user.name.toLowerCase().includes(filters.name.toLowerCase()) : true) &&
                (filters.email ? user.email.toLowerCase().includes(filters.email.toLowerCase()) : true) &&
                (filters.address ? user.address.toLowerCase().includes(filters.address.toLowerCase()) : true) &&
                (filters.role ? user.role === filters.role : true)
            );
        }).map(u => ({...u})); // Return copies
    },
    
    async addUser(userData: Omit<User, 'id'>): Promise<boolean> {
        await delay(500);
        if (MOCK_USERS.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
            return false;
        }
        const newUser: User = { id: uuid(), ...userData };
        MOCK_USERS.push(newUser);
        return true;
    },

    async getStoresForAdmin(filters: { name: string; email: string; address: string; }) {
        await delay(400);

        let storesWithDetails = MOCK_STORES.map(store => {
            const owner = MOCK_USERS.find(u => u.id === store.ownerId);
            const ratings = MOCK_RATINGS.filter(r => r.storeId === store.id);
            const averageRating = ratings.length > 0 ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length : 0;
            return {
                ...store,
                ownerName: owner?.name || 'N/A',
                averageRating,
            };
        });

        return storesWithDetails.filter(store => {
             return (
                (filters.name ? store.name.toLowerCase().includes(filters.name.toLowerCase()) : true) &&
                (filters.email ? store.email.toLowerCase().includes(filters.email.toLowerCase()) : true) &&
                (filters.address ? store.address.toLowerCase().includes(filters.address.toLowerCase()) : true)
            );
        });
    },

    async addStore(storeData: Omit<Store, 'id'>): Promise<boolean> {
        await delay(500);
        if (MOCK_STORES.some(s => s.email.toLowerCase() === storeData.email.toLowerCase())) {
            return false;
        }
        const newStore: Store = { id: uuid(), ...storeData };
        MOCK_STORES.push(newStore);
        // Also update owner's storeId if they are newly assigned a store
        const ownerIndex = MOCK_USERS.findIndex(u => u.id === newStore.ownerId);
        if(ownerIndex > -1 && !MOCK_USERS[ownerIndex].storeId) {
             MOCK_USERS[ownerIndex].storeId = newStore.id;
        }
        return true;
    },

    async getStoresForUser(userId: string, search: { name: string; address: string; }): Promise<StoreWithRating[]> {
        await delay(400);
        let storesWithRatings = MOCK_STORES.map(store => {
            const ratings = MOCK_RATINGS.filter(r => r.storeId === store.id);
            const averageRating = ratings.length > 0 ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length : 0;
            const userRating = ratings.find(r => r.userId === userId)?.rating;
            return {
                ...store,
                averageRating,
                userRating,
            };
        });

        return storesWithRatings.filter(store => {
            return (
                (search.name ? store.name.toLowerCase().includes(search.name.toLowerCase()) : true) &&
                (search.address ? store.address.toLowerCase().includes(search.address.toLowerCase()) : true)
            );
        });
    },

    async submitRating(ratingData: Omit<Rating, 'id'>): Promise<void> {
        await delay(300);
        const existingRatingIndex = MOCK_RATINGS.findIndex(
            r => r.storeId === ratingData.storeId && r.userId === ratingData.userId
        );
        if (existingRatingIndex > -1) {
            MOCK_RATINGS[existingRatingIndex].rating = ratingData.rating;
        } else {
            MOCK_RATINGS.push({ id: uuid(), ...ratingData });
        }
    },

    async getStoreOwnerDashboard(storeId: string) {
        await delay(400);
        const store = MOCK_STORES.find(s => s.id === storeId);
        if (!store) return null;

        const ratingsForStore = MOCK_RATINGS.filter(r => r.storeId === store.id);

        const ratingsWithUser = ratingsForStore.map(rating => {
            const user = MOCK_USERS.find(u => u.id === rating.userId);
            return {
                id: rating.id,
                userName: user?.name || 'Anonymous User',
                rating: rating.rating,
            };
        });

        const averageRating = ratingsForStore.length > 0
            ? ratingsForStore.reduce((acc, r) => acc + r.rating, 0) / ratingsForStore.length
            : 0;

        return {
            store,
            ratings: ratingsWithUser,
            averageRating,
        };
    },
};
