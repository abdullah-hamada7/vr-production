// Helper to calculate angle between three points
export const calculateAngle = (a, b, c) => {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  return angle;
};

// Draw an arc showing the angle at a joint
export const drawAngleArc = (ctx, pointA, vertex, pointB, currentAngle, targetAngle, color = '#6366f1') => {
  const startAngle = Math.atan2(pointA.y - vertex.y, pointA.x - vertex.x);
  const endAngle = Math.atan2(pointB.y - vertex.y, pointB.x - vertex.x);

  ctx.beginPath();
  ctx.moveTo(vertex.x, vertex.y);
  ctx.arc(vertex.x, vertex.y, 40, startAngle, endAngle);
  ctx.closePath();
  
  // Fill with semi-transparent color
  ctx.fillStyle = currentAngle <= targetAngle ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.2)';
  ctx.fill();
  
  // Draw the border
  ctx.strokeStyle = currentAngle <= targetAngle ? '#10b981' : color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw the text
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px Inter';
  ctx.fillText(`${Math.round(currentAngle)}°`, vertex.x + 45, vertex.y);
};
