/**
 * AUTH HOOK — ported from the source Software Vala platform and adapted to
 * this project's backend. Roles live in the `user_roles` table (never on the
 * profile), and privileged access is derived from that table only.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];
export type ApprovalStatus = "pending" | "approved" | "rejected";

const PRIVILEGED_ROLES: string[] = ["boss_owner", "ceo", "dev_manager"];
const AUTO_APPROVED_ROLES: string[] = ["boss_owner", "ceo", "prime", "dev_manager"];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: AppRole | null;
  approvalStatus: ApprovalStatus | null;
  isPrivileged: boolean;
  isBossOwner: boolean;
  isCEO: boolean;
  isDevManager: boolean;
  wasForceLoggedOut: boolean;
  signUp: (
    email: string,
    password: string,
    role: AppRole,
    fullName: string,
  ) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshApprovalStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus | null>(null);
  const [wasForceLoggedOut, setWasForceLoggedOut] = useState(false);
  const fetchingRef = useRef(false);

  const isPrivileged = userRole ? PRIVILEGED_ROLES.includes(userRole) : false;
  const isBossOwner = userRole === "boss_owner";
  const isCEO = userRole === "ceo";
  const isDevManager = userRole === "dev_manager" || isBossOwner || isCEO;

  const fetchRole = useCallback(async (userId: string) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role, approval_status, force_logged_out_at")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) return;

      if (data) {
        if (data.force_logged_out_at) {
          setWasForceLoggedOut(true);
          await supabase.auth.signOut();
          return;
        }
        setUserRole(data.role as AppRole);
        setApprovalStatus(data.approval_status as ApprovalStatus);
        return;
      }

      // No role row yet — initialise it from sign-up metadata.
      const { data: userData } = await supabase.auth.getUser();
      const metaRole = userData.user?.user_metadata?.["role"] as AppRole | undefined;
      if (!metaRole) return;

      const status: ApprovalStatus = AUTO_APPROVED_ROLES.includes(metaRole)
        ? "approved"
        : "pending";
      const { error: insertError } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: metaRole, approval_status: status });
      if (!insertError) {
        setUserRole(metaRole);
        setApprovalStatus(status);
      }
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        const userId = nextSession.user.id;
        setTimeout(() => {
          void fetchRole(userId);
        }, 0);
      } else {
        setUserRole(null);
        setApprovalStatus(null);
      }
      if (event === "SIGNED_OUT") setLoading(false);
    });

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) void fetchRole(data.session.user.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchRole]);

  const signUp: AuthContextType["signUp"] = async (email, password, role, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: fullName, role },
        },
      });
      if (error) throw error;

      if (data.user) {
        const status: ApprovalStatus = AUTO_APPROVED_ROLES.includes(role)
          ? "approved"
          : "pending";
        await supabase
          .from("user_roles")
          .insert({ user_id: data.user.id, role, approval_status: status });

        if (role === "developer") {
          await supabase.from("developers").insert({
            user_id: data.user.id,
            email,
            full_name: fullName,
            status: "pending",
          });
        }
      }
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn: AuthContextType["signIn"] = async (email, password) => {
    try {
      setWasForceLoggedOut(false);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        await supabase.rpc("clear_force_logout", { clear_user_id: data.user.id });
        await fetchRole(data.user.id);
      }
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithGoogle: AuthContextType["signInWithGoogle"] = async () => {
    try {
      const { lovable } = await import("@/integrations/lovable/index");
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error as Error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
    setApprovalStatus(null);
  };

  const refreshApprovalStatus = async () => {
    if (user) await fetchRole(user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        userRole,
        approvalStatus,
        isPrivileged,
        isBossOwner,
        isCEO,
        isDevManager,
        wasForceLoggedOut,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        refreshApprovalStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export default useAuth;
