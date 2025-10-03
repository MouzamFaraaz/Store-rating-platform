
import React, { useState, useEffect, useCallback } from 'react';
import { mockApiService } from '../../services/mockApiService';
import { StoreWithRating } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import StarRating from '../../components/ui/StarRating';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Link } from 'react-router-dom';


const UserDashboard: React.FC = () => {
    const [stores, setStores] = useState<StoreWithRating[]>([]);
    const [search, setSearch] = useState({ name: '', address: '' });
    const [loading, setLoading] = useState(true);
    const [selectedStore, setSelectedStore] = useState<StoreWithRating | null>(null);
    const [rating, setRating] = useState(0);

    const { user } = useAuth();
    const debouncedSearch = useDebounce(search, 300);

    const fetchStores = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const fetchedStores = await mockApiService.getStoresForUser(user.id, debouncedSearch);
        setStores(fetchedStores);
        setLoading(false);
    }, [user, debouncedSearch]);

    useEffect(() => {
        fetchStores();
    }, [fetchStores]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleOpenRatingModal = (store: StoreWithRating) => {
        setSelectedStore(store);
        setRating(store.userRating || 0);
    };

    const handleCloseRatingModal = () => {
        setSelectedStore(null);
        setRating(0);
    };

    const handleSubmitRating = async () => {
        if (!selectedStore || !user || rating === 0) return;
        await mockApiService.submitRating({
            storeId: selectedStore.id,
            userId: user.id,
            rating: rating
        });
        fetchStores(); // Refresh list
        handleCloseRatingModal();
    };

    return (
        <Layout>
            <div className="space-y-6">
                <Card>
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Find and Rate Stores</h2>
                        <Link to="/update-password">
                            <Button variant="secondary">Update Password</Button>
                        </Link>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Search by Name" name="name" value={search.name} onChange={handleSearchChange} placeholder="Enter store name..." />
                        <Input label="Search by Address" name="address" value={search.address} onChange={handleSearchChange} placeholder="Enter address..." />
                    </div>
                </Card>

                {loading ? (
                    <p>Loading stores...</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stores.map(store => (
                            <Card key={store.id} className="flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{store.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{store.address}</p>
                                    <div className="mt-4">
                                        <p className="text-sm font-medium text-gray-600">Overall Rating:</p>
                                        <div className="flex items-center">
                                            <StarRating rating={store.averageRating} readOnly />
                                            <span className="ml-2 text-sm text-gray-500">({store.averageRating.toFixed(1)})</span>
                                        </div>
                                    </div>
                                    {store.userRating !== undefined && (
                                         <div className="mt-2">
                                            <p className="text-sm font-medium text-gray-600">Your Rating:</p>
                                            <StarRating rating={store.userRating} readOnly />
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <Button className="w-full" onClick={() => handleOpenRatingModal(store)}>
                                        {store.userRating ? 'Modify Your Rating' : 'Submit a Rating'}
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Modal isOpen={!!selectedStore} onClose={handleCloseRatingModal} title={`Rate ${selectedStore?.name}`}>
                <div className="text-center">
                    <p className="mb-4 text-gray-600">Select a rating from 1 to 5.</p>
                    <div className="flex justify-center">
                         <StarRating rating={rating} onRatingChange={setRating} size="lg" />
                    </div>
                   <div className="mt-6 flex justify-end space-x-2">
                        <Button variant="secondary" onClick={handleCloseRatingModal}>Cancel</Button>
                        <Button onClick={handleSubmitRating} disabled={rating === 0}>Submit</Button>
                   </div>
                </div>
            </Modal>
        </Layout>
    );
};

export default UserDashboard;
