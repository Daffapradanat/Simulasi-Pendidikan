import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardView({ modules, students, teachers }: { modules: any[], students: any[], teachers: any[] }) {
  const chartData = [
    { name: 'SD', Selesai: 120, Aktif: 300, BelumMulai: 50 },
    { name: 'SMP', Selesai: 90, Aktif: 250, BelumMulai: 40 },
    { name: 'SMA', Selesai: 60, Aktif: 180, BelumMulai: 60 },
    { name: 'Umum', Selesai: 30, Aktif: 90, BelumMulai: 20 },
  ];

  return (
    <div className="admin-content">
      <h2 className="page-title">Dashboard Admin</h2>
      <p className="page-subtitle">Ringkasan statistik platform</p>
      <div className="stats-row" style={{ marginBottom: '32px' }}>
        <div className="stat-card">
          <div className="stat-icon"><i className="ti ti-books"></i></div>
          <div className="stat-value">{modules.length}</div>
          <div className="stat-label">Total Modul</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="ti ti-users"></i></div>
          <div className="stat-value">{students.length}</div>
          <div className="stat-label">Total Siswa</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="ti ti-user-check"></i></div>
          <div className="stat-value">{teachers.length}</div>
          <div className="stat-label">Total Guru</div>
        </div>
      </div>

      <div className="section-card shadow-sm" style={{ padding: '32px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
         <div className="section-card-title" style={{ borderBottom: 'none', marginBottom: '8px', paddingBottom: 0 }}><i className="ti ti-chart-bar"></i> Progres Siswa Berdasarkan Jenjang</div>
         <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>Distribusi penyelesaian modul siswa pada tiap tingkat pendidikan.</p>
         <div style={{ width: '100%', height: 350 }}>
           <ResponsiveContainer>
             <BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(13, 71, 161, 0.08)" />
               <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12, fontWeight: 500}} dy={10} />
               <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12, fontWeight: 500}} />
               <Tooltip cursor={{fill: 'var(--surface-2)', opacity: 0.5}} contentStyle={{borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', padding: '12px 16px', fontWeight: 500}} />
               <Bar dataKey="Selesai" fill="var(--success)" radius={[4, 4, 0, 0]} barSize={32} />
               <Bar dataKey="Aktif" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={32} />
               <Bar dataKey="BelumMulai" name="Belum Mulai" fill="#CBD5E1" radius={[4, 4, 0, 0]} barSize={32} />
             </BarChart>
           </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
}
