import React from 'react';
import { ErrorLayout } from './ErrorLayout';

export function Error401() {
  return <ErrorLayout title="401 Unauthorized" desc="Anda tidak memiliki akses. Silakan login terlebih dahulu." icon="ti-lock" />;
}
