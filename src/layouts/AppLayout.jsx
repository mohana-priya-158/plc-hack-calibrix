import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Bell, BookOpen, Cpu, FileBarChart, FlaskConical, ListChecks, LayoutDashboard, PanelLeftClose, PanelLeftOpen, Settings, UserCircle, Workflow, Factory } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/ui';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/challenges', label: 'Challenges', icon: ListChecks },
  { to: '/editor', label: 'Ladder Logic Editor', icon: Workflow },
  { to: '/simulator', label: 'PLC Simulator', icon: Cpu },
  { to: '/tests', label: 'Test Results', icon: FlaskConical },
  { to: '/report', label: 'Evaluation Report', icon: FileBarChart },
  { to: '/help', label: 'Help & Documentation', icon: BookOpen },
  { to: '/settings', label: 'Settings', icon: Settings },
];
const NOTES = ['Mock PLC engine active (frontend demo)', 'Public tests available for Conveyor challenge', 'Backend not connected — using local data'];

export default function AppLayout() {
  const { challenge, sim } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const fault = sim.inputs.ESTOP || sim.inputs.FAULT;
  const statusTone = fault ? 'red' : sim.status === 'running' ? 'green' : sim.status === 'paused' ? 'amber' : 'slate';

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className={`flex shrink-0 flex-col border-r border-slate-200 bg-white transition-all ${collapsed ? 'w-16' : 'w-60'}`}>
        <div className="flex h-14 items-center gap-2 border-b border-slate-200 px-4">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-royal text-white"><Factory size={18} /></span>
          {!collapsed && <span className="text-sm font-bold leading-tight">PLC Logic<br />Arena</span>}
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} title={label}
              className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-sky-100 text-royal' : 'text-slate-600 hover:bg-slate-100'}`}>
              <Icon size={18} className="shrink-0" />{!collapsed && label}
            </NavLink>
          ))}
        </nav>
        <button onClick={() => setCollapsed(!collapsed)} className="m-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100">
          {collapsed ? <PanelLeftOpen size={18} /> : <><PanelLeftClose size={18} /> Collapse</>}
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="relative flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden font-bold sm:block">PLC Logic Arena <span className="font-normal text-slate-400">· Industrial Automation Test Bench</span></span>
            <Badge tone="blue">{challenge ? challenge.title : 'No challenge selected'}</Badge>
          </div>
          <div className="flex items-center gap-3">
            <Badge tone={statusTone}>{fault ? 'FAULT / E-STOP' : `Simulation ${sim.status.toUpperCase()}`}</Badge>
            <button onClick={() => setShowNotes(!showNotes)} className="relative rounded-lg p-2 hover:bg-slate-100" aria-label="Notifications">
              <Bell size={18} /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-royal" />
            </button>
            <div className="flex items-center gap-2 text-sm"><UserCircle size={26} className="text-slate-400" /><span className="hidden md:block">Engineer</span></div>
          </div>
          {showNotes && (
            <div className="card absolute right-16 top-14 z-40 w-72 p-2 text-sm">
              {NOTES.map((n) => <div key={n} className="rounded px-2 py-1.5 hover:bg-slate-50">{n}</div>)}
            </div>
          )}
        </header>
        <main className="flex-1 overflow-y-auto p-5"><Outlet /></main>
      </div>
    </div>
  );
}
