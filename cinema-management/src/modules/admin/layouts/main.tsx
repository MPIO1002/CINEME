import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";

const AdminMainLayout =
	() => {
		return (
            <div>
                <Navbar />
                <div className="flex bg-gray-100">
				    <Sidebar />
					<main className="flex-1 h-[calc(100vh-82px)] p-6 bg-[#f9fafb] overflow-auto">
						<Outlet />
					</main>
			    </div>
            </div>
			
		);
	};

export default AdminMainLayout;
