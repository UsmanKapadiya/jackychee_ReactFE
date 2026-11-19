import { useEffect, useState } from 'react';

/** Load data from the API with loading / error state; aborts when the component unmounts. */
export function useApi(loader, deps) {
  const [state, setState] = useState({ data: null, error: null, loading: true });

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    loader(controller.signal)
      .then((data) => setState({ data, error: null, loading: false }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ data: null, error, loading: false });
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

/** Number of masonry columns - same breakpoints as the old "cheez" theme. */
export function useColumns() {
  const calc = () => {
    const w = window.innerWidth;
    if (w >= 1237) return 5;
    if (w >= 671) return 3;
    return 2;
  };
  const [cols, setCols] = useState(calc);
  useEffect(() => {
    const onResize = () => setCols(calc());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return cols;
}

export function useDocumentTitle(title, siteName = 'Jacky Chee') {
  useEffect(() => {
    document.title = title ? `${title} | ${siteName}` : siteName;
  }, [title, siteName]);
}
