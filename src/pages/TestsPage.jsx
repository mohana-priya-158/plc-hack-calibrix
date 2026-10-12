import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, ListChecks, Play, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getPublicTests } from '../services/evaluationService';
import { Badge, Button, Card, Empty, MockBanner, PageHeader } from '../components/ui';

export const expectedLabel = (e) => (e.motor ? 'Motor ON' : 'Motor OFF');

export default function TestsPage() {
  const { challenge, challengeId, setChallenge, results, runTests, resetResults, running } = useApp();
  const nav = useNavigate();
  const [tests, setTests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { getPublicTests(challengeId).then(setTests).catch((e) => setError(e.message)); setSelected(null); }, [challengeId]);

  const run = async (ids) => { setError(''); try { await runTests(ids); } catch (e) { setError(e.message); } };

  if (!tests.length) {
    return (
      <>
        <PageHeader title="Test Results" subtitle={challenge ? challenge.title : ''} />
        <Empty icon={FlaskConical} title="No public test cases for this challenge yet"
          text="Public tests are currently available for the Conveyor Belt Start/Stop Control challenge."
          action={<Button icon={ListChecks} onClick={() => { setChallenge('c1'); }}>Switch to Conveyor challenge</Button>} />
      </>
    );
  }
  return (
    <>
      <PageHeader title="Test Results" subtitle={`Public test cases · ${challenge?.title || ''}`}
        actions={<>
          <Button icon={Play} onClick={() => run()} disabled={running}>{running ? 'Running…' : 'Run All Tests'}</Button>
          <Button variant="outline" icon={Play} onClick={() => run([selected])} disabled={running || !selected}>Run Selected Test</Button>
          <Button variant="outline" icon={RotateCcw} onClick={resetResults}>Reset Tests</Button>
        </>} />
      <MockBanner>Results come from a mock evaluator that checks the structure of your program (start contact, STOP/E-STOP NC contacts, holding branch). Load the example program in the editor, then run the tests. Hidden tests are not part of the frontend.</MockBanner>
      {error && <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[820px]">
          <thead className="border-b border-slate-200 bg-slate-50"><tr>
            {['', 'ID', 'Test name', 'Input conditions', 'Expected', 'Actual', 'Status', 'Time'].map((h) => <th key={h} className="th">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {tests.map((t) => {
              const r = results[t.id];
              return (
                <tr key={t.id} onClick={() => setSelected(t.id)} className={`cursor-pointer ${selected === t.id ? 'bg-sky-50' : 'hover:bg-slate-50'}`}>
                  <td className="td"><input type="radio" readOnly checked={selected === t.id} /></td>
                  <td className="td font-mono text-xs">{t.id}</td><td className="td font-medium">{t.name}</td>
                  <td className="td text-slate-600">{t.condition}</td><td className="td">{expectedLabel(t.expected)}</td>
                  <td className="td">{r ? r.actual : '—'}{r?.note && <div className="text-xs text-red-600">{r.note}</div>}</td>
                  <td className="td">{r ? <Badge tone={r.status === 'PASS' ? 'green' : 'red'}>{r.status}</Badge> : <Badge>NOT RUN</Badge>}</td>
                  <td className="td font-mono text-xs">{r ? `${r.timeMs} ms` : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      <div className="mt-4 flex gap-2"><Button variant="outline" onClick={() => nav('/editor')}>Back to Editor</Button><Button variant="outline" onClick={() => nav('/report')}>View Evaluation Report</Button></div>
    </>
  );
}
