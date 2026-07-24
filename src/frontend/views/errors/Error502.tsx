import React from 'react';
import { ErrorLayout } from './ErrorLayout';

export function Error502() {
  return <ErrorLayout title="502 Bad Gateway" desc="Server menerima respons yang tidak valid. Silakan coba lagi nanti." icon="ti-server-off" />;
}
