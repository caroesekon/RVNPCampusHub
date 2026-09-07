import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoPerson, IoMail, IoCall, IoLockClosed, IoEye, IoEyeOff, IoPersonAdd } from 'react-icons/io5';
import Logo from '../../components/ui/Logo.jsx';
import Button from '../../components/ui/Button.jsx';
import Dropdown from '../../components/ui/Dropdown.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApp } from '../../context/AppContext.jsx';
import publicApi from '../../api/publicApi.js';
import {
  isValidEmail,
  isValidPhone,
  isValidPassword,
  isValidOtp,
  isRequired,
} from '../../utils/validators.js';

const Register = () => {
  const navigate = useNavigate();
  const { register, verifyRegistration } = useAuth();
  const { campuses, appSettings } = useApp();

  const [selectedRole, setSelectedRole] = useState('STUDENT');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    course: '',
    yearOfStudy: '',
    staffId: '',
    graduationYear: '',
  });
  const [selectedCampus, setSelectedCampus] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [tempId, setTempId] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const roleOptions = [
    { value: 'STUDENT', label: '🎓 Student' },
    { value: 'STAFF', label: '👨‍🏫 Staff / Lecturer' },
    { value: 'ALUMNI', label: '🎓 Alumni' },
  ];

  const fetchDepartments = async (campusId) => {
    setLoadingDepartments(true);
    setDepartments([]);
    setSelectedDepartment('');
    try {
      const response = await publicApi.getCampusById(campusId);
      if (response.data.success) {
        setDepartments(response.data.data.departments || []);
      }
    } catch (error) {
      console.error('Failed to load departments:', error.message);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const campusOptions = campuses.map((campus) => ({
    value: campus.id,
    label: campus.name,
  }));

  const departmentOptions = departments.map((dept) => ({
    value: dept.id,
    label: dept.name,
  }));

  const yearOptions = [
    { value: '1', label: 'Year 1' },
    { value: '2', label: 'Year 2' },
    { value: '3', label: 'Year 3' },
    { value: '4', label: 'Year 4' },
  ];

  const validate = () => {
    const newErrors = {};
    if (!isRequired(form.fullName)) newErrors.fullName = 'Full name is required';
    if (!isValidEmail(form.email)) newErrors.email = 'Enter a valid email';
    if (!isValidPhone(form.phoneNumber)) newErrors.phoneNumber = 'Enter a valid phone number';
    if (!isValidPassword(form.password)) newErrors.password = 'Password must be at least 8 characters';
    if (selectedRole === 'STUDENT') {
      if (!selectedCampus) newErrors.campus = 'Select a campus';
      if (!selectedDepartment) newErrors.department = 'Select a department';
    }
    if (selectedRole === 'STAFF') {
      if (!selectedCampus) newErrors.campus = 'Select a campus';
      if (!selectedDepartment) newErrors.department = 'Select a department';
      if (!isRequired(form.staffId)) newErrors.staffId = 'Staff ID is required';
    }
    if (selectedRole === 'ALUMNI') {
      if (!isRequired(form.graduationYear)) newErrors.graduationYear = 'Graduation year is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setErrors({});
    setSelectedCampus('');
    setSelectedDepartment('');
    setDepartments([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setLoading(true);

    const payload = {
      fullName: form.fullName,
      email: form.email,
      phoneNumber: form.phoneNumber,
      password: form.password,
      role: selectedRole,
      campusId: selectedRole !== 'ALUMNI' ? selectedCampus : undefined,
      departmentId: selectedRole !== 'ALUMNI' ? selectedDepartment : undefined,
      course: selectedRole === 'STUDENT' ? form.course : undefined,
      yearOfStudy: selectedRole === 'STUDENT' && form.yearOfStudy ? parseInt(form.yearOfStudy) : undefined,
      staffId: selectedRole === 'STAFF' ? form.staffId : undefined,
      graduationYear: selectedRole === 'ALUMNI' && form.graduationYear ? parseInt(form.graduationYear) : undefined,
    };

    try {
      const response = await register(payload);
      if (response.success) {
        setTempId(response.data.tempId);
        setShowOtpModal(true);
      } else {
        setApiError(response.message || 'Registration failed');
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError('');
    if (!isValidOtp(otp)) {
      setOtpError('Enter a valid 6-digit code');
      return;
    }
    setOtpLoading(true);
    try {
      const response = await verifyRegistration(tempId, otp);
      if (response.success) {
        navigate('/feed');
      } else {
        setOtpError(response.message || 'Verification failed');
      }
    } catch (error) {
      setOtpError(error.response?.data?.message || 'Verification failed');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-rvnp-green opacity-5 rounded-full translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-rvnp-red opacity-5 rounded-full -translate-x-1/3 translate-y-1/3" />

      <div className="w-full max-w-md relative">
        <div className="bg-bg-primary border-2 border-rvnp-green rounded-2xl shadow-2xl p-6 sm:p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="p-3 rounded-full bg-rvnp-green bg-opacity-10">
              <Logo size="lg" showText={false} />
            </div>
            <h1 className="text-2xl font-heading font-bold text-text-primary mt-4">
              Create Account
            </h1>
            <p className="text-text-secondary mt-1 text-sm">
              Join {appSettings?.appName || 'RVNP Campus Hub'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {apiError && (
              <div className="p-3 rounded-lg bg-rvnp-red bg-opacity-10 border border-rvnp-red text-rvnp-red text-sm">
                {apiError}
              </div>
            )}

            <Dropdown
              label="I am a"
              options={roleOptions}
              value={selectedRole}
              onChange={handleRoleChange}
              required
            />

            <div className="relative">
              <IoPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="text"
                placeholder="Full Name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-bg-secondary text-text-primary border border-border-color focus:outline-none focus:border-rvnp-green placeholder:text-text-muted"
              />
              {errors.fullName && <p className="text-xs text-rvnp-red mt-1">{errors.fullName}</p>}
            </div>

            <div className="relative">
              <IoMail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-bg-secondary text-text-primary border border-border-color focus:outline-none focus:border-rvnp-green placeholder:text-text-muted"
              />
              {errors.email && <p className="text-xs text-rvnp-red mt-1">{errors.email}</p>}
            </div>

            <div className="relative">
              <IoCall className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="tel"
                placeholder="Phone Number (+254...)"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-bg-secondary text-text-primary border border-border-color focus:outline-none focus:border-rvnp-green placeholder:text-text-muted"
              />
              {errors.phoneNumber && <p className="text-xs text-rvnp-red mt-1">{errors.phoneNumber}</p>}
            </div>

            <div className="relative">
              <IoLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-10 pr-12 py-3 rounded-lg bg-bg-secondary text-text-primary border border-border-color focus:outline-none focus:border-rvnp-green placeholder:text-text-muted"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
              >
                {showPassword ? <IoEyeOff size={18} /> : <IoEye size={18} />}
              </button>
              {errors.password && <p className="text-xs text-rvnp-red mt-1">{errors.password}</p>}
            </div>

            {(selectedRole === 'STUDENT' || selectedRole === 'STAFF') && (
              <>
                <Dropdown
                  label="Campus"
                  options={campusOptions}
                  value={selectedCampus}
                  onChange={(value) => {
                    setSelectedCampus(value);
                    fetchDepartments(value);
                  }}
                  placeholder="Select Campus"
                  required
                  error={errors.campus}
                />
                <Dropdown
                  label="Department"
                  options={departmentOptions}
                  value={selectedDepartment}
                  onChange={setSelectedDepartment}
                  placeholder={loadingDepartments ? 'Loading...' : 'Select Department'}
                  disabled={!selectedCampus || loadingDepartments}
                  required
                  error={errors.department}
                />
              </>
            )}

            {selectedRole === 'STUDENT' && (
              <>
                <input
                  type="text"
                  placeholder="Course (e.g., Diploma in ICT)"
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-bg-secondary text-text-primary border border-border-color focus:outline-none focus:border-rvnp-green placeholder:text-text-muted"
                />
                <Dropdown
                  label="Year of Study"
                  options={yearOptions}
                  value={form.yearOfStudy}
                  onChange={(value) => setForm({ ...form, yearOfStudy: value })}
                  placeholder="Select Year"
                />
              </>
            )}

            {selectedRole === 'STAFF' && (
              <input
                type="text"
                placeholder="Staff ID / Employee Number"
                value={form.staffId}
                onChange={(e) => setForm({ ...form, staffId: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-bg-secondary text-text-primary border border-border-color focus:outline-none focus:border-rvnp-green placeholder:text-text-muted"
              />
            )}

            {selectedRole === 'ALUMNI' && (
              <input
                type="number"
                placeholder="Graduation Year (e.g., 2024)"
                value={form.graduationYear}
                onChange={(e) => setForm({ ...form, graduationYear: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-bg-secondary text-text-primary border border-border-color focus:outline-none focus:border-rvnp-green placeholder:text-text-muted"
              />
            )}

            <Button type="submit" fullWidth loading={loading} className="py-3">
              <IoPersonAdd className="inline mr-1" size={18} />
              Create Account
            </Button>
          </form>

          <p className="text-center text-text-secondary text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-rvnp-green font-medium hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>

      <Modal isOpen={showOtpModal} onClose={() => setShowOtpModal(false)} title="Verify Your Account" size="sm">
        <div className="space-y-4">
          <p className="text-text-secondary text-center">
            Enter the 6-digit code sent to your email and phone
          </p>
          {otpError && (
            <div className="p-3 rounded-lg bg-rvnp-red bg-opacity-10 border border-rvnp-red text-rvnp-red text-sm">
              {otpError}
            </div>
          )}
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="000000"
            className="w-full text-center text-3xl tracking-[0.5em] py-4 rounded-lg bg-bg-secondary text-text-primary border-2 border-rvnp-green focus:outline-none"
          />
          <Button fullWidth onClick={handleVerifyOtp} loading={otpLoading}>
            Verify & Create Account
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Register;