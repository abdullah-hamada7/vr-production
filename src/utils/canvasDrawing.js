// Clinical-grade skeletal drawing
// Green lines (#34C759) and Red dots (#FF3B30) for precision feel

const COLORS = {
  CONNECTOR: '#34C759', // Clinical Green
  LANDMARK: '#FF3B30',  // Clinical Red
  GLOW: 'rgba(52, 199, 89, 0.3)'
};

let previousLandmarks = null;

export const setSkeletonColor = () => {
  // Legacy function kept for compatibility, but we now use fixed clinical colors
};

export const drawSkeleton = (ctx, landmarks, POSE_CONNECTIONS, forceRedraw = false) => {
  if (!ctx || !landmarks || !window.drawConnectors || !window.drawLandmarks) return;

  // Redraw every frame for clinical smoothness
  ctx.save();
  
  // 1. Draw Connectors (Green Lines)
  window.drawConnectors(ctx, landmarks, POSE_CONNECTIONS, {
    color: COLORS.CONNECTOR,
    lineWidth: 3
  });
  
  // 2. Draw Landmarks (Red Dots with subtle glow)
  ctx.shadowColor = COLORS.GLOW;
  ctx.shadowBlur = 8;
  
  window.drawLandmarks(ctx, landmarks, {
    color: COLORS.LANDMARK,
    lineWidth: 1,
    radius: 4
  });
  
  ctx.restore();
};
