import { Link, useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, CheckCircle2, ClipboardList, Code2, Play, Plus, Target, Workflow, XCircle, FileBarChart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge, Button, Card, DifficultyBadge, PageHeader } from '../components/ui';

export default function Dashboard() {
  const { challenges, history, setChallenge, savedCount } = useApp();
  const nav = useNavigate();
  const passed = history.reduce((s, h) => s + h.passed, 0);
  const failed = history.reduce((s, h) => s + h.failed, 0);
  const avg = history.length ? Math.round(history.reduce((s, h) => s + h.score, 0) / history.length) : 0;
  const stats = [
    { label: 'Total Challenges', value: challenges.length, icon: ClipboardList },
    { label: 'Programs Created', value: history.length + savedCount(), icon: Code2 },
    { label: 'Test Cases Passed', value: passed, icon: CheckCircle2, color: 'text-green-600' },
    { label: 'Test Cases Failed', value: failed, icon: XCircle, color: 'text-red-600' },
    { label: 'Average Score', value: `${avg}%`, icon: Target },
  ];
  const attempted = new Set(history.map((h) => h.challenge));
  const levels = ['Beginner', 'Intermediate', 'Advanced'].map((lvl) => {
    const list = challenges.filter((c) => c.difficulty === lvl);
    const done = list.filter((c) => attempted.has(c.title)).length;
    return { lvl, done, total: list.length };
  });
  const recent = [...history].reverse().slice(0, 5);
  const start = (id) => { setChallenge(id); nav('/editor'); };

  const quick = [
    { label: 'Start New Challenge', icon: Plus, to: '/challenges' }, { label: 'Open Ladder Editor', icon: Workflow, to: '/editor' },
    { label: 'Run Simulation', icon: Play, to: '/simulator' }, { label: 'View Results', icon: FileBarChart, to: '/report' },
  ];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Overview of your PLC programming practice. Activity shown is demonstration data." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map(({ label, value, icon: Icon, color = 'text-royal' }) => (
          <Card key={label} className="flex items-center gap-3 p-4">
            <span className={`grid h-10 w-10 place-items-center rounded-lg bg-sky-50 ${color}`}><Icon size={20} /></span>
            <div><div className="text-2xl font-bold">{value}</div><div className="text-xs text-slate-500">{label}</div></div>
          </Card>
        ))}
      </div>

      <Card className="mt-4 p-4">
        <h2 className="mb-3 text-sm font-semibold">Quick actions</h2>
        <div className="flex flex-wrap gap-2">
          {quick.map(({ label, icon, to }) => <Button key={label} icon={icon} variant={to === '/challenges' ? 'primary' : 'outline'} onClick={() => nav(to)}>{label}</Button>)}
        </div>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold">Available challenges</h2><Link to="/challenges" className="flex items-center gap-1 text-sm text-royal">View all <ArrowRight size={14} /></Link></div>
          <div className="divide-y divide-slate-100">
            {challenges.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0"><div className="truncate text-sm font-medium">{c.title}</div><div className="text-xs text-slate-500">{c.time}</div></div>
                <div className="flex items-center gap-3"><DifficultyBadge level={c.difficulty} /><Button variant="outline" onClick={() => start(c.id)}>Start</Button></div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold">Progress overview</h2>
          <div className="space-y-3">
            {levels.map(({ lvl, done, total }) => (
              <div key={lvl}>
                <div className="mb-1 flex justify-between text-xs"><span>{lvl}</span><span>{done}/{total} attempted</span></div>
                <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-royal" style={{ width: `${total ? (done / total) * 100 : 0}%` }} /></div>
              </div>
            ))}
          </div>
          <h3 className="mb-2 mt-5 text-xs font-semibold uppercase text-slate-500">Score trend</h3>
          <div className="flex h-24 items-end gap-2">
            {history.slice(-8).map((h, i) => (
              <div key={i} title={`${h.challenge}: ${h.score}%`} className="flex flex-1 flex-col items-center justify-end gap-1">
                <div className={`w-full rounded-t ${h.score >= 80 ? 'bg-green-500' : h.score >= 50 ? 'bg-royal' : 'bg-red-400'}`} style={{ height: `${Math.max(h.score, 4)}%` }} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold">Recent test results</h2>
          <table className="w-full">
            <thead><tr><th className="th">Challenge</th><th className="th">Score</th><th className="th">Passed</th><th className="th">Failed</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {recent.map((h, i) => (
                <tr key={i}><td className="td">{h.challenge}{h.demo && <span className="ml-2 text-[10px] text-slate-400">demo</span>}</td>
                  <td className="td"><Badge tone={h.score >= 80 ? 'green' : h.score >= 50 ? 'blue' : 'red'}>{h.score}%</Badge></td>
                  <td className="td text-green-600">{h.passed}</td><td className="td text-red-600">{h.failed}</td></tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Activity size={16} /> Recent activity</h2>
          <ul className="space-y-2.5 text-sm">
            {recent.map((h, i) => (
              <li key={i} className="flex gap-2"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${h.failed ? 'bg-red-400' : 'bg-green-500'}`} />
                <span>Evaluated <strong>{h.challenge}</strong><div className="text-xs text-slate-400">{new Date(h.at).toLocaleDateString()}</div></span></li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
