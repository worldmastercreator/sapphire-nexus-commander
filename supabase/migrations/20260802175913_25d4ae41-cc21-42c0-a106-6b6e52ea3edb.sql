-- Roles enum
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('boss_owner', 'ceo', 'prime', 'dev_manager', 'developer', 'client', 'franchise', 'reseller');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  force_logged_out_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_dev_manager(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('boss_owner', 'ceo', 'dev_manager')
  );
$$;

CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own role" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Managers read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.is_dev_manager(auth.uid()));
CREATE POLICY "Managers manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.is_dev_manager(auth.uid())) WITH CHECK (public.is_dev_manager(auth.uid()));

-- Developers
CREATE TABLE public.developers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'suspended')),
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.developers TO authenticated;
GRANT ALL ON public.developers TO service_role;
ALTER TABLE public.developers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers manage developers" ON public.developers
  FOR ALL TO authenticated USING (public.is_dev_manager(auth.uid())) WITH CHECK (public.is_dev_manager(auth.uid()));
CREATE POLICY "Developers read own record" ON public.developers
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Developers update own record" ON public.developers
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Developers create own record" ON public.developers
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Developer tasks
CREATE TABLE public.developer_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID REFERENCES public.developers(id) ON DELETE SET NULL,
  assigned_by UUID,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  tech_stack TEXT[] NOT NULL DEFAULT '{}',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'accepted', 'working', 'testing', 'completed', 'blocked', 'escalated', 'cancelled')),
  estimated_hours NUMERIC(5,2) DEFAULT 2.00,
  max_delivery_hours NUMERIC(5,2) DEFAULT 2.00,
  promised_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  deadline TIMESTAMPTZ,
  pause_reason TEXT,
  total_paused_minutes INTEGER NOT NULL DEFAULT 0,
  delivery_notes TEXT,
  client_id UUID,
  masked_client_info JSONB,
  buzzer_active BOOLEAN NOT NULL DEFAULT true,
  buzzer_acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.developer_tasks TO authenticated;
GRANT ALL ON public.developer_tasks TO service_role;
ALTER TABLE public.developer_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers manage tasks" ON public.developer_tasks
  FOR ALL TO authenticated USING (public.is_dev_manager(auth.uid())) WITH CHECK (public.is_dev_manager(auth.uid()));
CREATE POLICY "Developers read own tasks" ON public.developer_tasks
  FOR SELECT TO authenticated USING (
    developer_id IN (SELECT id FROM public.developers WHERE user_id = auth.uid())
  );
CREATE POLICY "Developers update own tasks" ON public.developer_tasks
  FOR UPDATE TO authenticated USING (
    developer_id IN (SELECT id FROM public.developers WHERE user_id = auth.uid())
  ) WITH CHECK (
    developer_id IN (SELECT id FROM public.developers WHERE user_id = auth.uid())
  );

-- Action logs
CREATE TABLE public.action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  button_id TEXT,
  module_name TEXT NOT NULL,
  action_type TEXT NOT NULL,
  action_result TEXT NOT NULL,
  response_time_ms INTEGER,
  error_message TEXT,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.action_logs TO authenticated;
GRANT ALL ON public.action_logs TO service_role;
ALTER TABLE public.action_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Insert action logs" ON public.action_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Read own action logs" ON public.action_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_dev_manager(auth.uid()));

CREATE INDEX idx_action_logs_user ON public.action_logs(user_id);
CREATE INDEX idx_action_logs_time ON public.action_logs(created_at DESC);
CREATE INDEX idx_action_logs_mod ON public.action_logs(module_name);

-- Audit logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  user_id UUID,
  role public.app_role,
  meta_json JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Insert audit logs" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Managers read audit logs" ON public.audit_logs
  FOR SELECT TO authenticated USING (public.is_dev_manager(auth.uid()) OR auth.uid() = user_id);

-- Force logout helpers
CREATE OR REPLACE FUNCTION public.check_force_logout(check_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND force_logged_out_at IS NOT NULL
  );
$$;

CREATE OR REPLACE FUNCTION public.clear_force_logout(clear_user_id UUID)
RETURNS VOID LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.user_roles SET force_logged_out_at = NULL, updated_at = now()
  WHERE user_id = clear_user_id;
$$;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_developers_updated_at BEFORE UPDATE ON public.developers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_developer_tasks_updated_at BEFORE UPDATE ON public.developer_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();