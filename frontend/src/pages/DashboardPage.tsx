import { TransactionManager } from "@/components/TransactionTable";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";


const DashboardPage = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div>
            <nav className="bg-white shadow-md p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold">My Transactions</h1>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </nav>
            <TransactionManager />
        </div>
    );
};

export default DashboardPage;