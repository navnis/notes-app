import { LogOut } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components";
import { useAuth } from "@/hooks/useAuth";

export function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      icon={<LogOut className="size-4" />}
      onClick={handleLogout}
    >
      Log out
    </Button>
  );
}
