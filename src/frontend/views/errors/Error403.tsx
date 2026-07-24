import React from 'react';
import { ErrorLayout } from './ErrorLayout';

export function Error403() {
  return <ErrorLayout title="403 Forbidden" desc="Akses ditolak. Anda tidak diizinkan mengakses halaman ini." icon="ti-shield-lock" />;
}
