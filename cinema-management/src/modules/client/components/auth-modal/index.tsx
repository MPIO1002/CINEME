import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { faFacebook, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { API_BASE_URL } from "../../../../components/api-config";
import { useToast } from "../../../../hooks/useToast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (userData: UserData) => void;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  roleId: string;
  createdAt: string;
  updatedAt: string;
}

interface UserData {
  email: string;
  fullName: string;
  accessToken: string;
  refreshToken: string;
}

const AuthModal = ({ isOpen, onClose, onLoginSuccess }: AuthModalProps) => {
  const { showToast } = useToast();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: ''
  });
  
  // Validation errors
  const [errors, setErrors] = useState({
    email: '',
    phone: '',
    password: ''
  });

  // Validation functions
  const validateEmail = (email: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return 'Email không được để trống';
    }
    if (!emailRegex.test(email)) {
      return 'Email không đúng định dạng';
    }
    return '';
  };

  const validatePhone = (phone: string): string => {
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    if (!phone.trim()) {
      return 'Số điện thoại không được để trống';
    }
    if (!phoneRegex.test(phone)) {
      return 'Số điện thoại không đúng định dạng';
    }
    return '';
  };

  const validatePassword = (password: string): string => {
    if (!password.trim()) {
      return 'Mật khẩu không được để trống';
    }
    if (password.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    return '';
  };

  // Clear errors when switching auth mode
  const clearErrors = () => {
    setErrors({
      email: '',
      phone: '',
      password: ''
    });
  };

  // Handle close modal
  const handleClose = () => {
    onClose();
    // Reset forms and errors when closing
    setLoginForm({ email: '', password: '' });
    setRegisterForm({ email: '', password: '', fullName: '', phone: '' });
    clearErrors();
    setShowPassword(false);
  };

  // API handlers
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const emailError = validateEmail(registerForm.email);
    const phoneError = validatePhone(registerForm.phone);
    const passwordError = validatePassword(registerForm.password);
    
    setErrors({
      email: emailError,
      phone: phoneError,
      password: passwordError
    });
    
    // If there are errors, don't submit
    if (emailError || phoneError || passwordError) {
      return;
    }
    
    setIsLoading(true);
    
    const registerData: RegisterData = {
      ...registerForm,
      roleId: "fe4324ec-e582-42b2-8a63-651117b2a5db",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Registration successful:', result);
        showToast('success', 'Đăng ký thành công!');
        handleClose();
      } else {
        const error = await response.json();
        console.error('Registration failed:', error);
        showToast('error', 'Đăng ký thất bại: ' + (error.message || 'Lỗi không xác định'));
      }
    } catch (error) {
      console.error('Registration error:', error);
      showToast('error', 'Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const emailError = validateEmail(loginForm.email);
    const passwordError = validatePassword(loginForm.password);
    
    setErrors({
      email: emailError,
      phone: '',
      password: passwordError
    });
    
    // If there are errors, don't submit
    if (emailError || passwordError) {
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      });

      if (response.ok) {
        const result: { statusCode: number; message: string; data: UserData } = await response.json();
        console.log('Login successful:', result);
        
        if (result.statusCode === 200 && result.data) {
          // Lưu tokens vào localStorage
          localStorage.setItem('accessToken', result.data.accessToken);
          localStorage.setItem('refreshToken', result.data.refreshToken);
          localStorage.setItem('userData', JSON.stringify(result.data));
          
          // Gọi callback để cập nhật UI
          onLoginSuccess?.(result.data);
          
          showToast('success', 'Đăng nhập thành công!');
          handleClose();
        }
      } else {
        const error = await response.json();
        console.error('Login failed:', error);
        showToast('error', 'Đăng nhập thất bại: ' + (error.message || 'Sai email hoặc mật khẩu'));
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('error', 'Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = () => {
    // Lưu URL hiện tại để redirect về sau khi đăng nhập
    localStorage.setItem('oauthReturnUrl', window.location.pathname + window.location.search);
    
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100]">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black opacity-50"
        onClick={handleClose}
      ></div>
      
      <div className="bg-[var(--color-background)] rounded-2xl p-8 w-full max-w-md mx-4 relative border border-gray-400/20 z-10">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition cursor-pointer"
        >
          <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
        </button>

        {/* Tab switcher */}
        <div className="flex mb-6 bg-[var(--color-background)] rounded-lg p-1 border border-gray-400/20">
          <button
            onClick={() => {
              setAuthMode('login');
              clearErrors();
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition cursor-pointer ${
              authMode === 'login'
                ? 'bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-accent)] text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-[var(--color-secondary)]/20 hover:to-[var(--color-accent)]/20'
            }`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => {
              setAuthMode('register');
              clearErrors();
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition cursor-pointer ${
              authMode === 'register'
                ? 'bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-accent)] text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-[var(--color-secondary)]/20 hover:to-[var(--color-accent)]/20'
            }`}
          >
            Đăng ký
          </button>
        </div>

        {/* Form Container with Smooth Transition */}
        <div className="relative overflow-hidden transition-all duration-500 ease-in-out" style={{
          height: authMode === 'login' ? '360px' : '550px'
        }}>
          {/* Login Form */}
          <div 
            className={`transition-all duration-500 ease-in-out transform ${
              authMode === 'login' 
                ? 'translate-x-0 opacity-100' 
                : '-translate-x-full opacity-0 absolute top-0 left-0 w-full'
            }`}
          >
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => {
                    setLoginForm({ ...loginForm, email: e.target.value });
                    if (errors.email) {
                      setErrors({ ...errors, email: '' });
                    }
                  }}
                  className={`w-full p-3 bg-[var(--color-background)] border rounded-lg text-white placeholder-gray-400 focus:outline-none ${
                    errors.email 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-400/30 focus:border-[var(--color-accent)]'
                  }`}
                  placeholder="Nhập email của bạn"
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={(e) => {
                      setLoginForm({ ...loginForm, password: e.target.value });
                      if (errors.password) {
                        setErrors({ ...errors, password: '' });
                      }
                    }}
                    className={`w-full p-3 bg-[var(--color-background)] border rounded-lg text-white placeholder-gray-400 focus:outline-none pr-12 ${
                      errors.password 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-400/30 focus:border-[var(--color-accent)]'
                    }`}
                    placeholder="Nhập mật khẩu"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="w-4 h-4" />
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-accent)] hover:from-[var(--color-accent)] hover:to-[var(--color-secondary)] text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg"
              >
                {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
              </button>

              {/* Social Login */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[var(--color-background)] text-gray-400">Hoặc đăng nhập với</span>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 bg-[#4267B2] hover:bg-[#365899] text-white font-medium py-2 px-4 rounded-lg transition cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faFacebook} className="w-4 h-4" />
                    Facebook
                  </button>
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 bg-[#db4437] hover:bg-[#c23321] text-white font-medium py-2 px-4 rounded-lg transition cursor-pointer"
                    onClick={handleGoogleLogin}
                  >
                    <FontAwesomeIcon icon={faGoogle} className="w-4 h-4" />
                    Google
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Register Form */}
          <div 
            className={`transition-all duration-500 ease-in-out transform ${
              authMode === 'register' 
                ? 'translate-x-0 opacity-100' 
                : 'translate-x-full opacity-0 absolute top-0 left-0 w-full'
            }`}
          >
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={registerForm.fullName}
                  onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                  className="w-full p-3 bg-[var(--color-background)] border border-gray-400/30 rounded-lg text-white placeholder-gray-400 focus:border-[var(--color-accent)] focus:outline-none"
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => {
                    setRegisterForm({ ...registerForm, email: e.target.value });
                    if (errors.email) {
                      setErrors({ ...errors, email: '' });
                    }
                  }}
                  className={`w-full p-3 bg-[var(--color-background)] border rounded-lg text-white placeholder-gray-400 focus:outline-none ${
                    errors.email 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-400/30 focus:border-[var(--color-accent)]'
                  }`}
                  placeholder="Nhập email của bạn"
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={registerForm.phone}
                  onChange={(e) => {
                    setRegisterForm({ ...registerForm, phone: e.target.value });
                    if (errors.phone) {
                      setErrors({ ...errors, phone: '' });
                    }
                  }}
                  className={`w-full p-3 bg-[var(--color-background)] border rounded-lg text-white placeholder-gray-400 focus:outline-none ${
                    errors.phone 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-400/30 focus:border-[var(--color-accent)]'
                  }`}
                  placeholder="Nhập số điện thoại"
                  required
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={registerForm.password}
                    onChange={(e) => {
                      setRegisterForm({ ...registerForm, password: e.target.value });
                      if (errors.password) {
                        setErrors({ ...errors, password: '' });
                      }
                    }}
                    className={`w-full p-3 bg-[var(--color-background)] border rounded-lg text-white placeholder-gray-400 focus:outline-none pr-12 ${
                      errors.password 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-400/30 focus:border-[var(--color-accent)]'
                    }`}
                    placeholder="Nhập mật khẩu"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="w-4 h-4" />
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-accent)] hover:from-[var(--color-accent)] hover:to-[var(--color-secondary)] text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg"
              >
                {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
              </button>

              {/* Social Login */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[var(--color-background)] text-gray-400">Hoặc đăng ký với</span>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 bg-[#4267B2] hover:bg-[#365899] text-white font-medium py-2 px-4 rounded-lg transition cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faFacebook} className="w-4 h-4" />
                    Facebook
                  </button>
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 bg-[#db4437] hover:bg-[#c23321] text-white font-medium py-2 px-4 rounded-lg transition cursor-pointer"
                    onClick={handleGoogleLogin}
                  >
                    <FontAwesomeIcon icon={faGoogle} className="w-4 h-4" />
                    Google
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;