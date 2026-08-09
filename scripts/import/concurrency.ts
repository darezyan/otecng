// Minimal concurrency limiter (no external dep) so the import script doesn't
// run hundreds of sequential network round-trips one at a time.
export function pLimit(concurrency: number) {
  let active = 0;
  const queue: (() => void)[] = [];

  const next = () => {
    active--;
    const fn = queue.shift();
    if (fn) fn();
  };

  return function <T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const run = () => {
        active++;
        fn().then(
          (value) => {
            resolve(value);
            next();
          },
          (err) => {
            reject(err);
            next();
          }
        );
      };
      if (active < concurrency) run();
      else queue.push(run);
    });
  };
}
