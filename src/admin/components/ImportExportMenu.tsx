import React, { useState, useRef, useEffect } from 'react';
import { fetchAuth } from '../../lib/fetchAuth';

export function ImportExportMenu({ type, onImportSuccess }: { type: 'schools' | 'students' | 'teachers', onImportSuccess?: () => void }) {
  const [show, setShow] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShow(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleExport = async () => {
    setShow(false);
    try {
      const res = await fetchAuth(`/api/${type}/export`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Template_${type}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Gagal mengekspor data");
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan sistem saat ekspor");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setShow(false);
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetchAuth(`/api/${type}/import`, { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        if (onImportSuccess) {
          onImportSuccess();
        } else {
          window.location.reload();
        }
      } else {
        alert(data.error || "Gagal mengimpor data");
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan sistem saat impor");
    }
    e.target.value = '';
  };

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button className="btn btn-ghost btn-sm" onClick={() => setShow(!show)}>
        <i className="ti ti-file-spreadsheet"></i> Data Excel <i className="ti ti-chevron-down" style={{ fontSize: '14px', marginLeft: '4px' }}></i>
      </button>
      {show && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'white', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 50, minWidth: '180px', padding: '8px' }}>
           <button className="btn btn-ghost btn-sm btn-full" style={{ justifyContent: 'flex-start' }} onClick={handleExport}>
             <i className="ti ti-download"></i> Unduh & Export
           </button>
           <label className="btn btn-ghost btn-sm btn-full" style={{ justifyContent: 'flex-start', cursor: 'pointer', margin: '4px 0 0 0' }}>
             <i className="ti ti-upload"></i> Import Data
             <input type="file" style={{ display: 'none' }} accept=".xlsx, .xls" onChange={handleImport} />
           </label>
        </div>
      )}
    </div>
  );
}
