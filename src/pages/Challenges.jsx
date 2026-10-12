import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge, Button, Card, DifficultyBadge, Empty, Modal, PageHeader } from '../components/ui';

const FILTERS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function Challenges() {
  const { challenges, setChallenge } = useApp();
  const nav = useNavigate();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [open, setOpen] = useState(null);

  const visible = useMemo(() => challenges.filter((c) =>
    (filter === 'All' || c.difficulty === filter) &&
    `${c.title} ${c.description}`.toLowerCase().includes(query.trim().toLowerCase())), [challenges, filter, query]);

  const start = (id) => { setChallenge(id); nav('/editor'); };

  return (
    <>
      <PageHeader title="Challenges" subtitle="Pick a control problem, then program it in the Ladder Logic Editor." />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search size={16} className="absolute left-2.5 top-2.5 text-slate-400" />
          <input className="input pl-8" placeholder="Search challenges…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1 text-sm font-medium ${filter === f ? 'bg-royal text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}>{f}</button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? <Empty title="No challenges match" text="Try a different search term or filter." /> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((c) => (
            <Card key={c.id} className="flex flex-col p-4">
              <div className="mb-2 flex items-center justify-between"><DifficultyBadge level={c.difficulty} /><span className="flex items-center gap-1 text-xs text-slate-500"><Clock size={13} />{c.time}</span></div>
              <h3 className="font-semibold">{c.title}</h3>
              <p className="mt-1 flex-1 text-sm text-slate-500">{c.description}</p>
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex flex-wrap items-center gap-1"><span className="w-14 font-semibold text-slate-500">Inputs</span>{c.inputs.map((x) => <Badge key={x} tone="blue">{x}</Badge>)}</div>
                <div className="flex flex-wrap items-center gap-1"><span className="w-14 font-semibold text-slate-500">Outputs</span>{c.outputs.map((x) => <Badge key={x} tone="green">{x}</Badge>)}</div>
              </div>
              <div className="mt-4 flex gap-2"><Button variant="outline" onClick={() => setOpen(c)}>Details</Button><Button onClick={() => start(c.id)}>Start Challenge</Button></div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.title} wide>
        {open && (
          <div className="space-y-4 text-sm">
            <div className="flex gap-2"><DifficultyBadge level={open.difficulty} /><Badge>{open.time}</Badge></div>
            <section><h4 className="mb-1 font-semibold">Problem description</h4><p className="text-slate-600">{open.problem}</p></section>
            <div className="grid gap-4 sm:grid-cols-2">
              <section><h4 className="mb-1 font-semibold">Required inputs</h4><ul className="list-inside list-disc font-mono text-xs text-slate-600">{open.inputs.map((x) => <li key={x}>{x}</li>)}</ul></section>
              <section><h4 className="mb-1 font-semibold">Required outputs</h4><ul className="list-inside list-disc font-mono text-xs text-slate-600">{open.outputs.map((x) => <li key={x}>{x}</li>)}</ul></section>
            </div>
            <section><h4 className="mb-1 font-semibold">Operating rules</h4><ul className="list-inside list-decimal text-slate-600">{open.rules.map((x) => <li key={x}>{x}</li>)}</ul></section>
            <section><h4 className="mb-1 font-semibold">Sample test cases</h4>
              <table className="w-full rounded border border-slate-200"><thead><tr><th className="th">Test</th><th className="th">Input</th><th className="th">Expected</th></tr></thead>
                <tbody className="divide-y divide-slate-100">{open.sampleTests.map((t) => <tr key={t.name}><td className="td">{t.name}</td><td className="td font-mono text-xs">{t.input}</td><td className="td">{t.expected}</td></tr>)}</tbody></table>
            </section>
            <div className="flex justify-end"><Button onClick={() => start(open.id)}>Start Challenge</Button></div>
          </div>
        )}
      </Modal>
    </>
  );
}
