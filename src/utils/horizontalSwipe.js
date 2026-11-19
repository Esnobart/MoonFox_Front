export const attachHorizontalSwipe = (viewport, { onStart, onMove, onEnd }) => {
  const view = viewport.ownerDocument.defaultView;
  let gesture = null;
  let suppressClick = false;

  const finishGesture = () => {
    if (!gesture) return;
    gesture = null;
    onEnd();
  };

  const handlePointerDown = (event) => {
    suppressClick = false;
    if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
    if (!event.isPrimary || event.button !== 0) {
      finishGesture();
      return;
    }

    gesture = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      horizontal: false,
    };
    onStart();
  };

  const handlePointerMove = (event) => {
    if (!gesture || event.pointerId !== gesture.pointerId) return;

    if (!gesture.horizontal) {
      const deltaX = event.clientX - gesture.startX;
      const deltaY = event.clientY - gesture.startY;
      if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 8) return;

      if (Math.abs(deltaY) >= Math.abs(deltaX)) {
        finishGesture();
        return;
      }

      gesture.horizontal = true;
      suppressClick = true;
    }

    event.preventDefault();
    onMove(gesture.lastX - event.clientX);
    gesture.lastX = event.clientX;
  };

  const handlePointerEnd = (event) => {
    if (gesture?.pointerId === event.pointerId) finishGesture();
  };

  const handleClick = (event) => {
    if (!suppressClick || event.detail === 0) return;
    suppressClick = false;
    event.preventDefault();
    event.stopPropagation();
  };

  viewport.addEventListener("pointerdown", handlePointerDown);
  view.addEventListener("pointermove", handlePointerMove, { passive: false });
  view.addEventListener("pointerup", handlePointerEnd);
  view.addEventListener("pointercancel", handlePointerEnd);
  view.addEventListener("blur", finishGesture);
  viewport.addEventListener("click", handleClick, true);

  return () => {
    finishGesture();
    viewport.removeEventListener("pointerdown", handlePointerDown);
    view.removeEventListener("pointermove", handlePointerMove);
    view.removeEventListener("pointerup", handlePointerEnd);
    view.removeEventListener("pointercancel", handlePointerEnd);
    view.removeEventListener("blur", finishGesture);
    viewport.removeEventListener("click", handleClick, true);
  };
};
