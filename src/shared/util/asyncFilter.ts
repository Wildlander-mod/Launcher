// An async version of array filter
// Taken from: https://stackoverflow.com/a/46842181/3379536
export async function asyncFilter<T>(
  arr: T[],
  callback: (item: T) => Promise<T[]>
) {
  const fail = Symbol();
  return (
    await Promise.all(
      arr.map(async (item) => ((await callback(item)) ? item : fail))
    )
  ).filter((i) => i !== fail);
}
