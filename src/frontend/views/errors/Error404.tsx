import React from 'react';
import { ErrorLayout } from './ErrorLayout';

export function Error404() {
  return <ErrorLayout title="404 Not Found" desc="Halaman atau data yang Anda cari tidak ditemukan." icon="ti-error-404" />;
}
