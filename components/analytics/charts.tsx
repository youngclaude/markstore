type DataPoint = {
  label: string;
  value: number;
};

type LineChartProps = {
  data: DataPoint[];
  color?: string;
  height?: number;
  showLabels?: boolean;
  showValues?: boolean;
};

export function LineChart({
  data,
  color = "#10b981",
  height = 200,
  showLabels = true,
  showValues = false,
}: LineChartProps) {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const minValue = Math.min(...data.map((d) => d.value), 0);
  const range = maxValue - minValue || 1;

  const points = data.map((d, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * 100;
    const y = ((d.value - minValue) / range) * 100;
    return { x, y: 100 - y, ...d };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaPathD = `${pathD} L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z`;

  return (
    <div className="relative" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
        {/* Area fill */}
        <path
          d={areaPathD}
          fill={`${color}15`}
          stroke="none"
        />
        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {/* Points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="1"
            fill={color}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      {showLabels && (
        <div className="mt-2 flex justify-between text-[10px] text-slate-500">
          <span>{data[0]?.label}</span>
          <span>{data[data.length - 1]?.label}</span>
        </div>
      )}
    </div>
  );
}

type MultiLineChartProps = {
  series: {
    name: string;
    data: DataPoint[];
    color: string;
  }[];
  height?: number;
  showLegend?: boolean;
};

export function MultiLineChart({ series, height = 200, showLegend = true }: MultiLineChartProps) {
  if (series.length === 0 || series[0].data.length === 0) return null;

  const allValues = series.flatMap((s) => s.data.map((d) => d.value));
  const maxValue = Math.max(...allValues, 1);

  return (
    <div>
      <div className="relative" style={{ height }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
          {series.map((s) => {
            const points = s.data.map((d, i) => {
              const x = (i / Math.max(s.data.length - 1, 1)) * 100;
              const y = (d.value / maxValue) * 100;
              return { x, y: 100 - y };
            });

            const pathD = points
              .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
              .join(" ");

            return (
              <path
                key={s.name}
                d={pathD}
                fill="none"
                stroke={s.color}
                strokeWidth="0.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>
        <div className="mt-2 flex justify-between text-[10px] text-slate-500">
          <span>{series[0].data[0]?.label}</span>
          <span>{series[0].data[series[0].data.length - 1]?.label}</span>
        </div>
      </div>
      {showLegend && (
        <div className="mt-3 flex flex-wrap gap-4">
          {series.map((s) => (
            <div key={s.name} className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-xs text-slate-400">{s.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type BarChartProps = {
  data: DataPoint[];
  color?: string;
  height?: number;
  showLabels?: boolean;
  showValues?: boolean;
  horizontal?: boolean;
};

export function BarChart({
  data,
  color = "#3b82f6",
  height = 200,
  showLabels = true,
  showValues = true,
  horizontal = false,
}: BarChartProps) {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  if (horizontal) {
    return (
      <div className="space-y-3">
        {data.map((d) => {
          const width = (d.value / maxValue) * 100;
          return (
            <div key={d.label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-slate-300">{d.label}</span>
                {showValues && (
                  <span className="font-medium text-slate-100">
                    {d.value.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="h-8 overflow-hidden rounded-lg bg-slate-800/50">
                <div
                  className="flex h-full items-center rounded-lg transition-all duration-500"
                  style={{ width: `${Math.max(width, 2)}%`, backgroundColor: color }}
                >
                  {width > 20 && showValues && (
                    <span className="px-2 text-xs font-medium text-white">
                      {d.value.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const barWidth = 100 / data.length;
  const barPadding = barWidth * 0.2;

  return (
    <div>
      <div className="relative" style={{ height }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
          {data.map((d, i) => {
            const barHeight = (d.value / maxValue) * 100;
            const x = i * barWidth + barPadding / 2;
            const y = 100 - barHeight;
            const width = barWidth - barPadding;

            return (
              <g key={d.label}>
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={barHeight}
                  fill={color}
                  rx="1"
                />
              </g>
            );
          })}
        </svg>
      </div>
      {showLabels && (
        <div className="mt-2 flex justify-between">
          {data.length <= 10 ? (
            data.map((d) => (
              <span key={d.label} className="text-[10px] text-slate-500">
                {d.label}
              </span>
            ))
          ) : (
            <>
              <span className="text-[10px] text-slate-500">{data[0]?.label}</span>
              <span className="text-[10px] text-slate-500">{data[data.length - 1]?.label}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

type StackedBarChartProps = {
  data: {
    label: string;
    values: { name: string; value: number; color: string }[];
  }[];
  height?: number;
  showLegend?: boolean;
};

export function StackedBarChart({ data, height = 200, showLegend = true }: StackedBarChartProps) {
  if (data.length === 0) return null;

  const maxTotal = Math.max(
    ...data.map((d) => d.values.reduce((sum, v) => sum + v.value, 0)),
    1
  );

  const barWidth = 100 / data.length;
  const barPadding = barWidth * 0.3;

  const allCategories = data[0]?.values.map((v) => ({ name: v.name, color: v.color })) || [];

  return (
    <div>
      <div className="relative" style={{ height }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
          {data.map((d, i) => {
            const x = i * barWidth + barPadding / 2;
            const width = barWidth - barPadding;
            let currentY = 100;

            return (
              <g key={d.label}>
                {d.values.map((v) => {
                  const barHeight = (v.value / maxTotal) * 100;
                  currentY -= barHeight;
                  return (
                    <rect
                      key={v.name}
                      x={x}
                      y={currentY}
                      width={width}
                      height={barHeight}
                      fill={v.color}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-slate-500">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
      {showLegend && (
        <div className="mt-3 flex flex-wrap gap-4">
          {allCategories.map((c) => (
            <div key={c.name} className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: c.color }}
              />
              <span className="text-xs text-slate-400">{c.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type PieChartProps = {
  data: { label: string; value: number; color: string }[];
  size?: number;
  showLegend?: boolean;
};

export function PieChart({ data, size = 200, showLegend = true }: PieChartProps) {
  if (data.length === 0) return null;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;

  let currentAngle = -90;
  const radius = 40;
  const cx = 50;
  const cy = 50;

  const slices = data.map((d) => {
    const percentage = d.value / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const pathD = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return { ...d, pathD, percentage };
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {slices.map((slice) => (
          <path key={slice.label} d={slice.pathD} fill={slice.color} />
        ))}
        {/* Center hole for donut effect */}
        <circle cx={cx} cy={cy} r={20} fill="#0B0E14" />
        {/* Center text */}
        <text
          x={cx}
          y={cy - 3}
          textAnchor="middle"
          className="fill-slate-400 text-[6px]"
        >
          Total
        </text>
        <text
          x={cx}
          y={cy + 5}
          textAnchor="middle"
          className="fill-slate-100 text-[8px] font-semibold"
        >
          {total.toLocaleString()}
        </text>
      </svg>
      {showLegend && (
        <div className="space-y-2">
          {slices.map((slice) => (
            <div key={slice.label} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-sm text-slate-300">{slice.label}</span>
              <span className="text-sm font-medium text-slate-100">
                {slice.value.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500">
                {(slice.percentage * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type SparklineProps = {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
};

export function Sparkline({ data, color = "#10b981", width = 80, height = 24 }: SparklineProps) {
  if (data.length < 2) return null;

  const maxValue = Math.max(...data, 1);
  const minValue = Math.min(...data, 0);
  const range = maxValue - minValue || 1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - minValue) / range) * height;
    return `${x},${y}`;
  });

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
