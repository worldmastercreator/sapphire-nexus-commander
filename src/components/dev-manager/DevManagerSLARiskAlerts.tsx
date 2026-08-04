import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, TrendingUp, Bell, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDeliveryOverview, useEscalateTask } from '@/hooks/useDevManagerData';
import type { SLARiskDTO } from '@/lib/dev-manager.types';

const getRiskColor = (level: SLARiskDTO['riskLevel']) => {
  switch (level) {
    case 'critical': return 'border-red-500/50 bg-red-500/10';
    case 'high': return 'border-amber-500/50 bg-amber-500/10';
    default: return 'border-yellow-500/50 bg-yellow-500/10';
  }
};

const getRiskBadgeColor = (level: SLARiskDTO['riskLevel']) => {
  switch (level) {
    case 'critical': return 'bg-red-500/20 text-red-400';
    case 'high': return 'bg-amber-500/20 text-amber-400';
    default: return 'bg-yellow-500/20 text-yellow-400';
  }
};

export default function DevManagerSLARiskAlerts() {
  const { data, isLoading, error } = useDeliveryOverview();
  const escalate = useEscalateTask();
  const risks = data?.risks ?? [];

  const handleEscalate = (risk: SLARiskDTO) => {
    escalate.mutate({
      taskId: risk.taskId,
      reason: `Manual escalation: ${risk.code} has ${risk.hoursRemaining}h left (${risk.riskLevel} risk)`,
    });
  };

  const criticalCount = risks.filter(r => r.riskLevel === 'critical').length;
  const highCount = risks.filter(r => r.riskLevel === 'high').length;

  return (
    <div className="space-y-4">
      {/* Risk Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-mono font-bold text-red-400">{criticalCount}</p>
            <p className="text-xs text-red-400/70">CRITICAL</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-mono font-bold text-amber-400">{highCount}</p>
            <p className="text-xs text-amber-400/70">HIGH RISK</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-mono font-bold text-yellow-400">
              {risks.length - criticalCount - highCount}
            </p>
            <p className="text-xs text-yellow-400/70">MODERATE</p>
          </CardContent>
        </Card>
      </div>

      {/* Risk List */}
      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-mono tracking-wider text-muted-foreground flex items-center gap-2">
            <Bell className="w-4 h-4" />
            SLA RISK ALERTS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <p className="text-sm text-muted-foreground font-mono">Loading SLA data…</p>}
          {error && (
            <p className="text-sm text-red-400 font-mono">
              {error instanceof Error ? error.message : 'Failed to load SLA risks'}
            </p>
          )}
          {risks.map((risk, idx) => (
            <motion.div
              key={risk.taskId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-4 rounded-lg border ${getRiskColor(risk.riskLevel)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs">{risk.code}</span>
                    <Badge className={`text-xs ${getRiskBadgeColor(risk.riskLevel)}`}>
                      {risk.riskLevel.toUpperCase()}
                    </Badge>
                    {risk.promiseId && (
                      <Badge variant="outline" className="text-xs font-mono border-purple-500/30 text-purple-400">
                        {risk.promiseId}
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-medium">{risk.title}</h4>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="w-3.5 h-3.5" />
                    <span className={risk.hoursRemaining <= 4 ? 'text-red-400 font-bold' : 'text-muted-foreground'}>
                      {risk.hoursRemaining}h left
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground font-mono">{risk.assignee}</span>

                {!risk.escalatedAt && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-1 text-xs"
                    disabled={escalate.isPending}
                    onClick={() => handleEscalate(risk)}
                  >
                    <ArrowUpRight className="w-3 h-3" />
                    Escalate Now
                  </Button>
                )}

                {risk.escalatedAt && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Escalated {new Date(risk.escalatedAt).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            </motion.div>
          ))}

          {!isLoading && !error && risks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No SLA risks detected</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
