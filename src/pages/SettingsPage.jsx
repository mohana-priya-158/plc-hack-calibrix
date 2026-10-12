import { useState } from 'react';
import { Database, RotateCcw, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, Card, PageHeader } from '../components/ui';

export default function SettingsPage() {
  const { settings, setSettings, challenges, clearPrograms, resetDemo, savedCount } = useApp();
  const [note, setNote] = useState('');
  const confirmDo = (text, fn, done) => { if (window.confirm(text)) { fn(); setNote(done); } };

  return (
    <>
      <PageHeader title="Settings" subtitle="Preferences are stored in this browser (localStorage)." />
      <div className="grid max-w-3xl gap-4">
        <Card className="space-y-4 p-5">
          <h2 className="font-semibold">Simulation &amp; workspace</h2>
          <div><label className="mb-1 block text-sm font-medium">Simulation speed</label>
            <select className="input max-w-xs" value={settings.speed} onChange={(e) => setSettings({ speed: Number(e.target.value) })}>
              <option value={200}>Fast (200 ms/scan)</option><option value={500}>Normal (500 ms/scan)</option><option value={1000}>Slow (1 s/scan)</option><option value={2000}>Very slow (2 s/scan)</option>
            </select></div>
          <div><label className="mb-1 block text-sm font-medium">Default challenge on first load</label>
            <select className="input max-w-xs" value={settings.defaultChallenge} onChange={(e) => setSettings({ defaultChallenge: e.target.value })}>
              {challenges.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={settings.autosave} onChange={(e) => setSettings({ autosave: e.target.checked })} /> Auto-save ladder program after every edit</label>
          <p className="text-xs text-slate-400">Theme selection is not included in this version (light theme only).</p>
        </Card>
        <Card className="space-y-3 p-5">
          <h2 className="font-semibold">Data</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="danger" icon={Trash2} onClick={() => confirmDo('Delete all locally saved programs?', clearPrograms, 'Saved programs cleared.')}>Clear saved programs ({savedCount()})</Button>
            <Button variant="outline" icon={RotateCcw} onClick={() => confirmDo('Reset demo data (history, test results, simulator)?', resetDemo, 'Demonstration data reset.')}>Reset demonstration data</Button>
          </div>
          {note && <p className="flex items-center gap-2 text-sm text-green-700"><Database size={14} />{note}</p>}
        </Card>
      </div>
    </>
  );
}
