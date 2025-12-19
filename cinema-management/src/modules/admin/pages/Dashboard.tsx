import {
    Activity,
    ArrowUpRight,
    Award,
    BarChart3,
    CalendarDays,
    Clock,
    DollarSign,
    Film,
    Sparkles,
    Star,
    Target,
    TrendingUp,
    Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface DashboardStats {
  totalUsers: number;
  totalMovies: number;
  totalBookings: number;
  totalRevenue: number;
  newUsersToday: number;
  bookingsToday: number;
  revenueToday: number;
  averageRating: number;
  totalScreens: number;
  occupancyRate: number;
}

interface ChartData {
  name: string;
  value: number;
  change?: number;
}

interface TopMovie {
  id: string;
  title: string;
  bookings: number;
  revenue: number;
  rating: number;
  poster?: string;
}

interface RecentActivity {
  id: string;
  type: 'booking' | 'user' | 'movie' | 'review';
  message: string;
  time: string;
  user?: string;
}

// Mock Data
const mockStats: DashboardStats = {
  totalUsers: 1248,
  totalMovies: 156,
  totalBookings: 8942,
  totalRevenue: 124500000,
  newUsersToday: 23,
  bookingsToday: 187,
  revenueToday: 2850000,
  averageRating: 4.2,
  totalScreens: 12,
  occupancyRate: 78.5
};

const mockRevenueData: ChartData[] = [
  { name: 'T2', value: 2400000, change: 12 },
  { name: 'T3', value: 1800000, change: -5 },
  { name: 'T4', value: 3200000, change: 25 },
  { name: 'T5', value: 2850000, change: 8 },
  { name: 'T6', value: 4100000, change: 35 },
  { name: 'T7', value: 5200000, change: 42 },
  { name: 'CN', value: 4800000, change: 28 }
];

const mockBookingData: ChartData[] = [
  { name: 'T2', value: 145 },
  { name: 'T3', value: 128 },
  { name: 'T4', value: 198 },
  { name: 'T5', value: 187 },
  { name: 'T6', value: 234 },
  { name: 'T7', value: 298 },
  { name: 'CN', value: 267 }
];

const mockTopMovies: TopMovie[] = [
  {
    id: '1',
    title: 'Spider-Man: No Way Home',
    bookings: 1247,
    revenue: 18705000,
    rating: 4.8,
    poster: '/movie1.jpg'
  },
  {
    id: '2',
    title: 'Doctor Strange 2',
    bookings: 998,
    revenue: 14970000,
    rating: 4.5,
    poster: '/movie2.jpg'
  },
  {
    id: '3',
    title: 'Top Gun: Maverick',
    bookings: 856,
    revenue: 12840000,
    rating: 4.7,
    poster: '/movie3.jpg'
  },
  {
    id: '4',
    title: 'Minions: The Rise of Gru',
    bookings: 742,
    revenue: 11130000,
    rating: 4.3,
    poster: '/movie4.jpg'
  }
];

const mockRecentActivities: RecentActivity[] = [
  {
    id: '1',
    type: 'booking',
    message: 'Nguyễn Văn An đã đặt 2 vé cho suất 19:30',
    time: '2 phút trước',
    user: 'Nguyễn Văn An'
  },
  {
    id: '2',
    type: 'user',
    message: 'Người dùng mới đăng ký: Trần Thị Bình',
    time: '5 phút trước',
    user: 'Trần Thị Bình'
  },
  {
    id: '3',
    type: 'review',
    message: 'Đánh giá 5 sao cho phim "Spider-Man"',
    time: '8 phút trước',
    user: 'Lê Văn Cường'
  },
  {
    id: '4',
    type: 'booking',
    message: 'Hoàn tiền cho booking #BK-2024-1247',
    time: '12 phút trước'
  },
  {
    id: '5',
    type: 'movie',
    message: 'Phim mới "Avatar 3" đã được thêm vào hệ thống',
    time: '15 phút trước'
  }
];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        bookingsToday: prev.bookingsToday + Math.floor(Math.random() * 3),
        revenueToday: prev.revenueToday + Math.floor(Math.random() * 50000)
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return <CalendarDays className="w-4 h-4 text-blue-500" />;
      case 'user': return <Users className="w-4 h-4 text-green-500" />;
      case 'movie': return <Film className="w-4 h-4 text-purple-500" />;
      case 'review': return <Star className="w-4 h-4 text-yellow-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const SimpleBarChart: React.FC<{ data: ChartData[], color: string }> = ({ data, color }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div className="flex items-end justify-between h-40 gap-3 px-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-3 group">
            <div className="relative w-full">
              <div 
                className={`w-full ${color} rounded-t-xl transition-all duration-700 hover:opacity-90 shadow-lg relative overflow-hidden`}
                style={{ 
                  height: `${(item.value / maxValue) * 140}px`,
                  minHeight: '8px'
                }}
              >
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white to-transparent opacity-20 group-hover:animate-pulse"></div>
              </div>
              {/* Value label on hover */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {item.value >= 1000000 ? `${(item.value / 1000000).toFixed(1)}M` : formatNumber(item.value)}
              </div>
            </div>
            <div className="text-xs text-gray-600 font-semibold group-hover:text-gray-900 transition-colors">{item.name}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-8xl mx-auto space-y-6">
        {/* Header with Animation */}
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              Trang chủ
            </h1>
            <p className="text-gray-600 text-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Tổng quan hiệu suất và thống kê hệ thống rạp chiếu phim
            </p>
          </div>
          
          <div className="flex gap-2 bg-white rounded-xl p-1 shadow-md">
            {(['week', 'month', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  selectedPeriod === period
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {period === 'week' ? '7 Ngày' : period === 'month' ? 'Tháng này' : 'Năm nay'}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics with Enhanced Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue - Green Theme */}
          <div className="group relative bg-white rounded-2xl p-6 border-2 border-transparent hover:border-green-200 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-transparent rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {formatCurrency(stats.totalRevenue).replace('₫', '')}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">Tổng doanh thu</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm pt-4 border-t border-gray-100">
                <span className="flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                  <ArrowUpRight className="w-4 h-4" />
                  +12.5%
                </span>
                <span className="text-gray-500">vs tháng trước</span>
              </div>
            </div>
          </div>

          {/* Total Bookings - Blue Theme */}
          <div className="group relative bg-white rounded-2xl p-6 border-2 border-transparent hover:border-blue-200 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <CalendarDays className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {formatNumber(stats.totalBookings)}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">Tổng vé đã bán</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm pt-4 border-t border-gray-100">
                <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                  <ArrowUpRight className="w-4 h-4" />
                  +8.2%
                </span>
                <span className="text-gray-500">vs tuần trước</span>
              </div>
            </div>
          </div>

          {/* Total Users - Purple Theme */}
          <div className="group relative bg-white rounded-2xl p-6 border-2 border-transparent hover:border-purple-200 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-transparent rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {formatNumber(stats.totalUsers)}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">Tổng người dùng</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm pt-4 border-t border-gray-100">
                <span className="flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">
                  <ArrowUpRight className="w-4 h-4" />
                  +{stats.newUsersToday}
                </span>
                <span className="text-gray-500">mới hôm nay</span>
              </div>
            </div>
          </div>

          {/* Occupancy Rate - Orange Theme */}
          <div className="group relative bg-white rounded-2xl p-6 border-2 border-transparent hover:border-orange-200 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-transparent rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {stats.occupancyRate}%
                  </div>
                  <div className="text-sm text-gray-500 font-medium">Tỷ lệ lấp đầy</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm pt-4 border-t border-gray-100">
                <span className="flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full font-semibold">
                  <ArrowUpRight className="w-4 h-4" />
                  +3.1%
                </span>
                <span className="text-gray-500">vs hôm qua</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section with Enhanced Design */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                Doanh thu 7 ngày qua
              </h3>
              <div className="text-sm font-semibold px-4 py-2 bg-green-100 text-green-700 rounded-full">
                {formatCurrency(mockRevenueData.reduce((sum, item) => sum + item.value, 0))}
              </div>
            </div>
            <SimpleBarChart data={mockRevenueData} color="bg-gradient-to-t from-green-400 to-emerald-500" />
          </div>

          {/* Bookings Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-lg flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-white" />
                </div>
                Vé bán ra 7 ngày qua
              </h3>
              <div className="text-sm font-semibold px-4 py-2 bg-blue-100 text-blue-700 rounded-full">
                {formatNumber(mockBookingData.reduce((sum, item) => sum + item.value, 0))} vé
              </div>
            </div>
            <SimpleBarChart data={mockBookingData} color="bg-gradient-to-t from-blue-400 to-cyan-500" />
          </div>
        </div>

        {/* Bottom Section with Enhanced Design */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Movies */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              Top phim bán chạy nhất
            </h3>
            <div className="space-y-3">
              {mockTopMovies.map((movie, index) => (
                <div key={movie.id} className="group flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-yellow-200 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-all duration-300">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                    {index + 1}
                  </div>
                  <div className="w-14 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                    <Film className="w-7 h-7 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">{movie.title}</div>
                    <div className="text-sm text-gray-600 flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                        <CalendarDays className="w-3 h-3" />
                        {formatNumber(movie.bookings)} vé
                      </span>
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                        <DollarSign className="w-3 h-3" />
                        {formatCurrency(movie.revenue).replace('₫', '')}
                      </span>
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                        <Star className="w-3 h-3 fill-current" />
                        {movie.rating}/5
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              Hoạt động gần đây
            </h3>
            <div className="space-y-4">
              {mockRecentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className="flex-shrink-0 mt-1 group-hover:scale-110 transition-transform">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-900 mb-1 font-medium">
                      {activity.message}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;