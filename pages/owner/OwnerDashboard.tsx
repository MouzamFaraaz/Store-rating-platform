
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { mockApiService } from '../../services/mockApiService';
import { useAuth } from '../../context/AuthContext';
import { User, Store } from '../../types';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import { Table, Column } from '../../components/ui/Table';
import StarRating from '../../components/ui/StarRating';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

interface RatingWithUser {
    id: string;
    userName: string;
    rating: number;
}

const OwnerDashboard: React.FC = () => {
    const { user } = useAuth();
    const [store, setStore] = useState<Store | null>(null);
    const [ratings, setRatings] = useState<RatingWithUser[]>([]);
    const [averageRating, setAverageRating] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!user || !user.storeId) return;
        setLoading(true);
        const data = await mockApiService.getStoreOwnerDashboard(user.storeId);
        if (data) {
            setStore(data.store);
            setRatings(data.ratings);
            setAverageRating(data.averageRating);
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: Column<RatingWithUser>[] = useMemo(() => [
        { header: 'User Name', accessor: 'userName', sortable: true },
        { header: 'Rating', accessor: (item) => <StarRating rating={item.rating} readOnly />, sortable: true },
    ], []);

    if (loading) {
        return <Layout><p>Loading dashboard...</p></Layout>;
    }
    
    if (!store) {
        return <Layout><Card title="My Store"><p>No store assigned to this account.</p></Card></Layout>;
    }

    return (
        <Layout>
            <div className="space-y-6">
                <Card>
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{store.name}</h2>
                            <p className="text-gray-600">{store.address}</p>
                        </div>
                        <Link to="/update-password">
                            <Button variant="secondary">Update Password</Button>
                        </Link>
                    </div>
                </Card>

                <Card title="Store Performance">
                     <div className="flex items-center space-x-4">
                        <p className="text-lg font-medium">Average Rating:</p>
                        <div className="flex items-center">
                            <StarRating rating={averageRating} readOnly size="lg" />
                            <span className="ml-3 text-2xl font-bold">{averageRating.toFixed(2)}</span>
                        </div>
                    </div>
                </Card>
                
                <Card title="User Ratings">
                    <Table columns={columns} data={ratings} />
                </Card>
            </div>
        </Layout>
    );
};

export default OwnerDashboard;
