import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONTS} from '../../remotion/theme';
import type {ElementProps, Position} from '../types';
import {baseTextStyle, posStyle, useElementAnimation} from './shared';

interface PhysicsProps {
  position: Position;
  props: ElementProps;
  startFrame?: number;
  durationFrames?: number;
}

export const PhysicsObject: React.FC<PhysicsProps> = ({
  position,
  props,
  startFrame = 0,
  durationFrames = 20,
}) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  const anim = useElementAnimation(startFrame, durationFrames, 'fadeIn');
  const moveX = props.velocity
    ? interpolate(local, [durationFrames, durationFrames + 60], [0, Number(props.velocity) * 3], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;
  return (
    <div
      style={{
        ...posStyle({x: position.x + moveX, y: position.y}),
        ...anim,
        width: props.width ?? 120,
        height: props.height ?? 80,
        background: props.fill ?? COLORS.secondary,
        borderRadius: 8,
        border: `2px solid ${COLORS.text}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        color: COLORS.text,
        fontFamily: FONTS.body,
      }}
    >
      {props.mass ? `${props.mass} kg` : 'm'}
    </div>
  );
};

function ArrowPrimitive({
  position,
  props,
  startFrame,
  durationFrames,
  defaultColor,
  label,
}: PhysicsProps & {defaultColor: string; label: string}) {
  const anim = useElementAnimation(startFrame ?? 0, durationFrames ?? 18, 'slideUp');
  const len = Number(props.force ?? props.velocity ?? props.acceleration ?? 80);
  const dir = props.direction ?? 'right';
  const rotations: Record<string, number> = {right: 0, left: 180, up: -90, down: 90};
  return (
    <div style={{...posStyle(position), ...anim}}>
      <div
        style={{
          transform: `rotate(${rotations[dir]}deg)`,
          transformOrigin: '0 50%',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: len,
            height: 5,
            background: props.color ?? defaultColor,
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: -10,
              top: -7,
              borderTop: '9px solid transparent',
              borderBottom: '9px solid transparent',
              borderLeft: `14px solid ${props.color ?? defaultColor}`,
            }}
          />
        </div>
      </div>
      <span style={{...baseTextStyle, fontSize: 22, color: props.color ?? defaultColor, marginTop: 8, display: 'block'}}>
        {label}
      </span>
    </div>
  );
}

export const ForceArrow: React.FC<PhysicsProps> = (p) => (
  <ArrowPrimitive {...p} defaultColor={COLORS.primary} label="F" />
);

export const VelocityArrow: React.FC<PhysicsProps> = (p) => (
  <ArrowPrimitive {...p} defaultColor={COLORS.success} label="v" />
);

export const AccelerationArrow: React.FC<PhysicsProps> = (p) => (
  <ArrowPrimitive {...p} defaultColor={COLORS.secondary} label="a" />
);

export const Trajectory: React.FC<PhysicsProps> = ({
  position,
  props,
  startFrame = 0,
  durationFrames = 60,
}) => {
  const frame = useCurrentFrame();
  const local = Math.max(0, frame - startFrame);

  // If props.progress is explicitly provided (0..1), use it; otherwise compute from local frame
  const animProgress = interpolate(local, [0, Math.max(1, durationFrames)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const progress = typeof props.progress === 'number' ? Math.min(1, Math.max(0, props.progress)) : animProgress;

  const w = Number(props.width ?? 750);
  const h = Number(props.height ?? 380);
  const x0 = 50;
  const y0 = h - 60; // Ground line
  const spanX = w - 100;
  const apexH = Math.min(y0 - 50, h * 0.62);

  // Trace the trajectory path up to current progress
  const pathPoints: string[] = [];
  const fullPathPoints: string[] = [];
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const px = x0 + t * spanX;
    const py = y0 - 4 * apexH * t * (1 - t);
    fullPathPoints.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    if (t <= progress + 0.001) {
      pathPoints.push(`${pathPoints.length === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
  }

  // Current projectile coordinates
  const currX = x0 + progress * spanX;
  const currY = y0 - 4 * apexH * progress * (1 - progress);

  // Velocity components at current progress:
  // dx/dt is constant (horizontal), dy/dt is linear (vertical, zeroes at t=0.5)
  const vxScale = 65;
  const vyRaw = -4 * apexH * (1 - 2 * progress); // negative means moving upward in SVG
  const vyNormalized = (vyRaw / (4 * apexH)) * 65;
  const vAngleRad = Math.atan2(vyNormalized, vxScale);
  const vAngleDeg = (vAngleRad * 180) / Math.PI;
  const vTotalLen = Math.sqrt(vxScale * vxScale + vyNormalized * vyNormalized);

  const showProj = props.showProjectile !== false;
  const showVel = props.showVelocity ?? true;
  const showComponents = props.showVelocityComponents ?? true;
  const showGrav = props.showGravity ?? true;
  const showApex = props.showApex ?? props.showMaximumHeight ?? true;
  const showRange = props.showRange ?? true;
  const showAngle = props.showLaunchAngle ?? true;
  const ground = props.ground !== false;

  const apexX = x0 + spanX / 2;
  const apexY = y0 - apexH;

  return (
    <div style={{...posStyle(position), width: w, height: h}}>
      <svg width={w} height={h} style={{overflow: 'visible'}}>
        <defs>
          <marker id="arrow-vel" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={COLORS.success} />
          </marker>
          <marker id="arrow-vx" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={COLORS.primary} />
          </marker>
          <marker id="arrow-vy" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#f4a300" />
          </marker>
          <marker id="arrow-grav" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#ff4d4d" />
          </marker>
        </defs>

        {/* 1. Ground and reference hashes */}
        {ground ? (
          <g>
            <line x1={20} y1={y0} x2={w - 20} y2={y0} stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
            {Array.from({length: Math.floor((w - 40) / 25)}, (_, i) => (
              <line
                key={i}
                x1={25 + i * 25}
                y1={y0}
                x2={15 + i * 25}
                y2={y0 + 10}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth={1.5}
              />
            ))}
          </g>
        ) : null}

        {/* 2. Full Ghost Trajectory Guideline (faint) */}
        <path
          d={fullPathPoints.join(' ')}
          fill="none"
          stroke="rgba(56,182,255,0.2)"
          strokeWidth={2}
          strokeDasharray="5 5"
        />

        {/* 3. Active Traced Trajectory (solid glowing curve) */}
        {pathPoints.length > 1 ? (
          <path
            d={pathPoints.join(' ')}
            fill="none"
            stroke={COLORS.primary}
            strokeWidth={3.5}
          />
        ) : null}

        {/* 4. Launch Angle θ */}
        {showAngle ? (
          <g opacity={progress > 0.05 ? 0.75 : 1}>
            <path
              d={`M ${x0 + 35} ${y0} A 35 35 0 0 0 ${x0 + 26} ${y0 - 24}`}
              fill="none"
              stroke="#f4a300"
              strokeWidth={2}
            />
            <text
              x={x0 + 44}
              y={y0 - 10}
              fill="#f4a300"
              fontSize={18}
              fontFamily={FONTS.body}
              fontWeight="bold"
            >
              θ
            </text>
          </g>
        ) : null}

        {/* 5. Apex / Maximum Height H marker */}
        {showApex && progress >= 0.45 ? (
          <g>
            <circle cx={apexX} cy={apexY} r={4.5} fill="#f4a300" />
            <line
              x1={apexX}
              y1={apexY}
              x2={apexX}
              y2={y0}
              stroke="rgba(244,163,0,0.55)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
            <text
              x={apexX + 8}
              y={(apexY + y0) / 2}
              fill="#f4a300"
              fontSize={18}
              fontFamily={FONTS.body}
              fontWeight="bold"
            >
              {props.heightLabel ?? 'H (vy = 0)'}
            </text>
          </g>
        ) : null}

        {/* 6. Horizontal Range R dimension line */}
        {showRange && progress >= 0.85 ? (
          <g>
            <line x1={x0} y1={y0 + 25} x2={x0 + spanX} y2={y0 + 25} stroke={COLORS.primary} strokeWidth={1.5} />
            <line x1={x0} y1={y0 + 16} x2={x0} y2={y0 + 34} stroke={COLORS.primary} strokeWidth={1.5} />
            <line x1={x0 + spanX} y1={y0 + 16} x2={x0 + spanX} y2={y0 + 34} stroke={COLORS.primary} strokeWidth={1.5} />
            <text
              x={x0 + spanX / 2}
              y={y0 + 44}
              textAnchor="middle"
              fill={COLORS.primary}
              fontSize={18}
              fontFamily={FONTS.body}
              fontWeight="bold"
            >
              {props.rangeLabel ?? 'Range R'}
            </text>
          </g>
        ) : null}

        {/* 7. Projectile Ball and Vectors */}
        {showProj ? (
          <g>
            {/* Projectile glowing sphere */}
            <circle
              cx={currX}
              cy={currY}
              r={10}
              fill="#38b6ff"
              stroke="#ffffff"
              strokeWidth={2}
              style={{filter: 'drop-shadow(0 0 8px rgba(56,182,255,0.8))'}}
            />

            {/* Instantaneous Tangent Velocity Vector v */}
            {showVel ? (
              <g>
                <line
                  x1={currX}
                  y1={currY}
                  x2={currX + Math.cos(vAngleRad) * Math.min(vTotalLen, 70)}
                  y2={currY + Math.sin(vAngleRad) * Math.min(vTotalLen, 70)}
                  stroke={COLORS.success}
                  strokeWidth={3}
                  markerEnd="url(#arrow-vel)"
                />
                <text
                  x={currX + Math.cos(vAngleRad) * 78}
                  y={currY + Math.sin(vAngleRad) * 78}
                  fill={COLORS.success}
                  fontSize={18}
                  fontFamily={FONTS.body}
                  fontWeight="bold"
                >
                  v
                </text>
              </g>
            ) : null}

            {/* Resolved Horizontal Component vx (constant) */}
            {showComponents ? (
              <g>
                <line
                  x1={currX}
                  y1={currY}
                  x2={currX + vxScale}
                  y2={currY}
                  stroke={COLORS.primary}
                  strokeWidth={2.5}
                  markerEnd="url(#arrow-vx)"
                />
                <text
                  x={currX + vxScale + 8}
                  y={currY + 5}
                  fill={COLORS.primary}
                  fontSize={16}
                  fontFamily={FONTS.body}
                  fontWeight="bold"
                >
                  vx
                </text>

                {/* Resolved Vertical Component vy(t) */}
                {Math.abs(vyNormalized) > 4 ? (
                  <g>
                    <line
                      x1={currX}
                      y1={currY}
                      x2={currX}
                      y2={currY + vyNormalized}
                      stroke="#f4a300"
                      strokeWidth={2.5}
                      markerEnd="url(#arrow-vy)"
                    />
                    <text
                      x={currX - 24}
                      y={currY + vyNormalized + (vyNormalized < 0 ? -6 : 14)}
                      fill="#f4a300"
                      fontSize={16}
                      fontFamily={FONTS.body}
                      fontWeight="bold"
                    >
                      vy
                    </text>
                  </g>
                ) : null}
              </g>
            ) : null}

            {/* Downward Gravity Vector g */}
            {showGrav ? (
              <g>
                <line
                  x1={currX}
                  y1={currY + 12}
                  x2={currX}
                  y2={currY + 56}
                  stroke="#ff4d4d"
                  strokeWidth={2.5}
                  markerEnd="url(#arrow-grav)"
                />
                <text
                  x={currX + 8}
                  y={currY + 48}
                  fill="#ff4d4d"
                  fontSize={15}
                  fontFamily={FONTS.body}
                  fontWeight="bold"
                >
                  g ↓
                </text>
              </g>
            ) : null}
          </g>
        ) : null}
      </svg>
    </div>
  );
};

export const Wave: React.FC<PhysicsProps> = ({position, props, startFrame = 0, durationFrames = 60}) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  const amp = Number(props.amplitude ?? 40);
  const freq = Number(props.frequency ?? 2);
  const phase = local * 0.15;
  const pts: string[] = [];
  for (let x = 0; x <= 500; x += 4) {
    const y = 100 + amp * Math.sin((x / 500) * Math.PI * freq * 2 + phase);
    pts.push(`${x === 0 ? 'M' : 'L'} ${x} ${y}`);
  }
  const opacity = interpolate(local, [0, 15], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <svg style={{...posStyle(position), opacity}} width={500} height={200}>
      <path d={pts.join(' ')} fill="none" stroke={COLORS.secondary} strokeWidth={3} />
    </svg>
  );
};

export const Particle: React.FC<PhysicsProps> = ({position, props, startFrame = 0, durationFrames = 30}) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  const progress = interpolate(local, [0, durationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        ...posStyle({x: position.x + progress * 300, y: position.y - Math.sin(progress * Math.PI) * 80}),
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: props.color ?? COLORS.primary,
        boxShadow: `0 0 12px ${props.color ?? COLORS.primary}`,
      }}
    />
  );
};

export const Spring: React.FC<PhysicsProps> = ({position, props, startFrame = 0, durationFrames = 40}) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  const compress = interpolate(local, [0, durationFrames / 2, durationFrames], [0, 30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const coils = 8;
  const w = 200 - compress;
  const path: string[] = [`M 0 20`];
  for (let i = 0; i <= coils; i++) {
    const x = (i / coils) * w;
    const y = i % 2 === 0 ? 10 : 30;
    path.push(`L ${x} ${y}`);
  }
  const opacity = interpolate(local, [0, 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <svg style={{...posStyle(position), opacity}} width={220} height={40}>
      <path d={path.join(' ')} fill="none" stroke={COLORS.textMuted} strokeWidth={3} />
    </svg>
  );
};

export const CircuitElement: React.FC<PhysicsProps> = ({position, props, startFrame = 0, durationFrames = 20}) => {
  const anim = useElementAnimation(startFrame, durationFrames, 'fadeIn');
  return (
    <svg style={{...posStyle(position), ...anim}} width={300} height={120}>
      <rect x={20} y={40} width={60} height={40} fill={COLORS.panel} stroke={COLORS.secondary} strokeWidth={2} />
      <text x={50} y={66} textAnchor="middle" fill={COLORS.text} fontSize={16} fontFamily={FONTS.body}>
        {props.label ?? 'R'}
      </text>
      <line x1={80} y1={60} x2={140} y2={60} stroke={COLORS.textMuted} strokeWidth={2} />
      <circle cx={180} cy={60} r={20} fill="none" stroke={COLORS.primary} strokeWidth={2} />
      <line x1={200} y1={60} x2={260} y2={60} stroke={COLORS.textMuted} strokeWidth={2} />
    </svg>
  );
};
