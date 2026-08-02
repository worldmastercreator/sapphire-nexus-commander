/**
 * SECURE DEV MANAGER DASHBOARD — UnifiedShell edition
 * Merges the Delivery Governor views with the full Developer Management
 * module (17 screens) into one end-to-end consistent UI.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Users, ListTodo, AlertTriangle, BarChart3, ArrowUpRight, MessageSquare,
  Shield, AlertOctagon, Clock, LayoutDashboard, UserPlus, Layers, Target,
  Hammer, FileCode, CheckCircle, Bug, TrendingUp, Wallet, Lock, FileText,
  Settings, Code2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useDevManagerGuard } from '@/hooks/useDevManagerGuard';
import { UnifiedShell, UnifiedNavGroup } from '@/components/unified/UnifiedShell';

import DevManagerCapacityOverview from '@/components/dev-manager/DevManagerCapacityOverview';
import DevManagerActiveTasksView from '@/components/dev-manager/DevManagerActiveTasksView';
import DevManagerSLARiskAlerts from '@/components/dev-manager/DevManagerSLARiskAlerts';
import DevManagerBlockedTasks from '@/components/dev-manager/DevManagerBlockedTasks';
import DevManagerPerformanceSnapshot from '@/components/dev-manager/DevManagerPerformanceSnapshot';
import DevManagerEscalations from '@/components/dev-manager/DevManagerEscalations';
import DevManagerInternalComms from '@/components/dev-manager/DevManagerInternalComms';

import { DMDeveloperRegistry } from '@/components/developer-management/screens/DMDeveloperRegistry';
import { DMOnboardingRequests } from '@/components/developer-management/screens/DMOnboardingRequests';
import { DMRoleSkillMapping } from '@/components/developer-management/screens/DMRoleSkillMapping';
import { DMTaskManagement } from '@/components/developer-management/screens/DMTaskManagement';
import { DMSprintMilestone } from '@/components/developer-management/screens/DMSprintMilestone';
import { DMBuildAssignment } from '@/components/developer-management/screens/DMBuildAssignment';
import { DMCodeSubmission } from '@/components/developer-management/screens/DMCodeSubmission';
import { DMReviewQA } from '@/components/developer-management/screens/DMReviewQA';
import { DMBugFixTracker } from '@/components/developer-management/screens/DMBugFixTracker';
import { DMPerformanceKPI } from '@/components/developer-management/screens/DMPerformanceKPI';
import { DMPaymentIncentive } from '@/components/developer-management/screens/DMPaymentIncentive';
import { DMComplianceNDA } from '@/components/developer-management/screens/DMComplianceNDA';
import { DMSecurityAccess } from '@/components/developer-management/screens/DMSecurityAccess';
import { DMAlertsEscalation } from '@/components/developer-management/screens/DMAlertsEscalation';
import { DMAuditLogs } from '@/components/developer-management/screens/DMAuditLogs';
import { DMSettings } from '@/components/developer-management/screens/DMSettings';

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
      { id: 'tasks', label: 'Active Tasks', icon: ListTodo, badge: 12 },
      { id: 'risks', label: 'SLA Risks', icon: AlertTriangle, badge: 3 },
      { id: 'blocked', label: 'Blocked Tasks', icon: AlertOctagon, badge: 2 },
      { id: 'escalations', label: 'Escalations', icon: ArrowUpRight, badge: 2 },
      { id: 'comms', label: 'Internal Notes', icon: MessageSquare },
    ],
  },
  {
    title: 'People & Skills',
    items: [
      { id: 'developer_registry', label: 'Developer Registry', icon: Users },
      { id: 'onboarding_requests', label: 'Onboarding Requests', icon: UserPlus, badge: 3 },
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
  const { signOut } = useAuth();
  useDevManagerGuard();
  const [active, setActive] = useState('capacity');
  const [sessionTime, setSessionTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSessionTime((p) => p + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (sessionTime === 1800) {
      toast({
        title: 'Session Warning',
        description: 'Session will expire in 5 minutes',
        variant: 'destructive',
      });
    }
  }, [sessionTime, toast]);

  const handleLogout = async () => {
    await signOut();
    navigate({ to: '/auth' });
  };

  const formatSessionTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const title =
    GROUPS.flatMap((g) => g.items).find((i) => i.id === active)?.label ?? 'Developer Manager';

  return (
    <UnifiedShell
      brandTitle="Dev Manager"
      brandSubtitle="Delivery Governor"
      brandIcon={Code2}
      groups={GROUPS}
      activeId={active}
      onSelect={setActive}
      topbarTitle={title}
      onBack={() => navigate({ to: '/' })}
      backLabel="Back to Dashboard"
      onLogout={handleLogout}
      topbarRight={
        <>
          <Badge variant="outline" className="font-mono text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {formatSessionTime(sessionTime)}
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
      {active !== 'capacity' && (
        <div className="mb-4 grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { icon: Users, label: 'Developers', value: 4 },
            { icon: ListTodo, label: 'Active Tasks', value: 12 },
            { icon: AlertTriangle, label: 'At Risk', value: 3 },
            { icon: AlertOctagon, label: 'Blocked', value: 2 },
            { icon: ArrowUpRight, label: 'Escalations', value: 2 },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-card/60 px-4 py-3 flex items-center gap-3"
            >
              <s.icon className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-lg font-mono font-bold leading-none">{s.value}</p>
                <p className="text-[11px] text-muted-foreground truncate">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}


      {SCREENS[active]}
    </UnifiedShell>
  );
}
