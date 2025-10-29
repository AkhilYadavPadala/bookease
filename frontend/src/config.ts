// Centralized API base URL for frontend
// Priority: VITE_API_BASE > dev localhost > same-origin (for deployments behind reverse proxy)
export const API_BASE: string =
  (import.meta as any).env?.VITE_API_BASE
  || (typeof window !== 'undefined'
      ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
          ? 'http://localhost:3000'
          : window.location.origin.replace(/\/$/, ''))
      : 'http://localhost:3000');


