export function cssAddIf(cond: boolean, cname: string): string {
  return cond ? ' ' + cname : '';
}
