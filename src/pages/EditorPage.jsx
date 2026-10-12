import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, FilePlus2, FolderOpen, GitBranch, Minus, Play, Plus, Redo2, Save, Trash2, Undo2, ShieldCheck, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import LadderCanvas, { LadderSymbol } from '../features/ladder-editor/LadderCanvas';
import {
  ELEMENT_TYPES, addElement, addParallel, addressHint, emptyProgram, findInfo, isOutput, isValidAddress, makeElement, makeRung,
  removeElement, removeRung, sampleConveyorProgram, updateElement, validateLadder,
} from '../features/ladder-editor/ladderModel';
import { Badge, Button, Card, PageHeader } from '../components/ui';

const TOOLBOX = ['NO', 'NC', 'COIL', 'SET', 'RST', 'TON', 'TOF', 'CTU'];

function Inspector({ info, onApply, onDelete }) {
  const { el, isBranch } = info;
  const [draft, setDraft] = useState({ type: el.type, address: el.address, name: el.name, preset: el.preset ?? 5 });
  const meta = ELEMENT_TYPES[draft.type];
  const allowed = Object.keys(ELEMENT_TYPES).filter((t) => (isBranch ? ['NO', 'NC'].includes(t) : ELEMENT_TYPES[t].side === ELEMENT_TYPES[el.type].side));
  const addrOk = isValidAddress(draft.type, draft.address);
  const presetOk = meta.preset === undefined || (Number.isInteger(Number(draft.preset)) && Number(draft.preset) > 0);
  const changeType = (type) => setDraft((d) => ({ ...d, type, address: isValidAddress(type, d.address) ? d.address : ELEMENT_TYPES[type].address }));

  return (
    <div className="space-y-3 text-sm">
      <div><label className="mb-1 block text-xs font-semibold text-slate-500">Element type</label>
        <select className="input" value={draft.type} onChange={(e) => changeType(e.target.value)}>{allowed.map((t) => <option key={t} value={t}>{ELEMENT_TYPES[t].label}</option>)}</select></div>
      <div><label className="mb-1 block text-xs font-semibold text-slate-500">Address ({addressHint(draft.type)})</label>
        <input className={`input font-mono ${addrOk ? '' : 'border-red-400'}`} value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value.toUpperCase() })} />
        {!addrOk && <p className="mt-1 text-xs text-red-600">Invalid address for this element.</p>}</div>
      <div><label className="mb-1 block text-xs font-semibold text-slate-500">Display name</label>
        <input className="input" value={draft.name} maxLength={24} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
      {meta.preset !== undefined && (
        <div><label className="mb-1 block text-xs font-semibold text-slate-500">Preset ({meta.unit === 's' ? 'seconds' : 'count'})</label>
          <input type="number" min="1" className={`input ${presetOk ? '' : 'border-red-400'}`} value={draft.preset} onChange={(e) => setDraft({ ...draft, preset: e.target.value })} /></div>
      )}
      <div className="flex gap-2">
        <Button disabled={!addrOk || !presetOk} onClick={() => onApply({ type: draft.type, address: draft.address, name: draft.name, ...(meta.preset !== undefined ? { preset: Number(draft.preset) } : {}) })}>Apply</Button>
        <Button variant="danger" icon={Trash2} onClick={onDelete}>Remove</Button>
      </div>
    </div>
  );
}

export default function EditorPage() {
  const { program, setProgram, undo, redo, canUndo, canRedo, save, lastSaved, challenge } = useApp();
  const nav = useNavigate();
  const [selId, setSelId] = useState(null);
  const [rungId, setRungId] = useState(null);
  const [msg, setMsg] = useState(null);
  const [check, setCheck] = useState(null);

  const info = selId ? findInfo(program, selId) : null;
  const activeRung = program.rungs.find((r) => r.id === rungId) || program.rungs[program.rungs.length - 1];
  const say = (tone, text) => setMsg({ tone, text });

  const addToRung = (targetRungId, type) => {
    const el = makeElement(type);
    if (!targetRungId) { const r = makeRung([el]); setProgram((p) => ({ ...p, rungs: [...p.rungs, r] })); setRungId(r.id); }
    else { setProgram((p) => addElement(p, targetRungId, el)); setRungId(targetRungId); }
    setSelId(el.id); setCheck(null); setMsg(null);
  };
  const addRung = () => { const r = makeRung(); setProgram((p) => ({ ...p, rungs: [...p.rungs, r] })); setRungId(r.id); };
  const deleteRung = (id) => {
    const rung = program.rungs.find((r) => r.id === id);
    if (rung.elements.length && !window.confirm('Delete this rung and all its elements?')) return;
    setProgram((p) => removeRung(p, id)); setSelId(null);
  };
  const addBranch = () => {
    if (!info) return say('amber', 'Select a contact first, then add a parallel branch.');
    if (info.isBranch || isOutput(info.el)) return say('amber', 'A parallel branch can only be attached to a top-level contact.');
    const branch = makeElement('NO');
    setProgram((p) => addParallel(p, selId, branch)); setSelId(branch.id); setMsg(null);
  };
  const deleteSelected = () => { if (!info) return say('amber', 'Select an element to delete.'); setProgram((p) => removeElement(p, selId)); setSelId(null); };
  const newProgram = () => { if (program.rungs.some((r) => r.elements.length) && !window.confirm('Start a new program? (You can still Undo)')) return; setProgram(emptyProgram()); setSelId(null); setCheck(null); };
  const loadExample = () => { setProgram(sampleConveyorProgram()); setSelId(null); setCheck(null); say('green', 'Conveyor start/stop example loaded. Edit it freely.'); };
  const clear = () => { if (!window.confirm('Clear the whole program? (You can still Undo)')) return; setProgram({ rungs: [] }); setSelId(null); setCheck(null); };
  const validate = () => { const r = validateLadder(program); setCheck(r); say(r.valid ? 'green' : 'red', r.valid ? 'Validation passed.' : `${r.errors.length} error(s) found.`); return r; };
  const runSim = () => { const r = validate(); if (!r.valid) return; save(); nav('/simulator'); };

  const tone = { green: 'bg-green-50 text-green-700 border-green-200', red: 'bg-red-50 text-red-700 border-red-200', amber: 'bg-amber-50 text-amber-800 border-amber-200' };

  return (
    <>
      <PageHeader title="Ladder Logic Editor"
        subtitle={challenge ? `Challenge: ${challenge.title}` : 'No challenge selected — pick one from Challenges to load its I/O.'}
        actions={lastSaved && <Badge tone="green">Saved {lastSaved}</Badge>} />

      {challenge && (
        <Card className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-1 px-4 py-2 text-xs">
          <span className="flex flex-wrap items-center gap-1"><b>Inputs</b>{challenge.inputs.map((x) => <Badge key={x} tone="blue">{x}</Badge>)}</span>
          <span className="flex flex-wrap items-center gap-1"><b>Outputs</b>{challenge.outputs.map((x) => <Badge key={x} tone="green">{x}</Badge>)}</span>
        </Card>
      )}

      <Card className="mb-3 flex flex-wrap gap-2 p-2">
        <Button variant="outline" icon={FilePlus2} onClick={newProgram}>New Program</Button>
        <Button variant="outline" icon={FolderOpen} onClick={loadExample}>Load Example</Button>
        <Button variant="outline" icon={Save} onClick={() => { save(); say('green', 'Program saved locally.'); }}>Save</Button>
        <Button variant="outline" icon={Undo2} onClick={undo} disabled={!canUndo}>Undo</Button>
        <Button variant="outline" icon={Redo2} onClick={redo} disabled={!canRedo}>Redo</Button>
        <Button variant="outline" icon={ShieldCheck} onClick={validate}>Validate</Button>
        <Button icon={Play} onClick={runSim}>Run Simulation</Button>
        <Button variant="danger" icon={Trash2} onClick={clear}>Clear Program</Button>
      </Card>
      {msg && <div className={`mb-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${tone[msg.tone]}`}>{msg.text}</div>}

      <div className="grid gap-4 lg:grid-cols-[210px_minmax(0,1fr)_280px]">
        <Card className="p-3">
          <h2 className="mb-2 text-xs font-semibold uppercase text-slate-500">Instruction toolbox</h2>
          <div className="space-y-1.5">
            {TOOLBOX.map((type) => (
              <button key={type} draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', type)}
                onClick={() => addToRung(activeRung?.id, type)}
                className="flex w-full items-center gap-2 rounded-lg border border-slate-200 px-2 py-1 text-left hover:border-royal hover:bg-sky-50">
                <span className="w-14 shrink-0 text-navy [&>svg]:h-auto [&>svg]:w-full"><LadderSymbol type={type} preset={ELEMENT_TYPES[type].preset} /></span>
                <span className="text-xs font-medium leading-tight">{ELEMENT_TYPES[type].label}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 space-y-1.5 border-t border-slate-200 pt-3">
            <Button variant="outline" className="w-full justify-start" icon={Minus} onClick={() => addToRung(activeRung?.id, 'NO')}>Series connection</Button>
            <Button variant="outline" className="w-full justify-start" icon={GitBranch} onClick={addBranch}>Parallel branch</Button>
            <Button variant="outline" className="w-full justify-start" icon={Plus} onClick={addRung}>Add Rung</Button>
            <Button variant="danger" className="w-full justify-start" icon={Trash2} onClick={deleteSelected}>Delete Element</Button>
          </div>
          <p className="mt-3 text-[11px] text-slate-400">Click to add to the highlighted rung, or drag onto a rung. Select a contact to add a parallel branch.</p>
        </Card>

        <Card className="min-h-[380px] overflow-x-auto p-3" onClick={() => setSelId(null)}>
          <LadderCanvas program={program} selectedId={selId} activeRungId={activeRung?.id}
            onSelect={setSelId} onSelectRung={setRungId} onAddRung={addRung} onDeleteRung={deleteRung} onDropType={addToRung} />
        </Card>

        <div className="space-y-4">
          <Card className="p-3">
            <h2 className="mb-2 text-xs font-semibold uppercase text-slate-500">Inspector</h2>
            {info ? <Inspector key={`${selId}-${info.el.type}-${info.el.address}-${info.el.name}-${info.el.preset}`} info={info}
              onApply={(patch) => { setProgram((p) => updateElement(p, selId, patch)); setCheck(null); }}
              onDelete={deleteSelected} />
              : <p className="text-sm text-slate-500">Select an element on the canvas to edit its type, address, name and preset.</p>}
          </Card>
          <Card className="p-3 text-xs text-slate-600">
            <h2 className="mb-2 text-xs font-semibold uppercase text-slate-500">Example: conveyor start/stop</h2>
            <p className="font-mono">I0.0 START · I0.1 STOP<br />I0.2 EMERGENCY_STOP · Q0.0 CONVEYOR_MOTOR</p>
            <p className="mt-2">START (NO) in parallel with the Q0.0 holding contact seals the motor in after release. STOP and E-STOP are NC contacts in series, so pressing either breaks the rung and drops the motor. E-STOP also blocks any new start.</p>
          </Card>
        </div>
      </div>

      {check && (
        <Card className="mt-4 p-3 text-sm">
          <h2 className="mb-2 flex items-center gap-2 font-semibold">{check.valid ? <CheckCircle2 size={16} className="text-green-600" /> : <XCircle size={16} className="text-red-600" />} Validation result</h2>
          {check.errors.map((e) => <div key={e} className="flex gap-2 text-red-700"><XCircle size={14} className="mt-0.5 shrink-0" />{e}</div>)}
          {check.warnings.map((w) => <div key={w} className="flex gap-2 text-amber-700"><AlertTriangle size={14} className="mt-0.5 shrink-0" />{w}</div>)}
          {check.valid && !check.warnings.length && <p className="text-green-700">No problems found.</p>}
        </Card>
      )}
    </>
  );
}
