import { type PropsWithChildren, useEffect } from 'react';
import { useStore } from 'src/state';

export const AppInitializer = ({ children }: PropsWithChildren) => {
  const isError = useStore((state) => state.isError);
  const isLoaded = useStore((state) => state.isLoaded);
  const loadStore = useStore((state) => state.loadStore);

  useEffect(() => {
    void loadStore();
  }, [loadStore]);

  if (isError) {
    return <div>Error occurred. Please try again.</div>;
  }

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};
