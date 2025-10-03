
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { validatePassword } from '../../utils/validators';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const UpdatePassword: React.FC = () => {
    const { user, updatePassword } = useAuth();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (!user) {
            setError("You must be logged in to change your password.");
            return;
        }

        setIsLoading(true);
        const result = await updatePassword(user.id, newPassword);
        setIsLoading(false);

        if (result) {
            setSuccess("Password updated successfully!");
            setNewPassword('');
            setConfirmPassword('');
        } else {
            setError("Failed to update password. Please try again.");
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card title="Update Your Password">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">{error}</div>}
                    {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded" role="alert">{success}</div>}
                    
                    <Input
                        id="new-password"
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <Input
                        id="confirm-password"
                        label="Confirm New Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <div className="flex justify-end">
                        <Button type="submit" isLoading={isLoading}>Update Password</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default UpdatePassword;
