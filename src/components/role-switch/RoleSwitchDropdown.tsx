import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { KeyRound, LogIn, LogOut, ShieldCheck, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  authenticateSuperAdmin,
  clearRoleSwitchSession,
  getRoleSwitchSession,
} from "@/lib/role-switch.functions";

const ROLE_DASHBOARDS = [
  { label: "Super Admin", route: "/" as const },
  { label: "Developer Manager", route: "/dev-manager" as const },
  { label: "Developer Management", route: "/developer-management" as const },
  { label: "Developer Team", route: "/developer-team" as const },
];

type LoginFields = {
  username: string;
  password: string;
  licenseKey: string;
  backupKey: string;
};

const EMPTY_FIELDS: LoginFields = {
  username: "",
  password: "",
  licenseKey: "",
  backupKey: "",
};

export function RoleSwitchDropdown() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verified, setVerified] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [fields, setFields] = useState<LoginFields>(EMPTY_FIELDS);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    void getRoleSwitchSession().then((session) => {
      if (active) setVerified(session.authenticated);
    });
    return () => {
      active = false;
    };
  }, []);

  const updateField = (field: keyof LoginFields, value: string) => {
    setFields((current) => ({ ...current, [field]: value }));
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await authenticateSuperAdmin({ data: fields });
      if (!result.ok) {
        toast({
          title: "Access denied",
          description: "The supplied access details could not be verified.",
          variant: "destructive",
        });
        return;
      }
      setVerified(true);
      setFields(EMPTY_FIELDS);
      setLoginOpen(false);
      toast({ title: "Super Admin access verified", variant: "success" });
    } catch {
      toast({
        title: "Verification unavailable",
        description: "Try again when the secure access service is available.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    try {
      await clearRoleSwitchSession();
      setVerified(false);
      toast({ title: "Super Admin access signed out" });
    } catch {
      toast({ title: "Sign out failed", variant: "destructive" });
    }
  };

  return (
    <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2" aria-label="Super Admin role switcher">
            {verified ? <ShieldCheck className="h-3.5 w-3.5" /> : <UserRound className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">Super Admin</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>{verified ? "Verified role dashboards" : "Super Admin access"}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {verified ? (
            <>
              {ROLE_DASHBOARDS.map((dashboard) => (
                <DropdownMenuItem
                  key={dashboard.route}
                  onClick={() => void navigate({ to: dashboard.route })}
                >
                  <ShieldCheck className="h-4 w-4" />
                  {dashboard.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => void handleLogout()}>
                <LogOut className="h-4 w-4" />
                Sign out access
              </DropdownMenuItem>
            </>
          ) : (
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                <LogIn className="h-4 w-4" />
                Verify access keys
              </DropdownMenuItem>
            </DialogTrigger>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleLogin}>
          <DialogHeader>
            <DialogTitle>Super Admin access</DialogTitle>
            <DialogDescription>
              Verify the account and both access keys to enable role dashboard switching.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role-switch-username">Username</Label>
              <Input
                id="role-switch-username"
                value={fields.username}
                onChange={(event) => updateField("username", event.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-switch-password">Password</Label>
              <Input
                id="role-switch-password"
                type="password"
                value={fields.password}
                onChange={(event) => updateField("password", event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-switch-license">License key</Label>
              <Input
                id="role-switch-license"
                value={fields.licenseKey}
                onChange={(event) => updateField("licenseKey", event.target.value)}
                inputMode="numeric"
                autoComplete="off"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-switch-backup">Backup key</Label>
              <Input
                id="role-switch-backup"
                value={fields.backupKey}
                onChange={(event) => updateField("backupKey", event.target.value)}
                inputMode="numeric"
                autoComplete="off"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={busy} className="gap-2">
              <KeyRound className="h-4 w-4" />
              {busy ? "Verifying…" : "Verify and continue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default RoleSwitchDropdown;