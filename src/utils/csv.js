const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
export const toCsv = (rows) => rows.map((r) => r.map(esc).join(',')).join('\r\n');
export function downloadText(filename, text, mime = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
