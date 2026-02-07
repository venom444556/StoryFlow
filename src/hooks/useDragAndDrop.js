import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Reusable drag-and-drop hook for positioned elements on an SVG / canvas.
 *
 * Usage:
 * ```js
 * const { draggingId, startDrag, onMouseMove, onMouseUp } = useDragAndDrop(canvasRef);
 * ```
 *
 * - Call `startDrag(id, event, currentX, currentY)` on mousedown.
 * - Wire `onMouseMove` and `onMouseUp` to the container (or `window` via the
 *   built-in effect) so dragging continues even when the cursor leaves the
 *   element.
 * - The hook returns an updated `dragPosition` (`{ x, y }`) that the consumer
 *   can apply to the dragged element.
 *
 * @param {React.RefObject} canvasRef  ref to the SVG / container element
 * @returns {{
 *   draggingId: string|null,
 *   dragPosition: {x:number, y:number}|null,
 *   startDrag: (id:string, event:MouseEvent, currentX:number, currentY:number) => void,
 *   onMouseMove: (event:MouseEvent) => void,
 *   onMouseUp: () => void
 * }}
 */
export function useDragAndDrop(canvasRef) {
  const [draggingId, setDraggingId] = useState(null);
  const [dragPosition, setDragPosition] = useState(null);

  // Store offset in a ref so the mousemove handler always has the latest value
  // without needing it in the dependency array.
  const offsetRef = useRef({ x: 0, y: 0 });

  /**
   * Initiate a drag operation.
   *
   * @param {string} id          identifier of the element being dragged
   * @param {MouseEvent} event   the originating mouse event
   * @param {number} currentX    current x position of the element
   * @param {number} currentY    current y position of the element
   */
  const startDrag = useCallback(
    (id, event, currentX, currentY) => {
      if (event.button !== 0) return; // only primary mouse button
      event.preventDefault();

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      offsetRef.current = {
        x: event.clientX - rect.left - currentX,
        y: event.clientY - rect.top - currentY,
      };

      setDraggingId(id);
      setDragPosition({ x: currentX, y: currentY });
    },
    [canvasRef]
  );

  /**
   * Handle mouse movement while dragging.
   */
  const onMouseMove = useCallback(
    (event) => {
      if (!draggingId) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const newX = event.clientX - rect.left - offsetRef.current.x;
      const newY = event.clientY - rect.top - offsetRef.current.y;

      setDragPosition({ x: newX, y: newY });
    },
    [draggingId, canvasRef]
  );

  /**
   * End the current drag operation.
   */
  const onMouseUp = useCallback(() => {
    setDraggingId(null);
    setDragPosition(null);
  }, []);

  // Attach window-level listeners so dragging works even when the cursor
  // leaves the canvas.
  useEffect(() => {
    if (!draggingId) return;

    const handleMove = (e) => onMouseMove(e);
    const handleUp = () => onMouseUp();

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [draggingId, onMouseMove, onMouseUp]);

  return { draggingId, dragPosition, startDrag, onMouseMove, onMouseUp };
}
