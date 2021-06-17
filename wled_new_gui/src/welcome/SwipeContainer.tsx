/* eslint-disable react-hooks/exhaustive-deps */
import { JSX } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

// const SPEED = 1000;

// interface Props {
//   soft: boolean;
//   children: any;
//   currentPage: number;
//   totalPage: number;
//   onChange: (n: number) => void;
// }

// let iSlide = 0;
// let x0: number = 0;
// let scrollS = 0;
// let locked = false;
const w = 800;
// const N = 4;

function isTouchEvent(e: TouchEvent | MouseEvent): e is TouchEvent {
  return (e as TouchEvent).changedTouches !== undefined;
}

function unify(e: TouchEvent | MouseEvent) {
  return isTouchEvent(e) ? e.changedTouches[0] : e;
}

export function Swipey(props: {
  children: JSX.Element | JSX.Element[];
  enabled: boolean;
  page: number;
  onPageChange: (p: number) => void;
}): JSX.Element {
  const N = Array.isArray(props.children) ? props.children.length : 1;
  // const [page, setPage] = useState(props.page);
  const page = props.page;
  const [locked, setLocked] = useState(false);
  const [lockPos, setLockPos] = useState(0);
  const [speed, setSpeed] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  function lock(e: MouseEvent | TouchEvent) {
    if (!props.enabled) return;
    // const _C = containerRef.current;

    const he = (e.target as HTMLElement);

    if (he.matches('.noslide') || he.matches('.noslide *')) return;

    setLockPos(unify(e).clientX);
    //   scrollS = d.getElementsByClassName("tabcontent")[iSlide].scrollTop;

    setLocked(true);
    // _C.classList.toggle("smooth", !(locked = true));
  }

  const move = (e: MouseEvent | TouchEvent) => {
    if (!locked || !props.enabled) return;
    // const _C = containerRef.current;

    const clientX = unify(e).clientX;
    const dx = clientX - lockPos;
    const s = Math.sign(dx);
    let f = +((s * dx) / w).toFixed(2);

    // console.log(
    //   `swipe move clientx ${clientX} dx ${dx} s ${s} f ${f} page ${page}`
    // );
    if (
      clientX != 0 &&
      (page > 0 || s < 0) &&
      (page < N - 1 || s > 0) &&
      f > 0.12 //&&
      // d.getElementsByClassName("tabcontent")[iSlide].scrollTop == scrollS
    ) {
      const newPage = page - s;
      // setPage(newPage);
      props.onPageChange?.(newPage);
      // _C.style.setProperty("--i", (iSlide -= s).toString());
      f = 1 - f;
      // updateTablinks(iSlide);
    }
    setSpeed(f);
    // _C.style.setProperty("--f", f.toString());
    setLocked(false);
    setLockPos(0);
    // _C.classList.toggle("smooth", !(locked = false));
    // x0 = 0;
  };
  useEffect(() => {
    if (containerRef.current) {
      const c = containerRef.current;
      const opts = { passive: true, capture: false };
      c.addEventListener('mousedown', lock, opts);
      c.addEventListener('touchstart', lock, opts);

      c.addEventListener('mouseout', move, opts);
      c.addEventListener('mouseup', move, opts);
      c.addEventListener('touchend', move, opts);
      return () => {
        c.removeEventListener('mousedown', lock, opts);
        c.removeEventListener('touchstart', lock, opts);

        c.removeEventListener('mouseout', move, opts);
        c.removeEventListener('mouseup', move, opts);
        c.removeEventListener('touchend', move, opts);
      };
    }
    return;
  }, [containerRef, page, locked, lockPos, lock, move]);
  return (
    <div
      class={`contents flex-auto ${!locked ? 'smooth' : ''}`}
      ref={containerRef}
      style={{ '--n': N, '--i': page, '--f': speed }}
    >
      {props.children}
    </div>
  );
}
