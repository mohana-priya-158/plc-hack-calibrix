import { Activity, Lightbulb, Pause, Play, RotateCcw, Siren, StepForward, Volume2, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { INPUTS, OUTPUTS } from '../features/simulator/mockPlc';
import { Badge, Button, Card, PageHeader, StatusDot } from '../components/ui';

const ICONS = { motor: Zap, pump: Zap, green: Lightbulb, red: Siren, buzzer: Volume2, running: Activity };
const SPEEDS = [[200, 'Fast (200 ms/scan)'], [500, 'Normal (500 ms/scan)'], [1000, 'Slow (1 s/scan)'], [2000, 'Very slow (2 s/scan)']];

export default function SimulatorPage() {
  const { sim, simApi, settings, setSettings } = useApp();
  const statusTone = { running: 'green', paused: 'amber', stopped: 'slate' }[sim.status];

  return (
    <>
      <PageHeader title="PLC Simulator" subtitle="Virtual control panel. Outputs update on each scan cycle." />
      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
        <strong>Mock PLC:</strong> this panel runs a fixed demonstration model (conveyor latch, tank pump, alarm, object counter). It does not execute your ladder program; a real engine will replace it through <code>plcService.js</code>.
      </div>

      <Card className="mb-4 flex flex-wrap items-center gap-2 p-3">
        <Button icon={Play} onClick={simApi.run} disabled={sim.status === 'running'}>Run</Button>
        <Button variant="outline" icon={Pause} onClick={simApi.pause} disabled={sim.status !== 'running'}>Pause</Button>
        <Button variant="outline" icon={StepForward} onClick={simApi.step}>Step Scan</Button>
        <Button variant="outline" icon={RotateCcw} onClick={simApi.reset}>Reset</Button>
        <select className="input w-auto" value={settings.speed} onChange={(e) => setSettings({ speed: Number(e.target.value) })} aria-label="Simulation speed">
          {SPEEDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <div className="ml-auto flex items-center gap-3 text-sm"><span>Scan <b className="font-mono">#{sim.scan}</b></span><Badge tone={statusTone}>{sim.status.toUpperCase()}</Badge></div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold">Inputs</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {INPUTS.map((i) => {
              const on = sim.inputs[i.key];
              const color = on ? (i.danger ? 'border-red-400 bg-red-50 text-red-700' : 'border-green-400 bg-green-50 text-green-700') : 'border-slate-200 bg-white text-slate-600';
              const common = { className: `flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-sm font-medium select-none ${color}` };
              const body = (<><span><span className="block font-mono text-[11px] opacity-60">{i.addr}</span>{i.label}</span><span className="text-xs font-bold">{i.type === 'push' ? (on ? 'PRESSED' : 'HOLD') : on ? 'ON' : 'OFF'}</span></>);
              return i.type === 'push'
                ? <button key={i.key} {...common} onPointerDown={() => simApi.setInput(i.key, true)} onPointerUp={() => simApi.setInput(i.key, false)} onPointerLeave={() => simApi.setInput(i.key, false)} onPointerCancel={() => simApi.setInput(i.key, false)}>{body}</button>
                : <button key={i.key} {...common} onClick={() => simApi.setInput(i.key, !on)}>{body}</button>;
            })}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold">Outputs</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {OUTPUTS.map((o) => {
              const on = !!sim.outputs[o.key]; const Icon = ICONS[o.key];
              return (
                <div key={o.key} className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${on ? (o.danger ? 'border-red-400 bg-red-50' : 'border-green-400 bg-green-50') : 'border-slate-200 bg-slate-50'}`}>
                  <span className={`grid h-9 w-9 place-items-center rounded-full ${on ? (o.danger ? 'bg-red-500 text-white' : 'bg-green-500 text-white') : 'bg-slate-200 text-slate-400'}`}><Icon size={18} /></span>
                  <div className="text-sm"><div className="font-medium">{o.label}</div><div className="font-mono text-[11px] text-slate-500">{o.addr} · {on ? 'ON' : 'OFF'}</div></div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="mb-2 text-sm font-semibold">Input status</h2>
          <table className="w-full"><tbody className="divide-y divide-slate-100">
            {INPUTS.map((i) => <tr key={i.key}><td className="td font-mono text-xs">{i.addr}</td><td className="td">{i.label}</td><td className="td"><StatusDot on={sim.inputs[i.key]} danger={i.danger} /></td></tr>)}
          </tbody></table>
        </Card>
        <Card className="p-4">
          <h2 className="mb-2 text-sm font-semibold">Output status</h2>
          <table className="w-full"><tbody className="divide-y divide-slate-100">
            {OUTPUTS.map((o) => <tr key={o.key}><td className="td font-mono text-xs">{o.addr}</td><td className="td">{o.label}</td><td className="td"><StatusDot on={!!sim.outputs[o.key]} danger={o.danger} /></td></tr>)}
          </tbody></table>
        </Card>

        <Card className="p-4">
          <h2 className="mb-2 text-sm font-semibold">PLC memory</h2>
          <table className="w-full"><tbody className="divide-y divide-slate-100 font-mono text-xs">
            <tr><td className="td">M1.0 motor seal-in</td><td className="td">{String(sim.memory.motor)}</td></tr>
            <tr><td className="td">M1.1 pump latch</td><td className="td">{String(sim.memory.pump)}</td></tr>
            <tr><td className="td">M1.2 object edge memory</td><td className="td">{String(sim.memory.prevObj)}</td></tr>
            <tr><td className="td">C0 object counter</td><td className="td">{sim.memory.count}</td></tr>
          </tbody></table>
          <h3 className="mb-1 mt-4 text-xs font-semibold uppercase text-slate-500">Recent input changes</h3>
          {sim.changes.length === 0 ? <p className="text-sm text-slate-400">No changes yet.</p> : (
            <ul className="space-y-1 text-xs">{sim.changes.map((c, i) => <li key={i} className="font-mono"><span className="text-slate-400">{c.t}</span> {c.key} → {c.val ? 'ON' : 'OFF'}</li>)}</ul>
          )}
        </Card>
        <Card className="p-4">
          <h2 className="mb-2 text-sm font-semibold">Execution log</h2>
          <div className="h-64 overflow-y-auto rounded-lg bg-navy p-3 font-mono text-xs text-sky-100">
            {[...sim.log].reverse().map((l, i) => <div key={i}><span className="text-sky-300/60">{l.t}</span> {l.msg}</div>)}
          </div>
        </Card>
      </div>
    </>
  );
}
