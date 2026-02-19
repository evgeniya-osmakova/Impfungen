declare module '*.svg' {
  import type { FC, SVGProps } from 'react';

  const ReactComponent: FC<SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
