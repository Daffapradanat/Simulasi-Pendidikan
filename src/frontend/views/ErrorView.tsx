import React from 'react';
import { useParams } from 'react-router-dom';
import { Error400 } from './errors/Error400';
import { Error401 } from './errors/Error401';
import { Error403 } from './errors/Error403';
import { Error404 } from './errors/Error404';
import { Error500 } from './errors/Error500';
import { Error502 } from './errors/Error502';
import { Error503 } from './errors/Error503';
import { ErrorLayout } from './errors/ErrorLayout';

export function ErrorView({ code: propCode }: { code?: number | string }) {
  const { code: paramCode } = useParams<{ code?: string }>();
  const errCode = propCode?.toString() || paramCode || "404";

  switch (errCode) {
    case "400": return <Error400 />;
    case "401": return <Error401 />;
    case "403": return <Error403 />;
    case "404": return <Error404 />;
    case "500": return <Error500 />;
    case "502": return <Error502 />;
    case "503": return <Error503 />;
    default:
      return <ErrorLayout title={`${errCode} Error`} desc="Terjadi kesalahan yang tidak diketahui." icon="ti-alert-triangle" />;
  }
}
