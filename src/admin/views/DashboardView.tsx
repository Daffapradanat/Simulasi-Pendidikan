import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardView({ modules, students, teachers, user }: { modules: any[], students: any[], teachers: any[], user: any }) {
  const [activities, setActivities] = useState<any[]>([]);
  const [showAllActivities, setShowAllActivities] = useState(false);

  useEffect(() => {
    fetch('/api/activities')
      .then(res => res.json())
      .then(data => setActivities(data || []))
      .catch(e => console.error(e));
  }, [modules, students, teachers]);

  const getTimeAgo = (dateStr: string) => {
    const s = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (s < 60) return 'Baru saja';
    if (s < 3600) return `${Math.floor(s / 60)}mnt lalu`;
    if (s < 86400) return `${Math.floor(s / 3600)}jam lalu`;
    return `${Math.floor(s / 86400)}h lalu`;
  };

  const chartData = React.useMemo(() => {

    const data = {
      SD: { name: 'SD', Selesai: 0, Aktif: 0, BelumMulai: 0 },
      SMP: { name: 'SMP', Selesai: 0, Aktif: 0, BelumMulai: 0 },
      SMA: { name: 'SMA', Selesai: 0, Aktif: 0, BelumMulai: 0 },
      Umum: { name: 'Umum', Selesai: 0, Aktif: 0, BelumMulai: 0 }
    };
    
    students.forEach(s => {
      if (s.isDeleted) return;
      
      let level = 'Umum';
      const sekolah = (s.asalSekolah || '').toUpperCase();
      if (sekolah.includes('SD ') || sekolah.startsWith('SDN') || sekolah.includes('SDN ')) level = 'SD';
      else if (sekolah.includes('SMP')) level = 'SMP';
      else if (sekolah.includes('SMA') || sekolah.includes('SMK') || sekolah.includes('SMU')) level = 'SMA';
      
      const p = s.progress || 0;
      if (p === 100) data[level as keyof typeof data].Selesai++;
      else if (p > 0) data[level as keyof typeof data].Aktif++;
      else data[level as keyof typeof data].BelumMulai++;
    });
    
    return [data.SD, data.SMP, data.SMA, data.Umum];
  }, [students]);

  const totalModul = modules.filter(m => !m.isDeleted).length;
  const totalSiswa = students.filter(s => !s.isDeleted).length;
  const totalGuru = teachers.filter(t => !t.isDeleted).length;
  const totalSelesai = students.filter(s => !s.isDeleted && s.progress === 100).length;

  return (
    <div className="admin-content" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Welcome Banner */}
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px', background: 'linear-gradient(to right, var(--primary-dark), var(--primary))', color: 'white', padding: '32px', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', fontFamily: 'var(--font-display)' }}>Selamat Datang, {user?.role === 'admin' ? 'Admin' : 'Guru'} {user?.name}!</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', maxWidth: '600px', fontSize: '15px' }}>
              Berikut adalah ringkasan statistik dan progres pembelajaran terkini. Kelola modul, siswa, dan instruktur dengan efisien di sini.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)', borderRadius: '12px' }}>
            <i className="ti ti-dashboard" style={{ fontSize: '40px', color: '#BBDEFB' }}></i>
          </div>
        </div>
        <div style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(20%, -30%)', opacity: 0.1 }}>
          <i className="ti ti-school" style={{ fontSize: '250px' }}></i>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
        <div className="stat-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: '#E3F2FD', color: 'var(--primary)', fontSize: '24px', flexShrink: 0 }}>
            <i className="ti ti-books"></i>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>Total Modul</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{totalModul}</div>
          </div>
        </div>
        
        <div className="stat-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: '#E8EAF6', color: '#3F51B5', fontSize: '24px', flexShrink: 0 }}>
            <i className="ti ti-users"></i>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>Total Siswa</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{totalSiswa}</div>
          </div>
        </div>

        <div className="stat-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: '#FFF3E0', color: '#FF9800', fontSize: '24px', flexShrink: 0 }}>
            <i className="ti ti-user-check"></i>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>Total Guru</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{totalGuru}</div>
          </div>
        </div>

        <div className="stat-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: '#E8F5E9', color: '#4CAF50', fontSize: '24px', flexShrink: 0 }}>
            <i className="ti ti-certificate"></i>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>Siswa Lulus</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{totalSelesai}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', alignItems: 'start' }}>
        {/* Chart Section */}
        <div className="section-card shadow-sm" style={{ padding: '24px', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="ti ti-chart-bar" style={{ color: 'var(--primary)' }}></i> Progres Siswa Berdasarkan Jenjang
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>Distribusi penyelesaian modul siswa pada tiap tingkat pendidikan.</p>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--success)' }}></span><span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>Selesai</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)' }}></span><span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>Aktif</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#CBD5E1' }}></span><span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>Belum Mulai</span></div>
            </div>
          </div>
          <div style={{ width: '100%', height: '350px' }}>
             <ResponsiveContainer>
               <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 600}} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 500}} />
                 <Tooltip cursor={{fill: 'var(--surface)'}} contentStyle={{borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', padding: '16px', fontWeight: 600}} />
                 <Bar dataKey="Selesai" fill="var(--success)" radius={[6, 6, 0, 0]} barSize={32} />
                 <Bar dataKey="Aktif" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={32} />
                 <Bar dataKey="BelumMulai" name="Belum Mulai" fill="#CBD5E1" radius={[6, 6, 0, 0]} barSize={32} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Info & Activity Grid underneath */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', gridColumn: '1 / -1' }}>
          
          {/* Recent Activity History */}
          <div className="section-card shadow-sm" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="ti ti-history" style={{ color: '#00ACC1' }}></i> History Aktivitas
              </h3>
            </div>
            <div style={{ padding: '20px 24px', flex: 1, maxHeight: '300px', overflowY: 'auto' }}>
              {activities.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
                  <i className="ti ti-ghost" style={{ fontSize: '32px', marginBottom: '8px', display: 'block', color: 'var(--border)' }}></i>
                  Belum ada aktivitas terekam.
                </div>
              ) : activities.slice(0, showAllActivities ? activities.length : 10).map((activity, i) => {
                const isLast = i === Math.min(activities.length, showAllActivities ? activities.length : 10) - 1;
                return (
                <div key={activity.id} style={{ display: 'flex', gap: '16px', marginBottom: isLast ? 0 : '16px', position: 'relative' }}>
                  {!isLast && <div style={{ position: 'absolute', top: '30px', left: '15px', bottom: '-20px', width: '2px', background: 'var(--border)' }}></div>}
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', background: 'var(--surface)', border: '2px solid var(--border-dark)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, color: 'var(--text-muted)' 
                  }}>
                    <i className={`ti ti-${activity.action === 'login' ? 'login' : activity.action === 'module' ? 'book' : activity.action === 'student' ? 'user' : activity.action === 'teacher' ? 'user-check' : 'device-gamepad'}`} style={{ fontSize: '16px' }}></i>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <strong style={{ fontSize: '14px', color: 'var(--text)' }}>{activity.user}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-light)', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: '100px' }}>{getTimeAgo(activity.time)}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>{activity.desc}</p>
                  </div>
                </div>
              )})}
            </div>
            {activities.length > 10 && (
              <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border)', background: 'var(--white)', textAlign: 'center' }}>
                <button 
                  className="btn btn-ghost btn-sm" 
                  style={{ fontSize: '13px', width: '100%' }}
                  onClick={() => setShowAllActivities(!showAllActivities)}
                >
                  {showAllActivities ? 'Sembunyikan Sebagian History' : 'Lihat Semua History'}
                </button>
              </div>
            )}
          </div>
          
          {/* Quick Insights Placeholder */}
          <div className="section-card shadow-sm" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
               <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <i className="ti ti-bulb" style={{ color: '#FBC02D' }}></i> Insight Kinerja
               </h3>
            </div>
            <div style={{ padding: '32px 24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: 'var(--white)' }}>
               <div style={{ width: '80px', height: '80px', background: '#FFF8E1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: '1px solid #FFE082' }}>
                 <i className="ti ti-rocket" style={{ color: '#F57F17', fontSize: '36px' }}></i>
               </div>
               <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>
                 Performa {(totalSiswa > 0 ? Math.round((totalSelesai/totalSiswa)*100) : 0)}%
               </div>
               <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '250px', margin: '0 0 24px 0' }}>
                  Rasio kelulusan siswa cukup baik bertumpu pada materi saat ini.
               </p>
               <button className="btn btn-primary" style={{ padding: '10px 20px' }}>Lihat Detail Analisis</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

