import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import { Toaster } from "sonner";

const AdminMainLayout =
	() => {
		return (
            <div>
                <Toaster richColors position="top-center"/>
                <Navbar />
                <div className="flex bg-gray-100">
				    <Sidebar />
					<main className="flex-1 h-[calc(100vh-62px)] bg-[#f9fafb] overflow-auto">
						<Outlet />
					</main>
			    </div>
            </div>
			
		);
	};

export default AdminMainLayout;
