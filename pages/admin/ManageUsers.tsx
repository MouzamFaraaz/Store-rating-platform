
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { mockApiService } from '../../services/mockApiService';
import { User, UserRole } from '../../types';
import { Table, Column } from '../../components/ui/Table';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { validateName, validateEmail, validateAddress, validatePassword } from '../../utils/validators';
import { USER_ROLES_OPTIONS } from '../../constants';
import { useDebounce } from '../../hooks/useDebounce';

const ManageUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
    const debouncedFilters = useDebounce(filters, 300);

    const fetchUsers = useCallback(async () => {
        const fetchedUsers = await mockApiService.getUsers(debouncedFilters);
        setUsers(fetchedUsers);
    }, [debouncedFilters]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const columns: Column<User>[] = useMemo(() => [
        { header: 'Name', accessor: 'name', sortable: true },
        { header: 'Email', accessor: 'email', sortable: true },
        { header: 'Address', accessor: 'address', sortable: false },
        { header: 'Role', accessor: 'role', sortable: true },
    ], []);

    return (
        <Card title="Manage Users">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full md:w-auto flex-grow">
                    <Input label="Name" name="name" value={filters.name} onChange={handleFilterChange} placeholder="Filter by name..." />
                    <Input label="Email" name="email" value={filters.email} onChange={handleFilterChange} placeholder="Filter by email..." />
                    <Input label="Address" name="address" value={filters.address} onChange={handleFilterChange} placeholder="Filter by address..." />
                    <Select label="Role" name="role" value={filters.role} onChange={handleFilterChange} options={[{ value: '', label: 'All Roles' }, ...USER_ROLES_OPTIONS]} />
                </div>
                <Button onClick={() => setIsModalOpen(true)}>Add User</Button>
            </div>
            <Table columns={columns} data={users} />
            <AddUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onUserAdded={fetchUsers} />
        </Card>
    );
};

const AddUserModal: React.FC<{ isOpen: boolean; onClose: () => void; onUserAdded: () => void; }> = ({ isOpen, onClose, onUserAdded }) => {
    const [formData, setFormData] = useState({ name: '', email: '', address: '', password: '', role: UserRole.NORMAL_USER });
    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const [isLoading, setIsLoading] = useState(false);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const newErrors: Record<string, string | null> = {
            name: validateName(formData.name),
            email: validateEmail(formData.email),
            address: validateAddress(formData.address),
            password: validatePassword(formData.password),
        };
        setErrors(newErrors);
        return Object.values(newErrors).every(e => e === null);
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsLoading(true);
        const success = await mockApiService.addUser(formData);
        setIsLoading(false);
        if (success) {
            onUserAdded();
            onClose();
        } else {
            setErrors(prev => ({ ...prev, email: "A user with this email already exists." }));
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New User">
            <div className="space-y-4">
                <Input label="Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} />
                <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} />
                <Input label="Address" name="address" value={formData.address} onChange={handleChange} error={errors.address} />
                <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} error={errors.password} />
                <Select label="Role" name="role" value={formData.role} onChange={handleChange} options={USER_ROLES_OPTIONS} />
                <div className="flex justify-end pt-4 space-x-2">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} isLoading={isLoading}>Add User</Button>
                </div>
            </div>
        </Modal>
    );
};

export default ManageUsers;
