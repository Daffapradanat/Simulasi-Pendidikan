import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export function ErrorView({ code: propCode }: { code?: number | string }) {
  const { code: paramCode } = useParams<{ code?: string }>();
  const errCode = propCode?.toString() || paramCode || "404";
  const navigate = useNavigate();
  
  const getErrorContent = (code: string) => {
    switch (code) {
      case "400": return { title: "400 Bad Request", desc: "Permintaan tidak valid atau format salah.", icon: "ti-alert-circle" };
      case "401": return { title: "401 Unauthorized", desc: "Anda harus login untuk mengakses halaman ini.", icon: "ti-lock" };
      case "403": return { title: "403 Forbidden", desc: "Anda tidak memiliki izin untuk mengakses halaman ini.", icon: "ti-shield-lock" };
      case "404": return { title: "404 Not Found", desc: "Halaman atau data yang Anda cari tidak ditemukan.", icon: "ti-error-404" };
      case "500": return { title: "500 Server Error", desc: "Terjadi kesalahan pada server. Silakan coba lagi nanti.", icon: "ti-server" };
      case "502": return { title: "502 Bad Gateway", desc: "Gateway buruk, server tidak dapat memproses permintaan.", icon: "ti-server-off" };
      case "503": return { title: "503 Service Unavailable", desc: "Layanan saat ini tidak tersedia atau sedang pemeliharaan.", icon: "ti-settings" };
      default: return { title: `${code} Error`, desc: "Terjadi kesalahan yang tidak diketahui.", icon: "ti-alert-triangle" };
    }
  }

  const { title, desc, icon } = getErrorContent(errCode);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px', textAlign: 'center', backgroundColor: 'var(--bg)' }}>
      <div style={{ fontSize: '80px', color: 'var(--text-muted)', marginBottom: '24px' }}>
        <i className={`ti ${icon}`}></i>
      </div>
      <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px', color: 'var(--text)' }}>{title}</h1>
      <p style={{ fontSize: '18px', color: 'var(--text-muted)', maxWidth: '500px', marginBottom: '32px', lineHeight: 1.6 }}>{desc}</p>
      <button className="btn btn-primary" onClick={() => navigate('/')}>
        <i className="ti ti-home" style={{ marginRight: '8px' }}></i> Kembali ke Beranda
      </button>
    </div>
  );
}
