import { useMemo } from 'react';
import { Card, PageHeader } from '../components/ui';
import LadderCanvas, { LadderSymbol } from '../features/ladder-editor/LadderCanvas';
import { sampleConveyorProgram } from '../features/ladder-editor/ladderModel';

const Sym = ({ type, label }) => <figure className="flex flex-col items-center text-navy"><LadderSymbol type={type} preset={5} /><figcaption className="text-xs text-slate-500">{label}</figcaption></figure>;
const Section = ({ title, children }) => <Card className="p-5"><h2 className="mb-2 font-semibold">{title}</h2><div className="space-y-2 text-sm leading-relaxed text-slate-600">{children}</div></Card>;
const noop = () => {};

export default function HelpPage() {
  const sample = useMemo(() => sampleConveyorProgram(), []);
  return (
    <>
      <PageHeader title="Help & Documentation" subtitle="Ladder Logic basics and how to use the test bench." />
      <div className="grid max-w-5xl gap-4">
        <Section title="What is a PLC?"><p>A Programmable Logic Controller is a rugged industrial computer that reads sensors and switches, runs a control program, and drives motors, valves and lamps in real time.</p></Section>
        <Section title="What is Ladder Logic?"><p>Ladder Logic is a graphical PLC language that looks like an electrical relay diagram: two vertical power rails with horizontal rungs between them. If a path of closed contacts connects the left rail to a coil, the coil turns on.</p></Section>
        <Section title="Contacts and coils">
          <div className="flex flex-wrap gap-6"><Sym type="NO" label="NO: passes power when input is ON" /><Sym type="NC" label="NC: passes power when input is OFF" /><Sym type="COIL" label="Output coil" /><Sym type="SET" label="Set (latch)" /><Sym type="RST" label="Reset (unlatch)" /></div>
          <p>Normally Open (NO) closes when its bit is 1. Normally Closed (NC) is the opposite. Coils write their rung result to an output (Q) or memory (M) address. Set/Reset coils keep their state until the opposite coil acts.</p>
        </Section>
        <Section title="Series and parallel logic">
          <p>Contacts in <b>series</b> behave like AND: all must pass. Contacts in <b>parallel</b> behave like OR: any path passes. A start button in parallel with the motor's own contact creates a seal-in (latch).</p>
          <div className="overflow-x-auto rounded-lg border border-slate-200 p-2"><LadderCanvas readOnly program={{ rungs: sample.rungs.slice(0, 1) }} selectedId={null} activeRungId={null} onSelect={noop} onSelectRung={noop} onAddRung={noop} onDeleteRung={noop} onDropType={noop} /></div>
        </Section>
        <Section title="Timers and counters">
          <div className="flex flex-wrap gap-6"><Sym type="TON" label="TON on-delay" /><Sym type="TOF" label="TOF off-delay" /><Sym type="CTU" label="CTU count up" /></div>
          <p>TON turns on after its input has been true for the preset time. TOF stays on for the preset time after the input drops. CTU counts rising edges and its done bit sets when the count reaches the preset.</p>
        </Section>
        <Section title="PLC scan cycle">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            {['1. Read inputs', '2. Execute program (rung by rung)', '3. Write outputs', '4. Housekeeping'].map((s, i) => <span key={s} className="flex items-center gap-2"><span className="rounded-lg bg-sky-100 px-3 py-2 text-royal">{s}</span>{i < 3 && <span>→</span>}</span>)}
          </div>
          <p>The cycle repeats continuously, typically every few milliseconds. In the simulator each scan is one step of this loop.</p>
        </Section>
        <Section title="How to use the test bench">
          <ol className="list-inside list-decimal space-y-1">
            <li>Pick a challenge on the Challenges page and press Start Challenge.</li>
            <li>In the editor, click or drag instructions onto rungs, select an element, and edit its address in the inspector. Use Load Example for a working conveyor program.</li>
            <li>Press Validate to catch invalid addresses and empty or incomplete rungs.</li>
            <li>Open the PLC Simulator, press Run, and toggle inputs; outputs update every scan.</li>
            <li>On Test Results, run the public test cases and review PASS/FAIL against expected outputs.</li>
            <li>The Evaluation Report summarises the score and can be exported as CSV.</li>
          </ol>
          <p><b>Note:</b> in this frontend-only version, simulation and scoring use mock logic. Hidden tests and real execution will be provided by the backend later. In the examples, an input value of 1 means the button is pressed, so STOP and E-STOP use NC contacts in the logic.</p>
        </Section>
      </div>
    </>
  );
}
