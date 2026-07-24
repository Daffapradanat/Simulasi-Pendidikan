import React from 'react';
import { ErrorLayout } from './ErrorLayout';

export function Error503() {
  return <ErrorLayout title="503 Service Unavailable" desc="Layanan sedang tidak tersedia atau dalam pemeliharaan. Silakan coba kembali nanti." icon="ti-settings-x" />;
}
