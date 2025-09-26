import DashboardIcon from '@mui/icons-material/Dashboard';
import DvrIcon from '@mui/icons-material/Dvr';
import GroupsIcon from '@mui/icons-material/Groups';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import SettingsIcon from '@mui/icons-material/Settings';
import TheatersIcon from '@mui/icons-material/Theaters';
import { CalendarRange, Film, Star } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { hasPermission } from "../utils/authUtils";

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [expandedMenus, setExpandedMenus] = useState<string[]>(['content']);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { pathname } = useLocation();

    const handleOpen = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const menuGroups = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: <DashboardIcon />,
            path: '/admin',
            type: 'single'
        },
        {
            id: 'content',
            label: 'Quản lý nội dung',
            icon: <Film className="w-5 h-5" />,
            type: 'group',
            children: [
                { label: "Quản lý phim", path: "/admin/movies", icon: <DvrIcon />, permission: "movie.view" },
                { label: "Quản lý diễn viên", path: "/admin/actors", icon: <Star className="w-5 h-5" />, permission: "actor.view" },
                { label: "Quản lý suất chiếu", path: "/admin/showtimes", icon: <CalendarRange className="w-5 h-5" />, permission: "showtime.view" },
            ]
        },
        {
            id: 'facility',
            label: 'Quản lý cơ sở',
            icon: <TheatersIcon />,
            type: 'group',
            children: [
                { label: "Quản lý rạp", path: "/admin/theaters", icon: <TheatersIcon />, permission: "theater.view" },
                { label: "Quản lý phòng", path: "/admin/rooms", icon: <MeetingRoomIcon />, permission: "room.view" },
            ]
        },
        {
            id: 'business',
            label: 'Vận hành kinh doanh',
            icon: <LocalOfferIcon />,
            type: 'group',
            children: [
                { label: "Quản lý người dùng", path: "/admin/users", icon: <GroupsIcon />, permission: "user.view" },
                { label: "Khuyến mãi", path: "/admin/promotions", icon: <LocalOfferIcon />, permission: "promotion.view" },
            ]
        },
        {
            id: 'system',
            label: 'Hệ thống & Cấu hình',
            icon: <SettingsIcon />,
            path: '/admin/system',
            type: 'single',
            permission: 'system.view'
        },
        {
            id: 'security',
            label: 'Bảo mật & Phân quyền',
            icon: <SettingsIcon />,
            path: '/admin/security',
            type: 'single'
        }
    ];

    // Filter menu groups based on permissions
    const filteredMenuGroups = menuGroups
        .map(group => {
            if (group.type === 'single') {
                // For single items, check permission if exists
                if (group.permission && !hasPermission(group.permission)) {
                    return null;
                }
                return group;
            } else {
                // For groups, filter children based on permissions
                const filteredChildren = group.children?.filter(child => 
                    !child.permission || hasPermission(child.permission)
                ) || [];
                // Only include group if it has children after filtering
                if (filteredChildren.length === 0) {
                    return null;
                }
                return {
                    ...group,
                    children: filteredChildren
                };
            }
        })
        .filter(group => group !== null);

    const toggleMenu = (menuId: string) => {
        setExpandedMenus(prev => 
            prev.includes(menuId) 
                ? prev.filter(id => id !== menuId)
                : [...prev, menuId]
        );
    };

    const isPathActive = (path: string) => {
        return pathname === path;
    };

    const isGroupActive = (children: { path: string }[]) => {
        return children.some(child => pathname === child.path);
    };

    return (
        <aside className={`bg-gradient-to-b from-white to-gray-50 text-black flex flex-col py-6 border border-gray-300 border-t-0 relative transition-all duration-300 shadow-sm ${isOpen ? "w-64" : "w-18"}`}>
            <button 
                className="absolute -right-3 top-6 w-6 h-6 bg-white border border-gray-300 rounded-full cursor-pointer hover:bg-gray-100 hover:shadow-md flex items-center justify-center z-1 transition-all duration-200" 
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <KeyboardArrowLeftIcon fontSize="small" /> : <KeyboardArrowRightIcon fontSize="small" />}
            </button>
            
            <nav className="flex flex-col gap-1 overflow-visible px-2 ">
                {filteredMenuGroups.map(group => {
                    if (group.type === 'single') {
                        return (
                            <div key={group.path} className="relative group">
                                <Link
                                    to={group.path!}
                                    className={`px-4 py-3 flex items-center gap-3 transition-all duration-300 rounded-lg ${
                                        isPathActive(group.path!) 
                                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-md" 
                                            : "hover:bg-gray-100 hover:shadow-sm"
                                    }`}
                                >
                                    <div className={`min-w-[24px] flex justify-center transition-colors duration-300 ${isPathActive(group.path!) ? 'text-white' : 'text-gray-600'}`}>
                                        {group.icon}
                                    </div>
                                    <div className={`flex-1 whitespace-nowrap overflow-hidden transition-all duration-300 ${isOpen ? "opacity-100 max-w-none" : "opacity-0 max-w-0"}`}>
                                        {group.label}
                                    </div>
                                </Link>
                                
                                {/* Tooltip khi sidebar thu nhỏ */}
                                {!isOpen && (
                                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[60] pointer-events-none">
                                        {group.label}
                                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800 rotate-45"></div>
                                    </div>
                                )}
                            </div>
                        );
                    }

                    const isExpanded = expandedMenus.includes(group.id);
                    const hasActiveChild = isGroupActive(group.children || []);

                    return (
                        <div key={group.id} className="relative group">
                            <button
                                onClick={() => isOpen && toggleMenu(group.id)}
                                className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-300 rounded-lg ${
                                    hasActiveChild 
                                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-md" 
                                        : "hover:bg-gray-100 hover:shadow-sm"
                                }`}
                            >
                                <div className={`min-w-[24px] flex justify-center transition-colors duration-300 ${hasActiveChild ? 'text-white' : 'text-gray-600'}`}>
                                    {group.icon}
                                </div>
                                <div className={`flex-1 text-left whitespace-nowrap overflow-hidden transition-all duration-300 ${isOpen ? "opacity-100 max-w-none" : "opacity-0 max-w-0"}`}>
                                    {group.label}
                                </div>
                                <div className={`transition-all duration-300 ${isOpen ? "opacity-100 max-w-none" : "opacity-0 max-w-0"} ${hasActiveChild ? 'text-white' : 'text-gray-400'}`}>
                                    {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                </div>
                            </button>

                            {/* Submenu khi sidebar mở rộng */}
                            {isOpen && isExpanded && group.children && (
                                <div className="ml-6 mt-1 space-y-1 overflow-hidden">
                                    {group.children.map(child => (
                                        <Link
                                            key={child.path}
                                            to={child.path}
                                            className={`px-4 py-2 flex items-center gap-3 transition-all duration-300 rounded-lg text-sm border-1 ${
                                                isPathActive(child.path) 
                                                    ? "bg-blue-50 border-blue-500 text-blue-700 font-medium shadow-sm" 
                                                    : "hover:bg-gray-50 text-gray-700 hover:text-gray-900 border-gray-200"
                                            }`}
                                        >
                                            <div className={`min-w-[20px] flex justify-center transition-colors duration-300 ${isPathActive(child.path) ? 'text-blue-700' : 'text-gray-500'}`}>
                                                {child.icon}
                                            </div>
                                            <div className="flex-1 whitespace-nowrap overflow-hidden">
                                                {child.label}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Dropdown menu khi sidebar thu nhỏ */}
                            {!isOpen && group.children && (
                                <div className="absolute left-full top-0 ml-2 bg-white border border-gray-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[60] min-w-[220px] pointer-events-none group-hover:pointer-events-auto overflow-hidden">
                                    <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl">
                                        <div className="flex items-center gap-3 font-semibold text-gray-800">
                                            <div className="min-w-[20px] flex justify-center text-gray-600">
                                                {group.icon}
                                            </div>
                                            <span>{group.label}</span>
                                        </div>
                                    </div>
                                    <div className="py-2 max-h-[300px] overflow-y-auto">
                                        {group.children.map(child => (
                                            <Link
                                                key={child.path}
                                                to={child.path}
                                                className={`px-4 py-3 flex items-center gap-3 transition-all duration-200 text-sm hover:bg-gray-50 ${
                                                    isPathActive(child.path) 
                                                        ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 font-medium border-r-3 border-blue-500" 
                                                        : "text-gray-700 hover:text-gray-900"
                                                }`}
                                            >
                                                <div className={`min-w-[20px] flex justify-center transition-colors duration-200 ${isPathActive(child.path) ? 'text-blue-600' : 'text-gray-500'}`}>
                                                    {child.icon}
                                                </div>
                                                <div className="flex-1">
                                                    {child.label}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                    {/* Arrow pointer */}
                                    <div className="absolute left-0 top-4 transform -translate-x-1 w-2 h-2 bg-white border-l border-t border-gray-200 rotate-45"></div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
};

export default Sidebar;