type FunnelStage = {
  label: string;
  value: number;
  percentage?: number;
  color: string;
};

type FunnelChartProps = {
  stages: FunnelStage[];
  className?: string;
};

export function FunnelChart({ stages, className = "" }: FunnelChartProps) {
  const maxValue = Math.max(...stages.map((s) => s.value), 1);

  return (
    <div className={`space-y-4 ${className}`}>
      {stages.map((stage, i) => {
        const widthPercent = (stage.value / maxValue) * 100;
        const nextStage = stages[i + 1];
        const conversionRate = nextStage && stage.value > 0
          ? ((nextStage.value / stage.value) * 100).toFixed(1)
          : null;

        return (
          <div key={stage.label} className="relative">
            <div className="flex items-center gap-4">
              <div className="relative h-16 flex-1 overflow-hidden rounded-xl">
                <div
                  className={`absolute inset-y-0 left-0 flex items-center rounded-xl ${stage.color}`}
                  style={{ width: `${Math.max(widthPercent, 10)}%` }}
                >
                  <div className="flex w-full items-center justify-between px-4">
                    <div>
                      <p className="text-sm font-medium text-white">{stage.label}</p>
                      <p className="text-lg font-bold text-white">
                        {stage.value.toLocaleString()}
                      </p>
                    </div>
                    {stage.percentage !== undefined && (
                      <p className="text-sm text-white/70">
                        {stage.percentage.toFixed(1)}% of registered
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {conversionRate && (
              <div className="absolute -bottom-3 right-0 flex items-center gap-1 text-xs text-slate-400">
                <span>{conversionRate}%</span>
                <span className="text-slate-600">→ next stage</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

type VerticalFunnelProps = {
  registered: number;
  activated: number;
  paid: number;
};

export function VerticalFunnel({ registered, activated, paid }: VerticalFunnelProps) {
  const regToAct = registered > 0 ? ((activated / registered) * 100).toFixed(1) : "0";
  const actToPaid = activated > 0 ? ((paid / activated) * 100).toFixed(1) : "0";
  const regToActPct = registered > 0 ? (activated / registered) * 100 : 0;
  const paidOfReg = registered > 0 ? (paid / registered) * 100 : 0;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Registered */}
      <div className="relative w-full max-w-sm">
        <div className="flex h-20 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 shadow-lg shadow-violet-500/20">
          <div className="text-center">
            <p className="text-sm font-medium text-violet-100">Registered</p>
            <p className="text-2xl font-bold text-white">{registered.toLocaleString()}</p>
            <p className="text-xs text-violet-200">100% of total</p>
          </div>
        </div>
      </div>

      {/* Arrow with conversion rate */}
      <div className="flex items-center gap-2 py-1 text-sm text-slate-400">
        <span className="text-lg font-semibold text-emerald-400">{regToAct}%</span>
        <span>convert to next stage</span>
      </div>

      {/* Activated */}
      <div className="relative w-full max-w-xs">
        <div className="flex h-20 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-lg shadow-emerald-500/20">
          <div className="text-center">
            <p className="text-sm font-medium text-emerald-100">Activated (first file)</p>
            <p className="text-2xl font-bold text-white">{activated.toLocaleString()}</p>
            <p className="text-xs text-emerald-200">{regToActPct.toFixed(1)}% of registered</p>
          </div>
        </div>
      </div>

      {/* Arrow with conversion rate */}
      <div className="flex items-center gap-2 py-1 text-sm text-slate-400">
        <span className="text-lg font-semibold text-cyan-400">{actToPaid}%</span>
        <span>convert to next stage</span>
      </div>

      {/* Paid Pro */}
      <div className="relative w-full max-w-[220px]">
        <div className="flex h-20 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-600 to-cyan-500 shadow-lg shadow-cyan-500/20">
          <div className="text-center">
            <p className="text-sm font-medium text-cyan-100">Paid Pro $9</p>
            <p className="text-2xl font-bold text-white">{paid.toLocaleString()}</p>
            <p className="text-xs text-cyan-200">{paidOfReg.toFixed(1)}% of registered</p>
          </div>
        </div>
      </div>
    </div>
  );
}
