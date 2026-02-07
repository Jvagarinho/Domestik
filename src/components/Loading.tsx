interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  inline?: boolean;
}

const sizeMap = {
  sm: { spinner: 20, border: 3 },
  md: { spinner: 40, border: 4 },
  lg: { spinner: 64, border: 5 },
};

export function Loading({ size = 'md', text, fullScreen = false, inline = false }: LoadingProps) {
  const dimensions = sizeMap[size];

  const spinner = (
    <div
      className="animate-spin"
      style={{
        width: dimensions.spinner,
        height: dimensions.spinner,
        border: `${dimensions.border}px solid var(--primary-mint)`,
        borderTopColor: 'transparent',
        borderRadius: '50%',
      }}
    />
  );

  if (fullScreen) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          background: 'var(--bg-main)',
        }}
      >
        {spinner}
        {text && (
          <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.95rem' }}>
            {text}
          </p>
        )}
      </div>
    );
  }

  if (inline) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        {spinner}
        {text && (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{text}</span>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '24px',
      }}
    >
      {spinner}
      {text && (
        <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>
          {text}
        </p>
      )}
    </div>
  );
}

// Skeleton loading component
interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  count?: number;
}

export function Skeleton({ width = '100%', height = 20, circle = false, count = 1 }: SkeletonProps) {
  const elements = [];
  
  for (let i = 0; i < count; i++) {
    elements.push(
      <div
        key={i}
        style={{
          width,
          height,
          borderRadius: circle ? '50%' : '8px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'skeleton-loading 1.5s ease-in-out infinite',
          marginBottom: i < count - 1 ? '8px' : 0,
        }}
      />
    );
  }

  return (
    <>
      {elements}
      <style>{`
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
}

// Card skeleton for lists
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            padding: '16px',
            background: 'var(--white)',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Skeleton width={40} height={40} circle />
          <div style={{ flex: 1 }}>
            <Skeleton width="60%" height={16} />
            <div style={{ marginTop: '8px' }}>
              <Skeleton width="40%" height={12} />
            </div>
          </div>
          <Skeleton width={60} height={20} />
        </div>
      ))}
    </div>
  );
}

// Dashboard stats skeleton
export function DashboardSkeleton() {
  return (
    <div className="dashboard-grid">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="card"
          style={{
            background: 'var(--white)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <Skeleton width="60%" height={12} />
          <Skeleton width="40%" height={28} />
        </div>
      ))}
    </div>
  );
}
