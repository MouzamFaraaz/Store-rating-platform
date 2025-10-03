import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { mockApiService } from '../../services/mockApiService';
import { Store, User, UserRole } from '../../types';
import { Table, Column } from '../../components/ui/Table';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { validateName, validateEmail, validateAddress } from '../../utils/validators';
import { useDebounce } from '../../hooks/useDebounce';
import StarRating from '../../components/ui/StarRating';

interface StoreWithDetails extends Store {
    ownerName: string;
    averageRating: number;
}

const ManageStores: React.FC = () => {
    const [stores, setStores] = useState<StoreWithDetails[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filters, setFilters] = useState({ name: '', email: '', address: '' });
    const debouncedFilters = useDebounce(filters, 300);

    const fetchStores = useCallback(async () => {
        const fetchedStores = await mockApiService.getStoresForAdmin(debouncedFilters);
        setStores(fetchedStores);
    }, [debouncedFilters]);

    useEffect(() => {
        fetchStores();
    }, [fetchStores]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const columns: Column<StoreWithDetails>[] = useMemo(() => [
        { header: 'Name', accessor: 'name', sortable: true },
        { header: 'Email', accessor: 'email', sortable: true },
        { header: 'Address', accessor: 'address', sortable: false },
        { header: 'Owner', accessor: 'ownerName', sortable: true },
        { header: 'Rating', accessor: (item) => <StarRating rating={item.averageRating} readOnly />, sortable: true },
    ], []);

    return (
        <Card title="Manage Stores">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-auto flex-grow">
                    <Input label="Name" name="name" value={filters.name} onChange={handleFilterChange} placeholder="Filter by name..." />
                    <Input label="Email" name="email" value={filters.email} onChange={handleFilterChange} placeholder="Filter by email..." />
                    <Input label="Address" name="address" value={filters.address} onChange={handleFilterChange} placeholder="Filter by address..." />
                </div>
                <Button onClick={() => setIsModalOpen(true)}>Add Store</Button>
            </div>
            <Table columns={columns} data={stores} />
            <AddStoreModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onStoreAdded={fetchStores} />
        </Card>
    );
};

const AddStoreModal: React.FC<{ isOpen: boolean; onClose: () => void; onStoreAdded: () => void; }> = ({ isOpen, onClose, onStoreAdded }) => {
    const [formData, setFormData] = useState({ name: '', email: '', address: '', ownerId: '' });
    const [owners, setOwners] = useState<User[]>([]);
    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
        if(isOpen) {
            const fetchOwners = async () => {
                // Fix: Provide the correct filter object shape to getUsers.
                const allUsers = await mockApiService.getUsers({ name: '', email: '', address: '', role: '' });
                const storeOwners = allUsers.filter(u => u.role === UserRole.STORE_OWNER);
                setOwners(storeOwners);
                if (storeOwners.length > 0) {
                    setFormData(prev => ({...prev, ownerId: storeOwners[0].id}));
                }
            };
            fetchOwners();
        }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const newErrors: Record<string, string | null> = {
            name: validateName(formData.name),
            email: validateEmail(formData.email),
            address: validateAddress(formData.address),
            ownerId: !formData.ownerId ? "An owner must be selected." : null,
        };
        setErrors(newErrors);
        return Object.values(newErrors).every(e => e === null);
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsLoading(true);
        const success = await mockApiService.addStore(formData);
        setIsLoading(false);
        if (success) {
            onStoreAdded();
            onClose();
        } else {
             setErrors(prev => ({ ...prev, email: "A store with this email already exists." }));
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Store">
            <div className="space-y-4">
                <Input label="Store Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} />
                <Input label="Store Email" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} />
                <Input label="Store Address" name="address" value={formData.address} onChange={handleChange} error={errors.address} />
                <Select
                    label="Store Owner"
                    name="ownerId"
                    value={formData.ownerId}
                    onChange={handleChange}
                    error={errors.ownerId}
                    options={owners.map(o => ({ value: o.id, label: o.name }))}
                />
                 <div className="flex justify-end pt-4 space-x-2">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} isLoading={isLoading}>Add Store</Button>
                </div>
            </div>
        </Modal>
    );
};

export default ManageStores;