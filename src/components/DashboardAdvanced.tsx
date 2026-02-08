import { useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useI18n } from '../i18n';
import type { Service } from '../types';

interface DashboardAdvancedProps {
  services: Service[];
}

function aggregateByMonth(services: Service[], year: number): number[] {
  const totals = new Array<number>(12).fill(0);
  services.forEach((s) => {
    const d = new Date(s.date);
    if (d.getFullYear() === year) {
      totals[d.getMonth()] += s.total;
    }
  });
  return totals;
}

function LineChart({ series, labels, height = 220, colors, yAxisLabel, xAxisLabel }: { series: number[][]; labels: string[]; height?: number; colors: string[]; yAxisLabel?: string; xAxisLabel?: string; }) {
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 50;
  const viewBoxWidth = 600;
  const viewBoxHeight = height;
  const innerW = viewBoxWidth - paddingLeft - paddingRight;
  const innerH = viewBoxHeight - paddingTop - paddingBottom;
  const maxVal = Math.max(1, ...series.flat());

  const toPoint = (idx: number, val: number) => {
    const x = paddingLeft + (idx / (12 - 1)) * innerW;
    const y = viewBoxHeight - paddingBottom - (val / maxVal) * innerH;
    return `${x},${y}`;
  };

  const paths = series.map((s) => {
    const d = s.map((v, idx) => (idx === 0 ? 'M' : 'L') + toPoint(idx, v)).join(' ');
    return d;
  });

  const yTicks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} preserveAspectRatio="xMidYMid meet" aria-label="Evolução mensal" style={{ maxWidth: '100%' }}>
      {yTicks.map((tick, i) => {
        const y = viewBoxHeight - paddingBottom - (tick / maxVal) * innerH;
        return (
          <g key={`grid-${i}`}>
            <line x1={paddingLeft} y1={y} x2={viewBoxWidth - paddingRight} y2={y} stroke="#e5e7eb" strokeWidth={1} strokeDasharray="2,2" />
            <text x={paddingLeft - 8} y={y + 4} fontSize={10} textAnchor="end" fill="#6b7280">{Math.round(tick).toLocaleString()}</text>
          </g>
        );
      })}
      <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={viewBoxHeight - paddingBottom} stroke="#374151" strokeWidth={1} />
      <line x1={paddingLeft} y1={viewBoxHeight - paddingBottom} x2={viewBoxWidth - paddingRight} y2={viewBoxHeight - paddingBottom} stroke="#374151" strokeWidth={1} />
      {paths.map((p, idx) => (
        <path key={idx} d={p} fill="none" stroke={colors[idx] || '#111'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {labels.map((m, i) => (
        <text key={i} x={paddingLeft + (i / (12 - 1)) * innerW} y={viewBoxHeight - paddingBottom + 18} fontSize={10} textAnchor="middle" fill="#6b7280">{m.substring(0, 3)}</text>
      ))}
      {yAxisLabel && (
        <text x={15} y={viewBoxHeight / 2} fontSize={11} textAnchor="middle" fill="#4b5563" transform={`rotate(-90, 15, ${viewBoxHeight / 2})`}>{yAxisLabel}</text>
      )}
      {xAxisLabel && (
        <text x={viewBoxWidth / 2} y={viewBoxHeight - 5} fontSize={11} textAnchor="middle" fill="#4b5563">{xAxisLabel}</text>
      )}
    </svg>
  );
}

function MoMChart({ data, labels, height = 200, yAxisLabel }: { data: number[]; labels: string[]; height?: number; yAxisLabel?: string; }) {
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;
  const viewBoxWidth = 600;
  const viewBoxHeight = height;
  const innerW = viewBoxWidth - paddingLeft - paddingRight;
  const innerH = viewBoxHeight - paddingTop - paddingBottom;
  const maxAbsDelta = Math.max(1, ...data.map(Math.abs));
  const baseY = paddingTop + innerH / 2;
  const yTicks = [-maxAbsDelta, -maxAbsDelta * 0.5, 0, maxAbsDelta * 0.5, maxAbsDelta];

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} preserveAspectRatio="xMidYMid meet" aria-label="Variação mensal" style={{ maxWidth: '100%' }}>
      {yTicks.map((tick, i) => {
        const y = baseY - (tick / maxAbsDelta) * (innerH / 2);
        return (
          <g key={`mom-grid-${i}`}>
            <line x1={paddingLeft} y1={y} x2={viewBoxWidth - paddingRight} y2={y} stroke={tick === 0 ? "#374151" : "#e5e7eb"} strokeWidth={tick === 0 ? 1.5 : 1} strokeDasharray={tick === 0 ? undefined : "2,2"} />
            <text x={paddingLeft - 8} y={y + 4} fontSize={10} textAnchor="end" fill="#6b7280">{Math.round(tick).toLocaleString()}</text>
          </g>
        );
      })}
      <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={viewBoxHeight - paddingBottom} stroke="#374151" strokeWidth={1} />
      {data.map((d, i) => {
        const barW = innerW / 12 - 8;
        const x = paddingLeft + i * (innerW / 12) + 4;
        const h = Math.abs(d) / maxAbsDelta * (innerH / 2);
        const y = d >= 0 ? baseY - h : baseY;
        const color = d >= 0 ? '#10B981' : '#EF4444';
        return <rect key={i} x={x} y={d === 0 ? baseY : y} width={barW} height={d === 0 ? 0 : h} fill={color} rx={2} />;
      })}
      {labels.map((m, i) => (
        <text key={i} x={paddingLeft + (i + 0.5) * (innerW / 12)} y={viewBoxHeight - paddingBottom + 16} fontSize={9} textAnchor="middle" fill="#6b7280">{m.substring(0, 3)}</text>
      ))}
      {yAxisLabel && (
        <text x={15} y={viewBoxHeight / 2} fontSize={11} textAnchor="middle" fill="#4b5563" transform={`rotate(-90, 15, ${viewBoxHeight / 2})`}>{yAxisLabel}</text>
      )}
    </svg>
  );
}

export function DashboardAdvanced({ services }: DashboardAdvancedProps) {
  const { language } = useI18n();
  const currentYear = new Date().getFullYear();
  const prevYear = currentYear - 1;
  const currTotals = useMemo(() => aggregateByMonth(services, currentYear), [services, currentYear]);
  const prevTotals = useMemo(() => aggregateByMonth(services, prevYear), [services, prevYear]);
  const monthLabels = Array.from({ length: 12 }).map((_, i) => {
    const d = new Date(currentYear, i, 1);
    const locale = language === 'pt' ? ptBR : undefined;
    const raw = format(d, 'MMMM', { locale });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  });
  
  // Calculate MoM delta, but only for months that have passed or have data
  const now = new Date();
  const currentMonthIndex = now.getMonth();
  const momDelta = currTotals.map((v, i) => {
    if (i === 0) return 0;
    // Only show delta if current month has data or has passed
    if (i > currentMonthIndex && currTotals[i] === 0) return 0;
    return v - currTotals[i - 1];
  });
  const thisYearLabel = language === 'pt' ? 'Este Ano' : 'This Year';
  const prevYearLabel = language === 'pt' ? 'Ano Passado' : 'Last Year';
  const momLabel = language === 'pt' ? 'Variação Mensal (MoM)' : 'Month-over-Month Change';
  const yAxisLabel = language === 'pt' ? 'Ganhos (€)' : 'Earnings ($)';
  const yAxisMoMLabel = language === 'pt' ? 'Variação (€)' : 'Change ($)';
  const xAxisLabel = language === 'pt' ? 'Mês' : 'Month';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
      <div className="card" style={{ padding: '16px' }}>
        <h4 style={{ margin: '0 0 12px', fontSize: '1rem', color: '#1f2937' }}>{language === 'pt' ? 'Evolução Mensal' : 'Monthly Evolution'}</h4>
        <LineChart series={[currTotals, prevTotals]} labels={monthLabels} height={260} colors={['#10B981', '#3B82F6']} yAxisLabel={yAxisLabel} xAxisLabel={xAxisLabel} />
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px', justifyContent: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 12, height: 3, background: '#10B981', display: 'inline-block', borderRadius: '2px' }} />{thisYearLabel}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 12, height: 3, background: '#3B82F6', display: 'inline-block', borderRadius: '2px' }} />{prevYearLabel}
          </span>
        </div>
      </div>
      <div className="card" style={{ padding: '16px' }}>
        <h4 style={{ margin: '0 0 12px', fontSize: '1rem', color: '#1f2937' }}>{momLabel}</h4>
        <MoMChart data={momDelta} labels={monthLabels} height={220} yAxisLabel={yAxisMoMLabel} />
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px', justifyContent: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 12, height: 8, background: '#10B981', display: 'inline-block', borderRadius: '2px' }} />{language === 'pt' ? 'Aumento' : 'Increase'}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 12, height: 8, background: '#EF4444', display: 'inline-block', borderRadius: '2px' }} />{language === 'pt' ? 'Diminuição' : 'Decrease'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default DashboardAdvanced;
