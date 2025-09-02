import {
    Activity,
    ArrowUpRight,
    Award,
    BarChart3,
    CalendarDays,
    Clock,
    DollarSign,
    Film,
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
      <div className="flex items-end justify-between h-32 gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div 
              className={`w-full ${color} rounded-t-md transition-all duration-500 hover:opacity-80`}
              style={{ 
                height: `${(item.value / maxValue) * 100}%`,
                minHeight: '4px'
              }}
            />
            <div className="text-xs text-gray-600 font-medium">{item.name}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Tổng quan hiệu suất và thống kê hệ thống
          </p>
        </div>
        
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period === 'week' ? 'Tuần' : period === 'month' ? 'Tháng' : 'Năm'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalRevenue).replace('₫', '')}
              </div>
              <div className="text-sm text-gray-500">Tổng doanh thu</div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-green-600 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              +12.5%
            </span>
            <span className="text-gray-500">so với tháng trước</span>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(stats.totalBookings)}
              </div>
              <div className="text-sm text-gray-500">Tổng vé đã bán</div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-blue-600 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              +8.2%
            </span>
            <span className="text-gray-500">so với tuần trước</span>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(stats.totalUsers)}
              </div>
              <div className="text-sm text-gray-500">Tổng người dùng</div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-purple-600 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              +{stats.newUsersToday}
            </span>
            <span className="text-gray-500">người dùng mới hôm nay</span>
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {stats.occupancyRate}%
              </div>
              <div className="text-sm text-gray-500">Tỷ lệ lấp đầy</div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-orange-600 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              +3.1%
            </span>
            <span className="text-gray-500">so với hôm qua</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Doanh thu 7 ngày qua
            </h3>
            <div className="text-sm text-gray-500">
              Tổng: {formatCurrency(mockRevenueData.reduce((sum, item) => sum + item.value, 0))}
            </div>
          </div>
          <SimpleBarChart data={mockRevenueData} color="bg-green-500" />
        </div>

        {/* Bookings Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              Vé bán ra 7 ngày qua
            </h3>
            <div className="text-sm text-gray-500">
              Tổng: {formatNumber(mockBookingData.reduce((sum, item) => sum + item.value, 0))} vé
            </div>
          </div>
          <SimpleBarChart data={mockBookingData} color="bg-blue-500" />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Movies */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Top phim bán chạy
          </h3>
          <div className="space-y-4">
            {mockTopMovies.map((movie, index) => (
              <div key={movie.id} className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="w-12 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                  <Film className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{movie.title}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-4">
                    <span>{formatNumber(movie.bookings)} vé</span>
                    <span>{formatCurrency(movie.revenue)}</span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      {movie.rating}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Hoạt động gần đây
          </h3>
          <div className="space-y-4">
            {mockRecentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-900 mb-1">
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
  );
};

export default Dashboard;