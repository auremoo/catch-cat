import { BookOpen, Camera, Map, BarChart2, Settings } from 'lucide-react';

const TABS = [
  { id: 'catdex',   icon: BookOpen,  label: 'CatDex' },
  { id: 'capture',  icon: Camera,    label: 'Capturer', special: true },
  { id: 'map',      icon: Map,       label: 'Carte' },
  { id: 'stats',    icon: BarChart2, label: 'Stats' },
  { id: 'settings', icon: Settings,  label: 'Réglages' },
];

export default function Navigation({ active, onChange }) {
  return (
    <nav
      className="flex-shrink-0 safe-bottom"
      style={{ background: 'rgba(7,9,15,0.97)', borderTop: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}
    >
      <div className="flex items-center justify-around px-1 py-2">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = active === tab.id;

          if (tab.special) {
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className="flex flex-col items-center gap-1"
                style={{ marginTop: -20 }}
              >
                <div
                  style={{
                    background: isActive
                      ? 'linear-gradient(135deg, #f59e0b, #f97316)'
                      : 'linear-gradient(135deg, #b45309, #c2410c)',
                    boxShadow: isActive ? '0 0 28px rgba(245,158,11,0.5)' : '0 4px 16px rgba(0,0,0,0.6)',
                    transition: 'box-shadow 0.25s, background 0.25s',
                    width: 56, height: 56, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Icon size={24} color="white" strokeWidth={2} />
                </div>
                <span style={{ color: isActive ? '#f59e0b' : '#64748b', fontSize: 10 }}>{tab.label}</span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex flex-col items-center gap-1 py-1"
              style={{ minWidth: 56, transition: 'opacity 0.15s' }}
            >
              <Icon size={22} color={isActive ? '#f59e0b' : '#64748b'} strokeWidth={isActive ? 2.5 : 2} />
              <span style={{ color: isActive ? '#f59e0b' : '#64748b', fontSize: 10 }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
