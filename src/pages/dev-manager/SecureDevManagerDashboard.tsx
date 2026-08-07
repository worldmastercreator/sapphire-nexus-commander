/**
 * SECURE DEV MANAGER DASHBOARD — UnifiedShell edition
 * Merges the Delivery Governor views with the full Developer Management
 * module (17 screens) into one end-to-end consistent UI.
 */
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Users, ListTodo, AlertTriangle, BarChart3, ArrowUpRight, MessageSquare,
  Shield, AlertOctagon, Clock, LayoutDashboard, UserPlus, Layers, Target,
  Hammer, FileCode, CheckCircle, Bug, TrendingUp, Wallet, Lock, FileText,
  Settings, Code2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { HostConnectButton } from '@/components/dev-manager/HostConnectButton';
import { useDevManagerGuard } from '@/hooks/useDevManagerGuard';
import { useDeliveryOverview } from '@/hooks/useDevManagerData';
import { UnifiedShell, UnifiedNavGroup } from '@/components/unified/UnifiedShell';
import { ScreenErrorBoundary, ScreenPending } from '@/components/route-states';

import DevManagerCapacityOverview from '@/components/dev-manager/DevManagerCapacityOverview';
import DevManagerActiveTasksView from '@/components/dev-manager/DevManagerActiveTasksView';
import DevManagerSLARiskAlerts from '@/components/dev-manager/DevManagerSLARiskAlerts';
import DevManagerBlockedTasks from '@/components/dev-manager/DevManagerBlockedTasks';
import DevManagerPerformanceSnapshot from '@/components/dev-manager/DevManagerPerformanceSnapshot';
import DevManagerEscalations from '@/components/dev-manager/DevManagerEscalations';
import DevManagerInternalComms from '@/components/dev-manager/DevManagerInternalComms';

const DMDeveloperRegistry = lazy(() => import("@/components/developer-management/screens/DMDeveloperRegistry").then((m) => ({ default: m.DMDeveloperRegistry })));
const DMOnboardingRequests = lazy(() => import("@/components/developer-management/screens/DMOnboardingRequests").then((m) => ({ default: m.DMOnboardingRequests })));
const DMRoleSkillMapping = lazy(() => import("@/components/developer-management/screens/DMRoleSkillMapping").then((m) => ({ default: m.DMRoleSkillMapping })));
const DMTaskManagement = lazy(() => import("@/components/developer-management/screens/DMTaskManagement").then((m) => ({ default: m.DMTaskManagement })));
const DMSprintMilestone = lazy(() => import("@/components/developer-management/screens/DMSprintMilestone").then((m) => ({ default: m.DMSprintMilestone })));
const DMBuildAssignment = lazy(() => import("@/components/developer-management/screens/DMBuildAssignment").then((m) => ({ default: m.DMBuildAssignment })));
const DMCodeSubmission = lazy(() => import("@/components/developer-management/screens/DMCodeSubmission").then((m) => ({ default: m.DMCodeSubmission })));
const DMReviewQA = lazy(() => import("@/components/developer-management/screens/DMReviewQA").then((m) => ({ default: m.DMReviewQA })));
const DMBugFixTracker = lazy(() => import("@/components/developer-management/screens/DMBugFixTracker").then((m) => ({ default: m.DMBugFixTracker })));
const DMPerformanceKPI = lazy(() => import("@/components/developer-management/screens/DMPerformanceKPI").then((m) => ({ default: m.DMPerformanceKPI })));
const DMPaymentIncentive = lazy(() => import("@/components/developer-management/screens/DMPaymentIncentive").then((m) => ({ default: m.DMPaymentIncentive })));
const DMComplianceNDA = lazy(() => import("@/components/developer-management/screens/DMComplianceNDA").then((m) => ({ default: m.DMComplianceNDA })));
const DMSecurityAccess = lazy(() => import("@/components/developer-management/screens/DMSecurityAccess").then((m) => ({ default: m.DMSecurityAccess })));
const DMAlertsEscalation = lazy(() => import("@/components/developer-management/screens/DMAlertsEscalation").then((m) => ({ default: m.DMAlertsEscalation })));
const DMAuditLogs = lazy(() => import("@/components/developer-management/screens/DMAuditLogs").then((m) => ({ default: m.DMAuditLogs })));
const DMSettings = lazy(() => import("@/components/developer-management/screens/DMSettings").then((m) => ({ default: m.DMSettings })));

const SCREENS: Record<string, React.ReactNode> = {
  capacity: <DevManagerCapacityOverview />,
  tasks: <DevManagerActiveTasksView />,
  risks: <DevManagerSLARiskAlerts />,
  blocked: <DevManagerBlockedTasks />,
  performance: <DevManagerPerformanceSnapshot />,
  escalations: <DevManagerEscalations />,
  comms: <DevManagerInternalComms />,
  developer_registry: <DMDeveloperRegistry />,
  onboarding_requests: <DMOnboardingRequests />,
  role_skill_mapping: <DMRoleSkillMapping />,
  task_management: <DMTaskManagement />,
  sprint_milestone: <DMSprintMilestone />,
  build_assignment: <DMBuildAssignment />,
  code_submission: <DMCodeSubmission />,
  review_qa: <DMReviewQA />,
  bug_fix_tracker: <DMBugFixTracker />,
  performance_kpi: <DMPerformanceKPI />,
  payment_incentive: <DMPaymentIncentive />,
  compliance_nda: <DMComplianceNDA />,
  security_access: <DMSecurityAccess />,
  alerts_escalation: <DMAlertsEscalation />,
  audit_logs: <DMAuditLogs />,
  settings: <DMSettings />,
};

const GROUPS: UnifiedNavGroup[] = [
  {
    title: 'Delivery Command',
    items: [
      { id: 'capacity', label: 'Capacity Overview', icon: LayoutDashboard },
      { id: 'tasks', label: 'Active Tasks', icon: ListTodo },
      { id: 'risks', label: 'SLA Risks', icon: AlertTriangle },
      { id: 'blocked', label: 'Blocked Tasks', icon: AlertOctagon },
      { id: 'escalations', label: 'Escalations', icon: ArrowUpRight },
      { id: 'comms', label: 'Internal Notes', icon: MessageSquare },
    ],
  },
  {
    title: 'People & Skills',
    items: [
      { id: 'developer_registry', label: 'Developer Registry', icon: Users },
      { id: 'onboarding_requests', label: 'Onboarding Requests', icon: UserPlus },
      { id: 'role_skill_mapping', label: 'Role & Skill Mapping', icon: Layers },
    ],
  },
  {
    title: 'Work Pipeline',
    items: [
      { id: 'task_management', label: 'Task Management', icon: ListTodo },
      { id: 'sprint_milestone', label: 'Sprint / Milestone', icon: Target },
      { id: 'build_assignment', label: 'Build Assignment', icon: Hammer },
      { id: 'code_submission', label: 'Code Submission', icon: FileCode },
      { id: 'review_qa', label: 'Review & QA', icon: CheckCircle },
      { id: 'bug_fix_tracker', label: 'Bug Fix Tracker', icon: Bug },
    ],
  },
  {
    title: 'Performance & Payout',
    items: [
      { id: 'performance', label: 'Performance Snapshot', icon: BarChart3 },
      { id: 'performance_kpi', label: 'Performance KPI', icon: TrendingUp },
      { id: 'payment_incentive', label: 'Payment & Incentive', icon: Wallet },
    ],
  },
  {
    title: 'Governance',
    items: [
      { id: 'compliance_nda', label: 'Compliance & NDA', icon: Shield },
      { id: 'security_access', label: 'Security & Access', icon: Lock },
      { id: 'alerts_escalation', label: 'Alerts & Escalation', icon: AlertTriangle },
      { id: 'audit_logs', label: 'Audit Logs', icon: FileText },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function SecureDevManagerDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  useDevManagerGuard();
  const { data: overview, isLoading: overviewLoading } = useDeliveryOverview();
  const [active, setActive] = useState('capacity');
  const [idleSeconds, setIdleSeconds] = useState(0);
  const [locked, setLocked] = useState(false);
  const warnedRef = React.useRef(false);

  const IDLE_LIMIT = 1800; // 30 min
  const IDLE_WARN = 1500; // 25 min

  // Idle tracking — any real user activity resets the countdown.
  useEffect(() => {
    if (locked) return;
    const reset = () => {
      setIdleSeconds(0);
      warnedRef.current = false;
    };
    const events: (keyof WindowEventMap)[] = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    const timer = setInterval(() => setIdleSeconds((p) => p + 1), 1000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      clearInterval(timer);
    };
  }, [locked]);

  // Enforcement: warn at 25 min, lock the console at 30 min.
  useEffect(() => {
    if (locked) return;
    if (idleSeconds >= IDLE_LIMIT) {
      setLocked(true);
      toast({
        title: 'Session locked',
        description: 'Console locked after 30 minutes of inactivity.',
        variant: 'destructive',
      });
      return;
    }
    if (idleSeconds >= IDLE_WARN && !warnedRef.current) {
      warnedRef.current = true;
      toast({
        title: 'Session expiring',
        description: 'Console locks in 5 minutes unless you interact.',
        variant: 'destructive',
      });
    }
  }, [idleSeconds, locked, toast]);

  const resumeSession = () => {
    setIdleSeconds(0);
    warnedRef.current = false;
    setLocked(false);
  };


  const formatSessionTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const stats = overview?.stats;
  const badges: Record<string, number | undefined> = {
    tasks: stats?.activeTasks,
    risks: stats?.atRisk,
    blocked: stats?.blocked,
    escalations: stats?.escalations,
    alerts_escalation: stats?.escalations,
    developer_registry: stats?.developers,
  };
  const groups: UnifiedNavGroup[] = GROUPS.map((g) => ({
    ...g,
    items: g.items.map((i) => {
      const badge = badges[i.id];
      return badge && badge > 0 ? { ...i, badge } : i;
    }),
  }));

  const title =
    GROUPS.flatMap((g) => g.items).find((i) => i.id === active)?.label ?? 'Developer Manager';
  const groupTitle =
    GROUPS.find((g) => g.items.some((i) => i.id === active))?.title ?? 'Console';

  const notifications = [
    stats?.atRisk
      ? {
          id: 'risks',
          title: `${stats.atRisk} task(s) at SLA risk`,
          description: 'Open SLA Risk Alerts',
          onClick: () => setActive('risks'),
        }
      : null,
    stats?.blocked
      ? {
          id: 'blocked',
          title: `${stats.blocked} blocked task(s)`,
          description: 'Open Blocked Tasks',
          onClick: () => setActive('blocked'),
        }
      : null,
    stats?.escalations
      ? {
          id: 'escalations',
          title: `${stats.escalations} open escalation(s)`,
          description: 'Open Escalations',
          onClick: () => setActive('escalations'),
        }
      : null,
  ].filter(Boolean) as { id: string; title: string; description?: string; onClick?: () => void }[];

  return (
    <UnifiedShell
      brandTitle="Dev Manager"
      brandSubtitle="Delivery Governor"
      brandIcon={Code2}
      groups={groups}
      activeId={active}
      onSelect={setActive}
      topbarTitle={title}
      notifications={notifications}
      onBack={() => navigate({ to: '/' })}
      backLabel="Back to Dashboard"
      topbarRight={
        <>
          <HostConnectButton />
          <Badge
            variant="outline"
            className={`font-mono text-xs ${
              idleSeconds >= IDLE_WARN ? 'border-destructive/40 text-destructive' : ''
            }`}
            title="Time until this console locks for inactivity"
          >
            <Clock className="h-3 w-3 mr-1" />
            {formatSessionTime(Math.max(0, IDLE_LIMIT - idleSeconds))}
          </Badge>

          <Badge
            variant="outline"
            className="hidden sm:inline-flex bg-primary/10 text-primary border-primary/30"
          >
            <Shield className="h-3 w-3 mr-1" />
            AUDITED
          </Badge>
        </>
      }
      footer={
        <footer className="border-t border-border py-3">
          <p className="text-[11px] font-mono text-muted-foreground text-center tracking-wider">
            MANAGE PEOPLE • NOT CODE • ALL ACTIONS LOGGED
          </p>
        </footer>
      }
    >
      <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-2 text-xs">
        {active !== 'capacity' && (
          <button
            onClick={() => setActive('capacity')}
            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeftIcon className="h-3 w-3" />
            Back
          </button>
        )}
        <ol className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
          <li>
            <button onClick={() => setActive('capacity')} className="hover:text-foreground">
              Dev Manager
            </button>
          </li>
          <li aria-hidden="true">/</li>
          <li>{groupTitle}</li>
          <li aria-hidden="true">/</li>
          <li className="truncate font-medium text-foreground" aria-current="page">
            {title}
          </li>
        </ol>
      </nav>

      {active !== 'capacity' && (

        <div className="mb-4 grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { icon: Users, label: 'Developers', value: stats?.developers ?? 0 },
            { icon: ListTodo, label: 'Active Tasks', value: stats?.activeTasks ?? 0 },
            { icon: AlertTriangle, label: 'At Risk', value: stats?.atRisk ?? 0 },
            { icon: AlertOctagon, label: 'Blocked', value: stats?.blocked ?? 0 },
            { icon: ArrowUpRight, label: 'Escalations', value: stats?.escalations ?? 0 },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-card/60 px-4 py-3 flex items-center gap-3"
            >
              <s.icon className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-lg font-mono font-bold leading-none">
                  {overviewLoading ? '—' : s.value}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}


      <ScreenErrorBoundary screenId={active}>
        <Suspense fallback={<ScreenPending />}>{SCREENS[active]}</Suspense>
      </ScreenErrorBoundary>
    </UnifiedShell>
  );
}
