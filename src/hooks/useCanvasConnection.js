import { useState, useCallback } from 'react'
import { generateId } from '../utils/ids'

/**
 * Hook for managing canvas connection drawing.
 * Extracts connection logic from WorkflowCanvas for reusability.
 */
export function useCanvasConnection({
  connections,
  onSaveConnections,
  screenToCanvas,
  canvasRef,
  isExecuting,
}) {
  const [connectingFrom, setConnectingFrom] = useState(null)
  const [tempConnectionEnd, setTempConnectionEnd] = useState(null)

  const handleStartConnect = useCallback(
    (nodeId) => {
      if (isExecuting) return
      setConnectingFrom(nodeId)
    },
    [isExecuting]
  )

  const handleEndConnect = useCallback(
    (nodeId) => {
      if (!connectingFrom || connectingFrom === nodeId) {
        setConnectingFrom(null)
        setTempConnectionEnd(null)
        return
      }

      const exists = connections.some(
        (c) => c.from === connectingFrom && c.to === nodeId
      )
      if (!exists) {
        const newConn = {
          id: generateId(),
          from: connectingFrom,
          to: nodeId,
        }
        onSaveConnections([...connections, newConn])
      }

      setConnectingFrom(null)
      setTempConnectionEnd(null)
    },
    [connectingFrom, connections, onSaveConnections]
  )

  const handleConnectionMove = useCallback(
    (event) => {
      if (!connectingFrom) return false

      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return false

      const screenX = event.clientX - rect.left
      const screenY = event.clientY - rect.top
      const canvas = screenToCanvas(screenX, screenY)
      setTempConnectionEnd({ x: canvas.x, y: canvas.y })
      return true
    },
    [connectingFrom, screenToCanvas, canvasRef]
  )

  const handleConnectionEnd = useCallback(() => {
    if (connectingFrom) {
      setConnectingFrom(null)
      setTempConnectionEnd(null)
    }
  }, [connectingFrom])

  const handleDeleteConnection = useCallback(
    (connection) => {
      if (isExecuting) return
      const updatedConns = connections.filter((c) => c.id !== connection.id)
      onSaveConnections(updatedConns)
    },
    [connections, isExecuting, onSaveConnections]
  )

  return {
    connectingFrom,
    tempConnectionEnd,
    handleStartConnect,
    handleEndConnect,
    handleConnectionMove,
    handleConnectionEnd,
    handleDeleteConnection,
  }
}
