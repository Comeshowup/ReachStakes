/**
 * SafeChart — Drop-in replacement for recharts' ResponsiveContainer.
 *
 * WHY: recharts' ResponsiveContainer uses an internal ResizeObserver that
 * fires setState on the component even after it unmounts. In React 19, Fiber
 * properties are frozen/read-only, so this crashes with:
 *   "Cannot assign to read only property 'lanes' of object '#<FiberNode>'"
 *
 * This component owns its own ResizeObserver and guards it with a mountedRef
 * so it is guaranteed to never fire after unmount. It then passes explicit
 * pixel dimensions directly to the chart child.
 *
 * USAGE — replace:
 *   <ResponsiveContainer width="100%" height={220}>
 *     <AreaChart ...>...</AreaChart>
 *   </ResponsiveContainer>
 *
 * with:
 *   <SafeChart height={220}>
 *     <AreaChart ...>...</AreaChart>
 *   </SafeChart>
 */
import React, { useRef, useEffect, useState } from 'react';

export default function SafeChart({ children, height = 300, className, style }) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const el = containerRef.current;
    if (!el) return;

    // Read initial dimensions synchronously to avoid a blank first paint
    const initial = el.getBoundingClientRect();
    if (initial.width > 0) setWidth(initial.width);

    const ro = new ResizeObserver((entries) => {
      // Guard: never update state after unmount (prevents React 19 FiberNode crash)
      if (!mountedRef.current) return;
      const w = entries[0]?.contentRect?.width;
      if (w > 0) setWidth(w);
    });
    ro.observe(el);

    return () => {
      mountedRef.current = false;
      ro.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height, ...style }}
    >
      {width > 0 && React.cloneElement(React.Children.only(children), { width, height })}
    </div>
  );
}
