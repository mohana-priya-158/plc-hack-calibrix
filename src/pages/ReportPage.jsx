import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, FileBarChart, Play, Printer, Undo2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getPublicTests } from '../services/evaluationService';
import { Badge, Button, Card, Empty, MockBanner, PageHeader } from '../components/ui';
import { downloadText, toCsv } from '../utils/csv';
import { expectedLabel } from './TestsPage';

export default function ReportPage() {
  const { challenge, challengeId, results, runTests, running } = useApp();
  const nav = useNavigate();
  const [tests, setTests] = useState([]);
  useEffect(() => { getPublicTests(challengeId).then(setTests); }, [challengeId]);

  const rows = tests.map((t) => ({ ...t, r: results[t.id] })).filter((x) => x.r);
  const total = tests.length;
  const passed = rows.filter((x) => x.r.status === 'PASS').length;
  const failed = rows.length - passed;
  const pct = total ? Math.round((passed / total) * 100) : 0;
  const complete = rows.length === total && total > 0;
  const status = !rows.length ? 'Not evaluated' : !complete ? 'Partially evaluated' : failed === 0 ? 'Challenge Passed' : 'Needs Work';
  const tone = status === 'Challenge Passed' ? 'green' : status === 'Needs Work' ? 'red' : 'amber';

  const exportCsv = () => {
    const lines = [
      ['PLC Logic Arena - Evaluation Report'], ['Challenge', challenge?.title || challengeId], ['Generated', new Date().toISOString()],
      ['Data source', 'SIMULATED frontend demonstration data (not from a real PLC engine)'],
      ['Score', `${pct}%`], ['Total tests', total], ['Passed', passed], ['Failed', failed], ['Status', status], [],
      ['Test ID', 'Test name', 'Input conditions', 'Expected', 'Actual', 'Status', 'Time (ms)'],
      ...rows.map(({ id, name, condition, expected, r }) => [id, name, condition, expectedLabel(expected), r.actual, r.status, r.timeMs]),
    ];
    downloadText(`plc-report-${challengeId}.csv`, toCsv(lines));
  };

  if (!total) return <><PageHeader title="Evaluation Report" /><Empty icon={FileBarChart} title="No public tests for this challenge" text="Evaluation is currently available for the Conveyor Belt Start/Stop Control challenge." /></>;

  const R = 52; const C = 2 * Math.PI * R;
  return (
    <>
      <PageHeader title="Evaluation Report" subtitle={challenge?.title}
        actions={<>
          <Button icon={Play} onClick={() => runTests()} disabled={running}>{running ? 'Evaluating…' : 'Run Evaluation Again'}</Button>
          <Button variant="outline" icon={Download} onClick={exportCsv} disabled={!rows.length}>Export Report</Button>
          <Button variant="outline" icon={Printer} onClick={() => window.print()}>Print</Button>
          <Button variant="outline" icon={Undo2} onClick={() => nav('/editor')}>Return to Editor</Button>
        </>} />
      <MockBanner>This score is computed by the mock evaluator, not by a real PLC execution engine.</MockBanner>
      {!rows.length ? (
        <Empty icon={FileBarChart} title="No evaluation yet" text="Run the public tests to generate a report." action={<Button icon={Play} onClick={() => runTests()}>Run Evaluation</Button>} />
      ) : (<>
        <div className="grid gap-4 md:grid-cols-[220px_1fr]">
          <Card className="grid place-items-center p-4">
            <svg width="130" height="130" viewBox="0 0 130 130">
              <circle cx="65" cy="65" r={R} fill="none" stroke="#e2e8f0" strokeWidth="12" />
              <circle cx="65" cy="65" r={R} fill="none" stroke={pct >= 80 ? '#22c55e' : pct >= 50 ? '#2556d9' : '#ef4444'} strokeWidth="12" strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} transform="rotate(-90 65 65)" />
              <text x="65" y="72" textAnchor="middle" fontSize="26" fontWeight="700" fill="#12204a">{pct}%</text>
            </svg>
            <span className="text-xs text-slate-500">Overall score</span>
          </Card>
          <Card className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-4">
            {[['Total tests', total], ['Passed', passed, 'text-green-600'], ['Failed', failed, 'text-red-600'], ['Pass percentage', `${pct}%`]].map(([l, v, c = '']) => (
              <div key={l}><div className={`text-2xl font-bold ${c}`}>{v}</div><div className="text-xs text-slate-500">{l}</div></div>
            ))}
            <div className="col-span-full"><div className="mb-1 flex items-center justify-between text-xs"><span>Challenge status</span><Badge tone={tone}>{status}</Badge></div>
              <div className="h-2.5 rounded-full bg-slate-100"><div className={`h-2.5 rounded-full ${pct >= 80 ? 'bg-green-500' : 'bg-royal'}`} style={{ width: `${pct}%` }} /></div></div>
          </Card>
        </div>
        <Card className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="border-b border-slate-200 bg-slate-50"><tr>{['ID', 'Test', 'Expected', 'Actual', 'Status', 'Time'].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(({ id, name, expected, r }) => (
                <tr key={id} className={r.status === 'FAIL' ? 'bg-red-50/50' : ''}>
                  <td className="td font-mono text-xs">{id}</td><td className="td font-medium">{name}</td><td className="td">{expectedLabel(expected)}</td>
                  <td className="td">{r.actual}{r.note && <div className="text-xs text-red-600">{r.note}</div>}</td>
                  <td className="td"><Badge tone={r.status === 'PASS' ? 'green' : 'red'}>{r.status}</Badge></td><td className="td font-mono text-xs">{r.timeMs} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </>)}
    </>
  );
}
