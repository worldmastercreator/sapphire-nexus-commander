-- Developers: capacity + identity
ALTER TABLE public.developers
  ADD COLUMN IF NOT EXISTS vala_id text,
  ADD COLUMN IF NOT EXISTS max_capacity integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS availability text NOT NULL DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS skill_tags text[] NOT NULL DEFAULT '{}'::text[];

ALTER TABLE public.developers ALTER COLUMN user_id DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS developers_vala_id_key ON public.developers (vala_id);

-- Tasks: delivery governance fields
ALTER TABLE public.developer_tasks DROP CONSTRAINT IF EXISTS developer_tasks_priority_check;
ALTER TABLE public.developer_tasks DROP CONSTRAINT IF EXISTS developer_tasks_status_check;
ALTER TABLE public.developer_tasks ADD CONSTRAINT developer_tasks_priority_check
  CHECK (priority = ANY (ARRAY['low','medium','high','urgent','critical']));
ALTER TABLE public.developer_tasks ADD CONSTRAINT developer_tasks_status_check
  CHECK (status = ANY (ARRAY['pending','assigned','accepted','working','in_progress','testing','review','completed','blocked','escalated','cancelled']));
ALTER TABLE public.developer_tasks
  ADD COLUMN IF NOT EXISTS promise_id text,
  ADD COLUMN IF NOT EXISTS blocked_reason text,
  ADD COLUMN IF NOT EXISTS blocked_since timestamptz,
  ADD COLUMN IF NOT EXISTS escalate_threshold_hours integer NOT NULL DEFAULT 24,
  ADD COLUMN IF NOT EXISTS quality_score numeric;

-- Escalations
CREATE TABLE IF NOT EXISTS public.escalations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES public.developer_tasks(id) ON DELETE CASCADE,
  reason text NOT NULL,
  escalated_to text NOT NULL DEFAULT 'AREA-MGR-112',
  escalated_by uuid,
  auto_escalated boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  resolution text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.escalations TO authenticated;
GRANT ALL ON public.escalations TO service_role;
ALTER TABLE public.escalations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Managers manage escalations" ON public.escalations
  FOR ALL TO authenticated
  USING (public.is_dev_manager(auth.uid()))
  WITH CHECK (public.is_dev_manager(auth.uid()));
CREATE POLICY "Developers read own task escalations" ON public.escalations
  FOR SELECT TO authenticated
  USING (task_id IN (
    SELECT t.id FROM public.developer_tasks t
    JOIN public.developers d ON d.id = t.developer_id
    WHERE d.user_id = auth.uid()
  ));
CREATE TRIGGER update_escalations_updated_at BEFORE UPDATE ON public.escalations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Internal notes (manager-only)
CREATE TABLE IF NOT EXISTS public.task_internal_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES public.developer_tasks(id) ON DELETE CASCADE,
  author_id uuid,
  author_label text,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.task_internal_notes TO authenticated;
GRANT ALL ON public.task_internal_notes TO service_role;
ALTER TABLE public.task_internal_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Managers manage internal notes" ON public.task_internal_notes
  FOR ALL TO authenticated
  USING (public.is_dev_manager(auth.uid()))
  WITH CHECK (public.is_dev_manager(auth.uid()));

-- Realtime
ALTER TABLE public.developer_tasks REPLICA IDENTITY FULL;
ALTER TABLE public.escalations REPLICA IDENTITY FULL;
ALTER TABLE public.task_internal_notes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.developer_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.escalations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_internal_notes;

-- ============ Seed: developer roster ============
INSERT INTO public.developers (vala_id, full_name, email, status, onboarding_completed, joined_at, max_capacity, availability, skill_tags)
VALUES
  ('DEV-7842','Aarav Mehta','aarav.mehta@softwarevala.dev','active',true, now() - interval '400 days', 5,'busy', ARRAY['React','Node','TypeScript']),
  ('DEV-3291','Neha Sharma','neha.sharma@softwarevala.dev','active',true, now() - interval '280 days', 4,'available', ARRAY['Python','ML','FastAPI']),
  ('DEV-5104','Rohit Verma','rohit.verma@softwarevala.dev','active',true, now() - interval '520 days', 5,'overloaded', ARRAY['Java','Spring','Kafka']),
  ('DEV-8877','Priya Iyer','priya.iyer@softwarevala.dev','active',true, now() - interval '190 days', 5,'busy', ARRAY['React','TypeScript','GraphQL']),
  ('DEV-6215','Kabir Singh','kabir.singh@softwarevala.dev','active',true, now() - interval '95 days', 4,'available', ARRAY['Go','Postgres','Docker']),
  ('DEV-9430','Ananya Bose','ananya.bose@softwarevala.dev','pending',false, now() - interval '9 days', 3,'offline', ARRAY['Flutter','Dart'])
ON CONFLICT (vala_id) DO NOTHING;

-- ============ Seed: tasks ============
INSERT INTO public.developer_tasks
  (developer_id, title, description, category, tech_stack, priority, status, promise_id, estimated_hours, max_delivery_hours, promised_at, accepted_at, started_at, deadline, blocked_reason, blocked_since, quality_score, completed_at, buzzer_active)
SELECT d.id, v.title, v.description, v.category, v.tech_stack, v.priority, v.status, v.promise_id, v.estimated_hours, v.max_delivery_hours,
       now() - v.promised_ago, now() - v.promised_ago + interval '20 minutes',
       CASE WHEN v.status IN ('in_progress','blocked','review','completed') THEN now() - v.promised_ago + interval '40 minutes' ELSE NULL END,
       now() + v.deadline_in, v.blocked_reason,
       CASE WHEN v.status = 'blocked' THEN now() - v.blocked_ago ELSE NULL END,
       v.quality_score,
       CASE WHEN v.status = 'completed' THEN now() - v.completed_ago ELSE NULL END,
       v.status <> 'completed'
FROM (VALUES
  ('DEV-7842','API Integration Module','Wire the partner billing API into the delivery service layer with retry + idempotency.','integration',ARRAY['Node','TypeScript'],'high','in_progress','PRM-112',8.0,10.0, interval '30 hours', interval '8 hours', NULL::text, interval '0 hours', NULL::numeric, interval '0 hours'),
  ('DEV-3291','Database Migration','Migrate reporting schema to partitioned tables with zero-downtime cutover.','backend',ARRAY['Postgres','Python'],'critical','pending','PRM-115',12.0,14.0, interval '20 hours', interval '2 hours', NULL, interval '0 hours', NULL, interval '0 hours'),
  ('DEV-5104','UI Component Library','Ship the shared component library with tokens and a11y coverage.','frontend',ARRAY['React','TypeScript'],'medium','blocked',NULL,16.0,20.0, interval '60 hours', interval '24 hours','Waiting for design assets from the external brand team', interval '36 hours', NULL, interval '0 hours'),
  ('DEV-8877','Auth Flow Refactor','Split auth flow into session gate + bearer attach and remove duplicated guards.','security',ARRAY['React','Supabase'],'high','review','PRM-118',10.0,12.0, interval '40 hours', interval '12 hours', NULL, interval '0 hours', NULL, interval '0 hours'),
  ('DEV-7842','Payment Gateway Fix','Fix webhook signature verification failures on retried payloads.','backend',ARRAY['Node','Crypto'],'critical','in_progress','PRM-120',6.0,8.0, interval '26 hours', interval '4 hours', NULL, interval '0 hours', NULL, interval '0 hours'),
  ('DEV-8877','Report Generation','Add scheduled PDF export for weekly delivery reports.','backend',ARRAY['Node','Puppeteer-free'],'medium','in_progress',NULL,9.0,12.0, interval '18 hours', interval '9 hours', NULL, interval '0 hours', NULL, interval '0 hours'),
  ('DEV-6215','Third-party API Integration','Integrate logistics tracking provider with signed callbacks.','integration',ARRAY['Go','Postgres'],'high','blocked',NULL,8.0,10.0, interval '22 hours', interval '10 hours','API credentials pending approval from the vendor', interval '12 hours', NULL, interval '0 hours'),
  ('DEV-5104','Kafka Consumer Hardening','Add DLQ + backoff to the order events consumer.','backend',ARRAY['Java','Kafka'],'high','in_progress',NULL,10.0,12.0, interval '15 hours', interval '14 hours', NULL, interval '0 hours', NULL, interval '0 hours'),
  ('DEV-5104','Legacy Report Cleanup','Remove deprecated report endpoints and update clients.','backend',ARRAY['Java'],'low','in_progress',NULL,5.0,6.0, interval '12 hours', interval '30 hours', NULL, interval '0 hours', NULL, interval '0 hours'),
  ('DEV-7842','Realtime Presence','Add presence channel for delivery board collaboration.','frontend',ARRAY['React','Supabase'],'medium','completed',NULL,7.0,8.0, interval '9 days', interval '-7 days', NULL, interval '0 hours', 91, interval '7 days'),
  ('DEV-3291','ML Ranking Prototype','Prototype task-priority ranking model on historical delivery data.','data',ARRAY['Python','ML'],'medium','completed','PRM-101',14.0,16.0, interval '16 days', interval '-13 days', NULL, interval '0 hours', 88, interval '13 days'),
  ('DEV-8877','GraphQL Schema Split','Split the monolithic schema into federated subgraphs.','frontend',ARRAY['GraphQL','TypeScript'],'high','completed',NULL,12.0,14.0, interval '11 days', interval '-9 days', NULL, interval '0 hours', 94, interval '9 days'),
  ('DEV-5104','Spring Upgrade','Upgrade Spring Boot and patch transitive CVEs.','backend',ARRAY['Java','Spring'],'high','completed',NULL,9.0,10.0, interval '20 days', interval '-16 days', NULL, interval '0 hours', 79, interval '16 days'),
  ('DEV-6215','Container Slimming','Cut image size and cold-start time for the worker service.','devops',ARRAY['Docker','Go'],'low','completed',NULL,4.0,6.0, interval '6 days', interval '-5 days', NULL, interval '0 hours', 90, interval '5 days')
) AS v(vala_id,title,description,category,tech_stack,priority,status,promise_id,estimated_hours,max_delivery_hours,promised_ago,deadline_in,blocked_reason,blocked_ago,quality_score,completed_ago)
JOIN public.developers d ON d.vala_id = v.vala_id
WHERE NOT EXISTS (SELECT 1 FROM public.developer_tasks t WHERE t.title = v.title);

-- ============ Seed: escalations ============
INSERT INTO public.escalations (task_id, reason, escalated_to, status, auto_escalated, created_at, resolution, resolved_at)
SELECT t.id, v.reason, 'AREA-MGR-112', v.status, v.auto_escalated, now() - v.created_ago, v.resolution,
       CASE WHEN v.status = 'resolved' THEN now() - v.created_ago + interval '6 hours' ELSE NULL END
FROM (VALUES
  ('Database Migration','Critical SLA breach risk - migration deadline within 2 hours','pending',false, interval '5 hours', NULL::text),
  ('UI Component Library','Blocked for 36+ hours on an external design dependency','acknowledged',true, interval '12 hours', NULL),
  ('Spring Upgrade','Quality score below the 85 delivery threshold','resolved',false, interval '3 days','Additional review cycle assigned and patch re-verified')
) AS v(task_title,reason,status,auto_escalated,created_ago,resolution)
JOIN public.developer_tasks t ON t.title = v.task_title
WHERE NOT EXISTS (SELECT 1 FROM public.escalations e WHERE e.task_id = t.id AND e.reason = v.reason);

-- ============ Seed: internal notes ============
INSERT INTO public.task_internal_notes (task_id, author_label, content, created_at)
SELECT t.id, 'DEV-MGR-445', v.content, now() - v.created_ago
FROM (VALUES
  ('Database Migration','Cutover window moved to 02:00 IST; DBA on standby for the partition swap.', interval '3 hours'),
  ('UI Component Library','External design team notified about the blocking dependency. Expected resolution by EOD.', interval '10 hours'),
  ('Payment Gateway Fix','Priority raised due to client-facing impact. Daily check-in added to standup.', interval '20 hours')
) AS v(task_title,content,created_ago)
JOIN public.developer_tasks t ON t.title = v.task_title
WHERE NOT EXISTS (SELECT 1 FROM public.task_internal_notes n WHERE n.task_id = t.id AND n.content = v.content);