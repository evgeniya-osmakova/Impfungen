import { useCounterStore } from './store/counterStore';
import { Button, Separator } from './ui';

import styles from './App.module.css';

const App = () => {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);
  const reset = useCounterStore((state) => state.reset);

  return (
    <main className={styles.app}>
      <section className={styles['app__card']}>
        <h1 className={styles['app__title']}>React 19 + Vite + TypeScript</h1>
        <p className={styles['app__description']}>
          Каркас с Zustand, Vitest, ESLint 10, Biome, Radix UI Primitives и CSS Modules.
        </p>
        <p className={styles['app__counter']}>Текущее значение: {count}</p>
        <Separator className={styles['app__separator']} decorative />
        <div className={styles['app__controls']}>
          <Button variant="primary" onClick={increment}>
            Увеличить
          </Button>
          <Button variant="secondary" onClick={decrement}>
            Уменьшить
          </Button>
          <Button variant="danger" onClick={reset}>
            Сбросить
          </Button>
        </div>
      </section>
    </main>
  );
};

export default App;
