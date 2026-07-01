import { useState } from 'react';
import { Save, Download, Check, AlertCircle } from 'lucide-react';
import { exportData } from '../utils/exportData';

const S = {
  surface: { background: '#0f1626', border: '1px solid rgba(255,255,255,0.07)' },
  input: {
    background: '#182035', border: '1px solid rgba(255,255,255,0.1)',
    color: '#f1f5f9', borderRadius: 12, padding: '10px 14px', width: '100%',
    fontSize: 15, outline: 'none', fontFamily: 'inherit',
  },
};

function useLocalStorageState(key, defaultVal) {
  const [val, setVal] = useState(() => localStorage.getItem(key) || defaultVal);
  const save = (v) => { setVal(v); localStorage.setItem(key, v); };
  return [val, save];
}

export default function SettingsTab() {
  const [url,     setUrl]     = useLocalStorageState('datasafe_url',     '');
  const [apiKey,  setApiKey]  = useLocalStorageState('datasafe_apiKey',  '');
  const [appName, setAppName] = useLocalStorageState('datasafe_appName', '');
  const [status, setStatus]   = useState(null); // null | 'loading' | 'ok' | 'local' | 'error'
  const [detail, setDetail]   = useState('');

  const configured = url.trim() && apiKey.trim() && appName.trim();

  const handleExport = async () => {
    setStatus('loading');
    setDetail('');
    try {
      const result = await exportData();
      if (result.mode === 'datasafe') {
        setStatus('ok');
        setDetail(`Sauvegardé · version ${result.versions}`);
      } else {
        setStatus('local');
        setDetail('Fichier téléchargé');
      }
    } catch {
      setStatus('error');
      setDetail('Erreur inattendue');
    }
    setTimeout(() => setStatus(null), 4000);
  };

  return (
    <div className="tab-content page-transition">
      <div className="px-4 pt-5 pb-6 space-y-5">
        <h1 className="text-2xl font-bold gradient-text" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Paramètres
        </h1>

        {/* DataSafe config */}
        <div className="rounded-2xl p-4 space-y-4" style={S.surface}>
          <div>
            <p className="text-sm font-semibold mb-0.5" style={{ color: '#f1f5f9', fontFamily: "'Space Grotesk', sans-serif" }}>
              DataSafe
            </p>
            <p className="text-xs" style={{ color: '#64748b' }}>
              Sauvegarde chiffrée vers votre instance PRP. Laissez vide pour un export local.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: '#94a3b8' }}>URL DataSafe</label>
              <input
                style={S.input}
                placeholder="https://mon-prp.exemple.com/api/data-safe/ingest"
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: '#94a3b8' }}>Clé API</label>
              <input
                style={S.input}
                type="password"
                placeholder="sk-…"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: '#94a3b8' }}>Nom de l'app</label>
              <input
                style={S.input}
                placeholder="catdex"
                value={appName}
                onChange={e => setAppName(e.target.value)}
              />
            </div>
          </div>

          {configured && (
            <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <Check size={14} color="#34d399" />
              <span className="text-xs" style={{ color: '#34d399' }}>DataSafe configuré — la sauvegarde sera envoyée en ligne</span>
            </div>
          )}
        </div>

        {/* Export button */}
        <button
          onClick={handleExport}
          disabled={status === 'loading'}
          className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            background: status === 'ok'
              ? 'rgba(52,211,153,0.15)'
              : status === 'error'
              ? 'rgba(239,68,68,0.15)'
              : 'linear-gradient(135deg, #f59e0b, #f97316)',
            color: status === 'ok' ? '#34d399' : status === 'error' ? '#f87171' : '#fff',
            border: status === 'ok'
              ? '1px solid rgba(52,211,153,0.3)'
              : status === 'error'
              ? '1px solid rgba(239,68,68,0.3)'
              : 'none',
            boxShadow: !status ? '0 4px 24px rgba(245,158,11,0.35)' : 'none',
            opacity: status === 'loading' ? 0.7 : 1,
          }}
        >
          {status === 'loading' && (
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
          )}
          {status === 'ok' && <Check size={18} />}
          {status === 'local' && <Download size={18} />}
          {status === 'error' && <AlertCircle size={18} />}
          {(!status || status === 'loading') && (configured ? <Save size={18} /> : <Download size={18} />)}

          {status === 'ok'    ? detail
          : status === 'local' ? detail
          : status === 'error' ? detail
          : status === 'loading' ? 'Sauvegarde…'
          : configured ? 'Sauvegarder sur DataSafe'
          : 'Exporter en local (JSON)'}
        </button>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        <p className="text-xs text-center" style={{ color: '#475569' }}>
          {configured
            ? 'En cas d\'erreur réseau, le fichier JSON sera téléchargé localement.'
            : 'Configurez DataSafe pour sauvegarder vos données en ligne.'}
        </p>
      </div>
    </div>
  );
}
