import { Link, useLocation } from "react-router-dom";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DvrIcon from '@mui/icons-material/Dvr';
import TheatersIcon from '@mui/icons-material/Theaters';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import GroupsIcon from '@mui/icons-material/Groups';
import { useState } from "react";

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const { pathname } = useLocation();
    const menu = [
        { label: "Dashboard", path: "/admin", icon: <DashboardIcon /> },
        { label: "Quản lý phim", path: "/admin/movies", icon: <DvrIcon /> },
        { label: "Quản lý suất chiếu", path: "/admin/showtimes", icon: <TheatersIcon /> },
        { label: "Quản lý phòng", path: "/admin/rooms", icon: <MeetingRoomIcon /> },
        { label: "Quản lý người dùng", path: "/admin/users", icon: <GroupsIcon /> },
    ];

return (
    <aside className={`bg-white text-black flex flex-col py-6 border-1 border-gray-300 border-t-0 overflow-hidden relative ${isOpen ? "w-58" : "w-16"} transition-width duration-300`}>
        <button className="absolute right-0 top-0 w-10 h-10 border-1 border-gray-300 border-t-0 border-r-0 cursor-pointer hover:bg-gray-200" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <KeyboardArrowLeftIcon /> : <KeyboardArrowRightIcon />}
        </button>
        <nav className="flex flex-col gap-2 mt-8">
            {menu.map(item => (
                <Link
                    key={item.path}
                    to={item.path}
                    className={` px-5 py-2 flex items-center gap-2 transition duration-300 ${
                        pathname === item.path ? "bg-[#ecf3ff] font-semibold text-[#465fff] border-r-4 border-[#465fff]" : "hover:bg-gray-200"
                    } ${isOpen ? "w-58" : "w-16"}`}
                >
                    {item.icon}
                    <div className={`flex-1 ${isOpen ? "block" : "hidden"}`}>{item.label}</div>
                    
                </Link>
            ))}
        </nav>
    </aside>
);
};

export default Sidebar;