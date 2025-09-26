import { TransactionManager } from "@/components/TransactionTable";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/contexts/AuthContext"; // Updated import
import { Badge } from "@/components/ui/badge";

const DashboardPage = () => {
    const { logout, user } = useAuth(); // Use the hook from context

    return (
        <div>
            <nav className="border-b">
                <div className="container mx-auto p-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold">My Transactions</h1>
                        {user?.role === 'admin' && <Badge>Admin View</Badge>}
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        {/* The logout function from the context now handles navigation */}
                        <Button variant="outline" onClick={logout}>Logout</Button>
                    </div>
                </div>
            </nav>
            <TransactionManager />
        </div>
    );
};

export default DashboardPage;