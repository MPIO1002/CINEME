import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
onClose: () => void;
}

function index({ onClose }: LoginProps) {
const [isLogin, setIsLogin] = useState(true);
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const { login } = useAuth();
const navigate = useNavigate();

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        await login(email, password);
        navigate('/');
        onClose();
    } catch (err) {
        setError('Invalid credentials');
    } finally {
        setLoading(false);
    }
};

const handleToggleLogin = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setError('');
};
return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70" onClick={onClose}>
        {isLogin ? (
        <form
        className="max-w-96 w-full text-center border border-gray-300/60 rounded-2xl p-8 bg-white"
        onClick={e => e.stopPropagation()}
        onSubmit={handleSubmit}
        >
        <h2 className="text-4xl text-gray-900 font-medium">Sign in</h2>
        <p className="text-sm text-gray-500/90 mt-3">Welcome back! Please sign in to continue</p>

        <button type="button" className="w-full mt-8 bg-gray-500/10 flex items-center justify-center h-12 rounded-full">
            <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/googleLogo.svg" alt="googleLogo" />
        </button>

        <div className="flex items-center gap-4 w-full my-5">
            <div className="w-full h-px bg-gray-300/90"></div>
            <p className="w-full text-nowrap text-sm text-gray-500/90">or sign in with email</p>
            <div className="w-full h-px bg-gray-300/90"></div>
        </div>

        <div className="flex items-center w-full bg-transparent border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6 gap-2">
            <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z" fill="#6B7280"/>
            </svg>
            <input
            type="email"
            placeholder="Email id"
            className="bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            />
        </div>

        <div className="flex items-center mt-6 w-full bg-transparent border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6 gap-2">
            <svg width="13" height="17" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="#6B7280"/>
            </svg>
            <input
            type="password"
            placeholder="Password"
            className="bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            />
        </div>

        <button type="submit" className="mt-8 w-full h-11 rounded-full text-white bg-[var(--color-secondary)] hover:opacity-90 transition-opacity">
            Login
        </button>
        <p className="text-gray-500/90 text-sm mt-4">
            Don’t have an account? <a className="text-[var(--color-secondary)] hover:underline" href="#" onClick={handleToggleLogin}>Sign up</a>
        </p>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>
        ) : (
        <form
            className="max-w-96 w-full text-center border border-gray-300/60 rounded-2xl p-8 bg-white"
            onClick={e => e.stopPropagation()}
            onSubmit={e => {
                e.preventDefault();
                // Simple validation example
                if (password !== confirmPassword) {
                    setError('Passwords do not match');
                    return;
                }
                // TODO: handle Login logic here
                setError('');
                // You can call your Login API here
            }}
        >
            <h2 className="text-4xl text-gray-900 font-medium">Sign up</h2>
            <p className="text-sm text-gray-500/90 mt-3">Create your account to continue</p>

            <button type="button" className="w-full mt-8 bg-gray-500/10 flex items-center justify-center h-12 rounded-full">
                <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/googleLogo.svg" alt="googleLogo" />
            </button>

            <div className="flex items-center gap-4 w-full my-5">
                <div className="w-full h-px bg-gray-300/90"></div>
                <p className="w-full text-nowrap text-sm text-gray-500/90">or sign up with email</p>
                <div className="w-full h-px bg-gray-300/90"></div>
            </div>

            <div className="flex items-center w-full bg-transparent border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6 gap-2">
                <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z" fill="#6B7280"/>
                </svg>
                <input
                    type="email"
                    placeholder="Email"
                    className="bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
            </div>

            <div className="flex items-center mt-6 w-full bg-transparent border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6 gap-2">
                <svg width="13" height="17" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="#6B7280"/>
                </svg>
                <input
                    type="password"
                    placeholder="Password"
                    className="bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
            </div>

            <div className="flex items-center mt-6 w-full bg-transparent border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6 gap-2">
                <svg width="13" height="17" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="#6B7280"/>
                </svg>
                <input
                    type="password"
                    placeholder="Confirm Password"
                    className="bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                />
            </div>

            <button type="submit" className="mt-8 w-full h-11 rounded-full text-white bg-[var(--color-secondary)] hover:opacity-90 transition-opacity">
                Sign up
            </button>
            <p className="text-gray-500/90 text-sm mt-4">
                Already have an account? <a className="text-[var(--color-secondary)] hover:underline" href="#" onClick={handleToggleLogin}>Sign in</a>
            </p>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>
    )}
    </div>
    );
}
export default index

function useAuth() {
return {
    login: async (email: string, password: string) => {
    // Giả lập đăng nhập thành công nếu email và password không rỗng
    if (email && password) return Promise.resolve();
    return Promise.reject();
}}}
