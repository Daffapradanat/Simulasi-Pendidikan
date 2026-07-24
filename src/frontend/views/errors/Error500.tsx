import React from 'react';
import { ErrorLayout } from './ErrorLayout';

export function Error500() {
  return <ErrorLayout title="500 Internal Server Error" desc="Terjadi kesalahan pada server kami. Silakan coba beberapa saat lagi." icon="ti-server" />;
}
