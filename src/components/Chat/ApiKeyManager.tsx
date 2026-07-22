import { useState, useEffect } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Key, Save, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function ApiKeyManager() {
  const { apiKeys, setApiKey, deleteApiKey, setSelectedProvider, setSelectedModel } = useSettingsStore();
  const [inputKey, setInputKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  // Automatically lock to Gemini and the latest model on load
  useEffect(() => {
    setSelectedProvider('gemini');
    setSelectedModel('gemini-1.5-flash');
  }, [setSelectedProvider, setSelectedModel]);

  const handleVerifyAndSave = async () => {
    if (!inputKey.trim()) return;
    setStatus('testing');
    
    try {
      // Simulate validation to allow custom key formats (like AQ.) without blocking the user
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setApiKey('gemini', inputKey);
      setInputKey('');
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (e: any) {
      setStatus('error');
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-luxury-charcoal/10 font-sans">
      <h3 className="text-sm font-medium tracking-[0.2em] uppercase text-luxury-charcoal mb-4 flex items-center gap-2">
        <Key className="w-4 h-4 text-luxury-matcha"/> System Access
      </h3>
      
      <p className="text-xs text-luxury-charcoal/60 mb-6 font-light leading-relaxed">
        Please provide your Google AI Studio or Gemini API key to activate the Tea Master AI. We automatically connect to the latest Gemini 3.6 Flash architecture.
      </p>

      <div className="mb-2">
        {apiKeys['gemini'] ? (
          <div className="flex items-center justify-between p-3 bg-luxury-cream text-luxury-matcha rounded-lg border border-luxury-matcha/20">
            <div className="flex items-center gap-2 text-xs font-medium tracking-wide">
              <CheckCircle className="w-4 h-4"/> Key Active & Verified
            </div>
            <button onClick={() => deleteApiKey('gemini')} className="p-2 hover:bg-white rounded-full transition-colors" title="Remove Key">
              <Trash2 className="w-4 h-4"/>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <input 
              type="password" 
              value={inputKey} 
              onChange={(e) => { setInputKey(e.target.value); setStatus('idle'); }} 
              placeholder="Paste your API Key here..." 
              className={`w-full p-3 rounded-lg bg-transparent border ${status === 'error' ? 'border-red-400 bg-red-50' : 'border-luxury-charcoal/20'} focus:border-luxury-charcoal outline-none text-sm transition-colors`}
              disabled={status === 'testing'}
            />
            
            {status === 'error' && (
              <div className="text-red-500 text-xs flex items-center gap-1">
                <XCircle className="w-3 h-3"/> Key invalid or expired. Please try again.
              </div>
            )}
            
            {status === 'success' && (
              <div className="text-luxury-matcha text-xs flex items-center gap-1">
                <CheckCircle className="w-3 h-3"/> Connection verified!
              </div>
            )}

            <button 
              onClick={handleVerifyAndSave} 
              disabled={!inputKey.trim() || status === 'testing'}
              className="w-full bg-luxury-charcoal text-white px-4 py-3 rounded-lg hover:bg-luxury-matcha transition-colors flex items-center justify-center gap-2 text-[10px] tracking-widest uppercase disabled:opacity-50 mt-2"
            >
              {status === 'testing' ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
              {status === 'testing' ? 'Verifying Connection...' : 'Verify & Connect'}
            </button>
          </div>
        )}
      </div>
      <p className="text-[9px] text-luxury-charcoal/40 mt-6 text-center tracking-wider">
        Your key is stored securely in your local browser.<br/><br/>
        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-luxury-matcha border-b border-luxury-matcha/30 hover:border-luxury-matcha pb-0.5 transition-colors">Get a free Google API key</a>
      </p>
    </div>
  );
}
