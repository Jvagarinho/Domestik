import { useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useI18n } from '../i18n';
import type { Service } from '../types';

interface DashboardAdvancedProps {
  services: Service[];
}

// Simple helpers to aggregate monthly totals by year
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

// helper removed: not used

// Lightweight line chart (SVG) for one or two series
function LineChart({ series, labels, height = 180, colors, axisLabel }: { series: number[][]; labels: string[]; height?: number; colors: string[]; axisLabel?: string; }) {
  const width = 1000;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 10;
  const paddingBottom = 24;
  const innerW = width - paddingLeft - paddingRight;
  const innerH = height - paddingTop - paddingBottom;
  const maxVal = Math.max(1, ...series.flat());

  const toPoint = (idx: number, val: number) => {
    const x = paddingLeft + (idx / (12 - 1)) * innerW;
    const y = height - paddingBottom - (val / maxVal) * innerH;
    return `${x},${y}`;
  };

  // Build path for each series
  const paths = series.map((s) => {
    const d = s.map((v, idx) => (idx === 0 ? 'M' : 'L') + toPoint(idx, v)).join(' ');
    return d;
  });

  const months = labels;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" aria-label="Evolução mensal">
      {/* grid lines */}
      {Array.from({ length: 4 }).map((_, i) => {
        const y = paddingTop + (i / 3) * innerH;
        return <line key={i} x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#eee" strokeWidth={1} />;
      })}
      {/* axes */}
      <line x1={paddingLeft} y1={height - paddingBottom} x2={width - paddingRight} y2={height - paddingBottom} stroke="#333" strokeWidth={1} />
      {/* series paths */}
      {paths.map((p, idx) => (
        <path key={idx} d={p} fill="none" stroke={colors[idx] || '#111'} strokeWidth={2} />
      ))}
      {/* x labels */}
      {months.map((m, i) => (
        <text key={i} x={paddingLeft + (i / (12 - 1)) * innerW} y={height - 4} fontSize={10} textAnchor="middle" fill="#666">{m.substring(0,3)}</text>
      ))}
      {axisLabel && (
        <text x={paddingLeft} y={height - 2} fontSize={11} textAnchor="start" fill="#555">{axisLabel}</text>
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

  // Build month labels in current language
  const monthLabels = Array.from({ length: 12 }).map((_, i) => {
    const d = new Date(currentYear, i, 1);
    const locale = language === 'pt' ? ptBR : undefined;
    const raw = format(d, 'MMMM', { locale: locale as any });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  });

  // MoM delta (current year)
  const momDelta = currTotals.map((v, i) => (i === 0 ? 0 : v - currTotals[i - 1]));
  const maxAbsDelta = Math.max(1, ...momDelta.map(Math.abs));

  const widthMoM = 1000;
  const heightMoM = 180;
  const paddingLeftMoM = 40;
  const innerWMoM = widthMoM - paddingLeftMoM - 20;
  const baseY = heightMoM - 10;

  const thisYearLabel = language === 'pt' ? 'Este Ano' : 'This Year';
  const prevYearLabel = language === 'pt' ? 'Ano Passado' : 'Last Year';
  const momLabel = language === 'pt' ? 'Variação Mensal (MoM)' : 'Month-over-Month Change';
  const axisLeft = language === 'pt' ? 'Valor' : 'Value';
  const axisLeftMoM = language === 'pt' ? 'Variação MoM' : 'MoM Change';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        <div className="card" style={{ padding: '12px' }}>
        <h4 style={{ margin: '0 0 8px', fontSize: '1rem' }}>{language === 'pt' ? 'Evolução Mensal' : 'Monthly Evolution'}</h4>
        <div style={{ overflowX: 'auto' }}>
          <LineChart
            series={ [currTotals, prevTotals] }
            labels={monthLabels}
            height={180}
            colors={[ '#10B981', '#3B82F6' ]}
            axisLabel={axisLeft}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '6px', fontSize: '12px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 12, height: 6, background: '#10B981', display: 'inline-block' }} />
            {thisYearLabel}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 12, height: 6, background: '#3B82F6', display: 'inline-block' }} />
            {prevYearLabel}
          </span>
        </div>
      </div>
      <div className="card" style={{ padding: '12px' }}>
        <h4 style={{ margin: '0 0 8px', fontSize: '1rem' }}>{momLabel}</h4>
        <svg width={widthMoM} height={heightMoM} role="img" aria-label="MoM changes">
          {momDelta.map((d, i) => {
            const barW = innerWMoM / 12 - 6;
            const x = paddingLeftMoM + i * (innerWMoM / 12) + 3;
            const h = Math.abs(d) / maxAbsDelta * (heightMoM - 40);
            const y = d >= 0 ? baseY - h : baseY;
            const color = d >= 0 ? '#10B981' : '#EF4444';
            return (
              <rect key={i} x={x} y={y} width={barW} height={d === 0 ? 0 : h} fill={color} />
            );
          })}
          <line x1={paddingLeftMoM} y1={baseY} x2={widthMoM - 20} y2={baseY} stroke="#333" strokeWidth={1} />
          {/* MoM axis label */}
          <text x={10} y={heightMoM / 2} transform={`rotate(-90 10 ${heightMoM / 2})`} fontSize={12} fill="#555">{axisLeftMoM}</text>
        </svg>
      </div>
    </div>
  );
}

export default DashboardAdvanced;
