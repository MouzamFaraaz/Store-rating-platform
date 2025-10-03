
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { validateEmail, validatePassword, validateName, validateAddress } from '../../utils/validators';

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string | null> = {};
    newErrors.name = validateName(formData.name);
    newErrors.email = validateEmail(formData.email);
    newErrors.address = validateAddress(formData.address);
    newErrors.password = validatePassword(formData.password);
    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const newUser = await signup(formData);
      if (newUser) {
        navigate('/');
      } else {
        setServerError('An account with this email already exists.');
      }
    } catch (err) {
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900">
            Create an account
          </h1>
        </div>
        <Card>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {serverError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{serverError}</div>}
            
            <Input id="name" name="name" label="Full Name" type="text" required value={formData.name} onChange={handleChange} error={errors.name} />
            <Input id="email" name="email" label="Email address" type="email" required value={formData.email} onChange={handleChange} error={errors.email} />
            <Input id="address" name="address" label="Address" type="text" required value={formData.address} onChange={handleChange} error={errors.address} />
            <Input id="password" name="password" label="Password" type="password" required value={formData.password} onChange={handleChange} error={errors.password} />

            <div>
              <Button type="submit" className="w-full mt-4" isLoading={isLoading}>
                Sign up
              </Button>
            </div>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            Already a member?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;
