import { Plus, Trash2 } from 'lucide-react';
import { ELEMENT_TYPES } from './ladderModel';

/** Ladder symbol drawn with SVG; wires are part of the symbol so cells chain seamlessly. */
export function LadderSymbol({ type, preset }) {
  const info = ELEMENT_TYPES[type];
  const contact = type === 'NO' || type === 'NC';
  const coil = ['COIL', 'SET', 'RST'].includes(type);
  return (
    <svg viewBox="0 0 112 44" width="112" height="44" fill="none" stroke="currentColor" strokeWidth="2">
      {contact && (<>
        <path d="M0 22H40M72 22H112" /><path d="M40 8V36M72 8V36" />
        {type === 'NC' && <path d="M34 34L78 10" />}
      </>)}
      {coil && (<>
        <path d="M0 22H38M74 22H112" /><path d="M46 6Q36 22 46 38M66 6Q76 22 66 38" />
        {type !== 'COIL' && <text x="56" y="27" textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor" stroke="none">{info.short[0]}</text>}
      </>)}
      {!contact && !coil && (<>
        <path d="M0 22H22M90 22H112" /><rect x="22" y="3" width="68" height="38" rx="3" />
        <text x="56" y="19" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor" stroke="none">{type}</text>
        <text x="56" y="34" textAnchor="middle" fontSize="10" fill="currentColor" stroke="none">PT={preset}{info.unit === 's' ? 's' : ''}</text>
      </>)}
    </svg>
  );
}

function Cell({ el, selectedId, onSelect }) {
  const rows = [el, ...el.parallel];
  return (
    <div className="relative shrink-0 text-navy">
      {rows.map((x) => (
        <button key={x.id} onClick={(e) => { e.stopPropagation(); onSelect(x.id); }}
          className={`flex h-[80px] w-[112px] flex-col items-center rounded-md ${selectedId === x.id ? 'bg-sky-100 text-royal ring-2 ring-royal' : 'hover:bg-sky-50'}`}>
          <span className="h-[18px] font-mono text-[11px] font-semibold leading-[18px]">{x.address || '??'}</span>
          <LadderSymbol type={x.type} preset={x.preset} />
          <span className="h-[18px] max-w-full truncate px-1 text-[10px] leading-[18px] text-slate-500">{x.name || ELEMENT_TYPES[x.type].short}</span>
        </button>
      ))}
      {el.parallel.length > 0 && (<>
        <span className="absolute left-0 top-[40px] w-0.5 bg-navy" style={{ height: el.parallel.length * 80 }} />
        <span className="absolute right-0 top-[40px] w-0.5 bg-navy" style={{ height: el.parallel.length * 80 }} />
      </>)}
    </div>
  );
}

export default function LadderCanvas({ program, selectedId, activeRungId, onSelect, onSelectRung, onAddRung, onDeleteRung, onDropType, readOnly = false }) {
  return (
    <div className="space-y-2">
      {program.rungs.map((rung, index) => (
        <div key={rung.id}
          onClick={() => onSelectRung(rung.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const type = e.dataTransfer.getData('text/plain'); if (ELEMENT_TYPES[type]) onDropType(rung.id, type); }}
          className={`group flex items-stretch rounded-lg border p-2 ${activeRungId === rung.id ? 'border-sky-300 bg-sky-50/60' : 'border-transparent hover:border-slate-200'}`}>
          <div className="flex w-10 shrink-0 flex-col items-start gap-1 pt-6 text-xs font-bold text-slate-500">
            <span>{String(index + 1).padStart(3, '0')}</span>
            {!readOnly && <button title="Delete rung" onClick={(e) => { e.stopPropagation(); onDeleteRung(rung.id); }} className="rounded p-0.5 text-slate-300 hover:bg-red-50 hover:text-red-600"><Trash2 size={13} /></button>}
          </div>
          <div className="w-1.5 shrink-0 rounded-full bg-navy" title="Left power rail" />
          {rung.elements.map((el) => <Cell key={el.id} el={el} selectedId={selectedId} onSelect={onSelect} />)}
          <div className="relative mt-[39px] h-0.5 min-w-[24px] flex-1 self-start bg-navy">
            {!rung.elements.length && <span className="absolute left-3 top-2 whitespace-nowrap text-xs text-slate-400">Empty rung — click or drag an instruction here</span>}
          </div>
          <div className="w-1.5 shrink-0 rounded-full bg-navy" title="Right power rail" />
        </div>
      ))}
      {!readOnly && <button onClick={onAddRung} className="btn btn-outline ml-10"><Plus size={14} /> Add Rung</button>}
    </div>
  );
}
