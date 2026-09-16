import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Game } from '../../types';
import { useSimulationLoader } from '../hooks/useSimulationLoader';

export function SimulationPlayerView({
  game,
  onBack
}: {
  game: Game;
  onBack: () => void;
}) {
  const { downloadingGame, downloadProgress, localGameSrc, error, loadSimulation } = useSimulationLoader();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSimulation(game);
  }, [game, loadSimulation]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="page active" style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
      {/* Top Navigation Bar */}
      {!isFullscreen && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: '#1e293b', borderBottom: '1px solid #334155' }}>
          <button 
            onClick={onBack}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: '#e2e8f0', cursor: 'pointer', fontSize: '15px', fontWeight: 600 }}
          >
            <i className="ti ti-arrow-left" style={{ fontSize: '20px' }}></i>
            Kembali
          </button>
          
          <h2 style={{ margin: 0, fontSize: '16px', color: '#f8fafc', fontWeight: 600 }}>
            {game.title}
          </h2>
          
          <button 
            onClick={toggleFullscreen}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#3b82f6', border: 'none', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 600, padding: '8px 16px', borderRadius: '8px' }}
          >
            <i className="ti ti-maximize"></i>
            Fullscreen
          </button>
        </div>
      )}

      {/* Main Player Area */}
      <div 
        ref={containerRef}
        style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', overflow: 'hidden' }}
      >
        {isFullscreen && (
          <button
            onClick={toggleFullscreen}
            style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 100, background: 'rgba(15, 23, 42, 0.7)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '14px', padding: '8px 12px', borderRadius: '6px', backdropFilter: 'blur(4px)' }}
          >
            <i className="ti ti-minimize"></i> Keluar Fullscreen
          </button>
        )}

        {downloadingGame ? (
          <div style={{ textAlign: 'center', color: '#94a3b8' }}>
            <div className="spinner" style={{ width: '48px', height: '48px', border: '4px solid #334155', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
            <h3 style={{ margin: '0 0 8px 0', color: '#f8fafc' }}>Mempersiapkan Simulasi</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>{downloadProgress}</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', color: '#ef4444', maxWidth: '400px', padding: '24px', background: '#450a0a', borderRadius: '12px' }}>
            <i className="ti ti-alert-triangle" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
            <h3 style={{ margin: '0 0 8px 0', color: '#f8fafc' }}>Gagal Memuat</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#fca5a5' }}>{error}</p>
            <button 
              onClick={() => loadSimulation(game)}
              style={{ marginTop: '20px', background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
            >
              Coba Lagi
            </button>
          </div>
        ) : localGameSrc ? (
          <iframe
            src={localGameSrc}
            title={game.title}
            style={{ width: '100%', height: '100%', border: 'none', display: 'block', backgroundColor: '#fff' }}
            allowFullScreen
            allow="autoplay; fullscreen; xr-spatial-tracking; execution-while-not-rendered; execution-while-out-of-viewport;"
          ></iframe>
        ) : null}
      </div>
    </div>
  );
}
