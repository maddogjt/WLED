export function shallowEqual<ObjLike extends Record<string, unknown>>(
  a: ObjLike,
  b: ObjLike
): boolean {
  if (Object.is(a, b)) return true;
  if (!a || !b) return false;

  const aK = Object.keys(a);
  const bK = Object.keys(b);

  if (aK.length !== bK.length) return false;
  const hok = Object.prototype.hasOwnProperty.bind(b);
  for (const key in a) {
    if (a[key] !== b[key] || !hok(key)) return false;
  }
  return true;
}
