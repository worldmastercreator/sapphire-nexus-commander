import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, User, ArrowRight, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useDeliveryOverview, useReassignTask } from '@/hooks/useDevManagerData';
import type { TaskDTO } from '@/lib/dev-manager.types';

const getPriorityColor = (priority: TaskDTO['priority']) => {
  switch (priority) {
    case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'high': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'medium': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    default: return 'bg-muted/40 text-muted-foreground border-border';
  }
};

const getStatusColor = (status: TaskDTO['status']) => {
  switch (status) {
    case 'in_progress': return 'bg-blue-500';
    case 'blocked': return 'bg-red-500';
    case 'review': return 'bg-purple-500';
    default: return 'bg-muted-foreground';
  }
};

export default function DevManagerActiveTasksView() {
  const { toast } = useToast();
  const { data, isLoading, error } = useDeliveryOverview();
  const reassign = useReassignTask();
  const [reassignDialog, setReassignDialog] = useState<TaskDTO | null>(null);
  const [newAssignee, setNewAssignee] = useState('');
  const [reassignReason, setReassignReason] = useState('');

  const tasks = data?.tasks ?? [];
  const developers = data?.developers ?? [];

  const handleReassign = async () => {
    if (!reassignDialog) return;
    if (!newAssignee || reassignReason.trim().length < 5) {
      toast({
        title: "Reason Required",
        description: "Select a developer and give a reason (min 5 characters).",
        variant: "destructive"
      });
      return;
    }

    try {
      await reassign.mutateAsync({
        taskId: reassignDialog.id,
        newDeveloperId: newAssignee,
        reason: reassignReason.trim(),
      });
      setReassignDialog(null);
      setNewAssignee('');
      setReassignReason('');
    } catch {
      // failure surfaced by the mutation's error toast
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-mono tracking-wider text-muted-foreground">
              ACTIVE TASKS BY DEVELOPER
            </CardTitle>
            <Badge variant="outline" className="font-mono">
              {tasks.length} Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <p className="text-sm text-muted-foreground font-mono">Loading live tasks…</p>}
          {error && (
            <p className="text-sm text-red-400 font-mono">
              {error instanceof Error ? error.message : 'Failed to load tasks'}
            </p>
          )}
          {tasks.map((task, idx) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 bg-muted/40 rounded-lg border border-border"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-muted-foreground">{task.code}</span>
                    <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </Badge>
                    {task.promiseId && (
                      <Badge variant="outline" className="text-xs font-mono">
                        {task.promiseId}
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-medium">{task.title}</h4>
                </div>
                <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span className="font-mono">{task.assignedTo}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span className={task.slaHoursRemaining <= 4 ? 'text-red-400' : ''}>
                      {task.slaHoursRemaining}h remaining
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1 text-xs"
                  onClick={() => setReassignDialog(task)}
                >
                  <RefreshCw className="w-3 h-3" />
                  Reassign
                </Button>
              </div>

              {task.slaHoursRemaining <= 4 && (
                <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded flex items-center gap-2 text-xs text-red-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  SLA at risk - escalation may be required
                </div>
              )}
            </motion.div>
          ))}
          {!isLoading && !error && tasks.length === 0 && (
            <p className="text-sm text-muted-foreground">No active tasks.</p>
          )}
        </CardContent>
      </Card>

      {/* Reassign Dialog */}
      <Dialog open={!!reassignDialog} onOpenChange={() => setReassignDialog(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-mono">
              Reassign Task {reassignDialog?.code}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted/40 rounded-lg">
              <p className="text-sm text-muted-foreground">Current Assignee</p>
              <p className="font-mono">{reassignDialog?.assignedTo}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">New Assignee</label>
              <Select value={newAssignee} onValueChange={setNewAssignee}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Select developer" />
                </SelectTrigger>
                <SelectContent className="bg-muted border-border">
                  {developers
                    .filter(d => d.id !== reassignDialog?.developerId)
                    .map(dev => (
                      <SelectItem key={dev.id} value={dev.id} className="font-mono">
                        {dev.valaId} — {dev.activeTasks}/{dev.maxCapacity}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                Reason <span className="text-red-400">*</span>
              </label>
              <Textarea
                value={reassignReason}
                onChange={(e) => setReassignReason(e.target.value)}
                placeholder="Mandatory: Explain why this task is being reassigned..."
                className="bg-muted border-border min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setReassignDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleReassign} disabled={reassign.isPending} className="gap-2">
              <ArrowRight className="w-4 h-4" />
              {reassign.isPending ? 'Saving…' : 'Confirm Reassignment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
