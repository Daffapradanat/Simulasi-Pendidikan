import React from 'react';
import { ErrorLayout } from './ErrorLayout';

export function Error400() {
  return <ErrorLayout title="400 Bad Request" desc="Permintaan tidak valid. Silakan periksa kembali input Anda." icon="ti-ban" />;
}
