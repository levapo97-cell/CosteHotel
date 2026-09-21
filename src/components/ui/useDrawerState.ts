import { useState } from 'react';

// `session` remonta el formulario en cada apertura para que empiece limpio; `payload` se
// conserva al cerrar para que el panel no cambie de contenido durante la animación de salida.
export function useDrawerState<T>() {
  const [state, setState] = useState<{ open: boolean; payload?: T; session: number }>({ open: false, session: 0 });

  const show = (payload?: T) => setState((current) => ({ open: true, payload, session: current.session + 1 }));
  const close = () => setState((current) => ({ ...current, open: false }));

  return { ...state, show, close };
}

export type DrawerControl<T> = ReturnType<typeof useDrawerState<T>>;
