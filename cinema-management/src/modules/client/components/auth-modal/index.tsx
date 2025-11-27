import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { faFacebook, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { API_BASE_URL, OAUTH_GOOGLE_URL } from "../../../../components/api-config";
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
  id: string;
  email: string;
  fullName: string;
  accessToken: string;
  refreshToken: string;
}

const AuthModal = ({ isOpen, onClose, onLoginSuccess }: AuthModalProps) => {
  const { showToast } = useToast();
  const location = useLocation();
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot' | 'verify-otp' | 'reset-password'>('login');
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

  // Forgot password states
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Validation errors
  const [errors, setErrors] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });

  const processedTokensRef = useRef<Set<string> | null>(null);

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
      password: '',
      confirmPassword: '',
      otp: ''
    });
  };

  // Handle close modal
  const handleClose = () => {
    onClose();
    // Reset forms and errors when closing
    setLoginForm({ email: '', password: '' });
    setRegisterForm({ email: '', password: '', fullName: '', phone: '' });
    setForgotPasswordEmail('');
    setOtpCode(['', '', '', '', '', '']);
    setNewPassword('');
    setConfirmPassword('');
    setAuthMode('login');
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
      password: passwordError,
      confirmPassword: '',
      otp: ''
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
      password: passwordError,
      confirmPassword: '',
      otp: ''
    });
    
    // If there are errors, don't submit
    if (emailError || passwordError) {
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login-client`, {
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
          // Lưu tokens và user data vào localStorage
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

  // Handle forgot password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailError = validateEmail(forgotPasswordEmail);
    setErrors(prev => ({ ...prev, email: emailError }));
    
    if (emailError) return;
    
    setIsLoading(true);
    
    try {
      // Some backends expect the email as a query param even for POST (curl used -X POST '...forgot-password?email=...')
      const emailParam = encodeURIComponent(forgotPasswordEmail.trim());
      const url = `${API_BASE_URL}/auth/forgot-password?email=${emailParam}`;
      console.log('Forgot password POST (query param)', url);

      // Send POST with empty body to match curl/Postman (-d '') behavior
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: ''
      });

      // Try to parse response body for diagnostics (may be JSON or text)
      let parsedBody: any = null;
      try {
        parsedBody = await response.json();
      } catch (e) {
        try { parsedBody = await response.text(); } catch (e2) { parsedBody = null; }
      }

      console.log('Forgot password response', { status: response.status, ok: response.ok, body: parsedBody });

      // If server responded OK but indicates an internal failure (e.g. failed to send email), treat as error
      const bodyString = parsedBody ? (typeof parsedBody === 'string' ? parsedBody : JSON.stringify(parsedBody)) : '';
      const sendFailure = /failed to send email|failed to send|cannot find template|template/i.test(bodyString);

      if (response.ok && !sendFailure) {
        showToast('success', 'Mã OTP đã được gửi đến email của bạn!');
        setAuthMode('verify-otp');
      } else {
        // Prefer server-provided message when available
        const serverMsg = parsedBody && typeof parsedBody === 'object' ? (parsedBody.message || parsedBody.msg || JSON.stringify(parsedBody)) : parsedBody;
        console.error('Forgot password failed or email not sent:', { status: response.status, body: parsedBody });
        showToast('error', 'Gửi email thất bại: ' + (serverMsg || 'Không thể gửi mã OTP. Vui lòng thử lại hoặc kiểm tra mail rác.'));
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      showToast('error', 'Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otp = otpCode.join('');
    if (otp.length !== 6) {
      setErrors(prev => ({ ...prev, otp: 'Vui lòng nhập đầy đủ 6 số OTP' }));
      return;
    }
    
    setIsLoading(true);
    
    try {
      const emailParam = encodeURIComponent(forgotPasswordEmail.trim());
      const otpParam = encodeURIComponent(otp);
      const url = `${API_BASE_URL}/auth/verify-otp?email=${emailParam}&otp=${otpParam}`;
      console.log('Verify OTP POST (query params)', url);

      // Send POST with empty body to match backend expectation
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: ''
      });

      let parsedBody: any = null;
      try { parsedBody = await response.json(); } catch (e) { try { parsedBody = await response.text(); } catch (e2) { parsedBody = null; } }
      console.log('Verify OTP response', { status: response.status, ok: response.ok, body: parsedBody });

      if (response.ok) {
        showToast('success', 'Xác thực OTP thành công!');
        setAuthMode('reset-password');
      } else {
        setErrors(prev => ({ ...prev, otp: 'Mã OTP không đúng hoặc đã hết hạn' }));
        const serverMsg = parsedBody && typeof parsedBody === 'object' ? (parsedBody.message || parsedBody.msg) : parsedBody;
        showToast('error', 'Xác thực OTP thất bại: ' + (serverMsg || 'Mã OTP không đúng'));
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      showToast('error', 'Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const passwordError = validatePassword(newPassword);
    const confirmError = newPassword !== confirmPassword ? 'Mật khẩu xác nhận không khớp' : '';
    
    setErrors(prev => ({ 
      ...prev, 
      password: passwordError, 
      confirmPassword: confirmError 
    }));
    
    if (passwordError || confirmError) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: forgotPasswordEmail, 
          newPassword 
        }),
      });

      if (response.ok) {
        showToast('success', 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.');
        setAuthMode('login');
        setForgotPasswordEmail('');
        setOtpCode(['', '', '', '', '', '']);
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const error = await response.json();
        showToast('error', 'Đặt lại mật khẩu thất bại: ' + (error.message || 'Lỗi không xác định'));
      }
    } catch (error) {
      console.error('Reset password error:', error);
      showToast('error', 'Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP input change
  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const newOtpCode = [...otpCode];
    newOtpCode[index] = value;
    setOtpCode(newOtpCode);
    
    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
    
    // Clear error when user starts typing
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: '' }));
    }
    
    // Auto submit when all 6 digits are filled
    const isComplete = newOtpCode.every(digit => digit !== '');
    if (isComplete && value) {
      // Small delay to ensure state update
      setTimeout(() => {
        const form = document.getElementById('otp-form');
        if (form) {
          const event = new Event('submit', { bubbles: true, cancelable: true });
          form.dispatchEvent(event);
        }
      }, 100);
    }
  };

  // Handle OTP backspace
  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Handle Google login
  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    // Backend will handle Google auth and redirect back to http://localhost:5173/oauth2/redirect?token=JWT_TOKEN
    window.location.href = OAUTH_GOOGLE_URL;
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
          height: authMode === 'login' ? '400px' : 
                  authMode === 'register' ? '550px' : 
                  authMode === 'forgot' ? '300px' :
                  authMode === 'verify-otp' ? '350px' : 
                  authMode === 'reset-password' ? '400px' : '360px'
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

              {/* Forgot password link */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setAuthMode('forgot')}
                  className="text-sm text-[var(--color-accent)] hover:text-[var(--color-secondary)] transition cursor-pointer"
                >
                  Quên mật khẩu?
                </button>
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

          {/* Forgot Password Form */}
          <div 
            className={`transition-all duration-500 ease-in-out transform ${
              authMode === 'forgot' 
                ? 'translate-x-0 opacity-100' 
                : 'translate-x-full opacity-0 absolute top-0 left-0 w-full'
            }`}
          >
            <div className="mb-4">
              <button
                onClick={() => setAuthMode('login')}
                className="text-sm text-gray-400 hover:text-white transition cursor-pointer flex items-center gap-2"
              >
                ← Quay lại đăng nhập
              </button>
            </div>
            
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Quên mật khẩu</h3>
                <p className="text-sm text-gray-400">Nhập email để nhận mã OTP đặt lại mật khẩu</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => {
                    setForgotPasswordEmail(e.target.value);
                    if (errors.email) {
                      setErrors(prev => ({ ...prev, email: '' }));
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-accent)] hover:from-[var(--color-accent)] hover:to-[var(--color-secondary)] text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg"
              >
                {isLoading ? 'Đang gửi...' : 'Gửi mã OTP'}
              </button>
            </form>
          </div>

          {/* OTP Verification Form */}
          <div 
            className={`transition-all duration-500 ease-in-out transform ${
              authMode === 'verify-otp' 
                ? 'translate-x-0 opacity-100' 
                : 'translate-x-full opacity-0 absolute top-0 left-0 w-full'
            }`}
          >
            <div className="mb-4">
              <button
                onClick={() => setAuthMode('forgot')}
                className="text-sm text-gray-400 hover:text-white transition cursor-pointer flex items-center gap-2"
              >
                ← Quay lại
              </button>
            </div>
            
            <form id="otp-form" onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Nhập mã OTP</h3>
                <p className="text-sm text-gray-400">
                  Mã OTP đã được gửi đến email <span className="text-[var(--color-accent)]">{forgotPasswordEmail}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Mã OTP (6 số)
                </label>
                <div className="flex gap-2 justify-center">
                  {otpCode.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                      className={`w-12 h-12 text-center text-lg font-semibold bg-[var(--color-background)] border rounded-lg text-white focus:outline-none ${
                        errors.otp 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-400/30 focus:border-[var(--color-accent)]'
                      }`}
                      maxLength={1}
                    />
                  ))}
                </div>
                {errors.otp && (
                  <p className="text-red-500 text-sm mt-2 text-center">{errors.otp}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-accent)] hover:from-[var(--color-accent)] hover:to-[var(--color-secondary)] text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg"
              >
                {isLoading ? 'Đang xác thực...' : 'Xác thực OTP'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode('forgot')}
                  className="text-sm text-[var(--color-accent)] hover:text-[var(--color-secondary)] transition cursor-pointer"
                >
                  Gửi lại mã OTP
                </button>
              </div>
            </form>
          </div>

          {/* Reset Password Form */}
          <div 
            className={`transition-all duration-500 ease-in-out transform ${
              authMode === 'reset-password' 
                ? 'translate-x-0 opacity-100' 
                : 'translate-x-full opacity-0 absolute top-0 left-0 w-full'
            }`}
          >
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Đặt lại mật khẩu</h3>
                <p className="text-sm text-gray-400">Nhập mật khẩu mới cho tài khoản của bạn</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errors.password) {
                        setErrors(prev => ({ ...prev, password: '' }));
                      }
                    }}
                    className={`w-full p-3 bg-[var(--color-background)] border rounded-lg text-white placeholder-gray-400 focus:outline-none pr-12 ${
                      errors.password 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-400/30 focus:border-[var(--color-accent)]'
                    }`}
                    placeholder="Nhập mật khẩu mới"
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

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Xác nhận mật khẩu
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) {
                      setErrors(prev => ({ ...prev, confirmPassword: '' }));
                    }
                  }}
                  className={`w-full p-3 bg-[var(--color-background)] border rounded-lg text-white placeholder-gray-400 focus:outline-none ${
                    errors.confirmPassword 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-400/30 focus:border-[var(--color-accent)]'
                  }`}
                  placeholder="Nhập lại mật khẩu mới"
                  required
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-accent)] hover:from-[var(--color-accent)] hover:to-[var(--color-secondary)] text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg"
              >
                {isLoading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;