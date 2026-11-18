export const getWheelScrollDelta = (event, list) => {
  const rawDelta =
    Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.deltaY;

  if (event.deltaMode === 1) return rawDelta * 32;
  if (event.deltaMode === 2) return rawDelta * list.clientWidth;

  return rawDelta;
};

export const createSmoothScroll = (applyDelta, view = window) => {
  const reducedMotion = view.matchMedia("(prefers-reduced-motion: reduce)");
  let pendingDelta = 0;
  let frameId = null;
  let lastTime = 0;

  const cancel = () => {
    if (frameId !== null) view.cancelAnimationFrame(frameId);
    frameId = null;
    pendingDelta = 0;
  };

  const step = (time) => {
    const elapsed = Math.min(64, Math.max(0, time - lastTime));
    lastTime = time;

    // Ease toward the accumulated wheel input independently of the frame rate.
    const delta = reducedMotion.matches || Math.abs(pendingDelta) < 0.25
      ? pendingDelta
      : pendingDelta * (1 - Math.exp(-elapsed / 100));

    pendingDelta -= delta;
    applyDelta(delta);
    frameId = pendingDelta === 0 ? null : view.requestAnimationFrame(step);
  };

  return {
    scrollBy(delta) {
      if (!Number.isFinite(delta) || delta === 0) return;

      if (reducedMotion.matches) {
        cancel();
        applyDelta(delta);
        return;
      }

      // A direction change should respond immediately instead of fighting momentum.
      if (pendingDelta * delta < 0) pendingDelta = 0;
      pendingDelta += delta;

      if (frameId === null) {
        lastTime = view.performance.now();
        frameId = view.requestAnimationFrame(step);
      }
    },
    cancel,
  };
};
