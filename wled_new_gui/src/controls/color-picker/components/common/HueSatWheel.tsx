import { Interactive, Interaction } from './Interactive';
import { Pointer } from './Pointer';
import { HsvColor } from '../../types';
import { hsvToRgbString } from '../../utils/convert';
// import { clamp } from '../../utils/clamp';
import { round } from '../../utils/round';
import { memo } from '../../utils/memo';

interface Props {
  hsv: HsvColor;
  onChange: (newColor: { h: number; s: number }) => void;
  onChangeComplete: () => void;
}

/**
 * @desc Get the point as the center of the wheel
 * @param props - wheel props
 */
function getWheelDimensions(props: { width: number; borderWidth: number }) {
  const r = props.width / 2;
  return {
    width: props.width,
    radius: r - props.borderWidth,
    cx: r,
    cy: r,
  };
}

function getHandleRange(props: {
  width: number;
  borderWidth: number;
  padding: number;
  handleRadius: number;
}) {
  return props.width / 2 - props.padding - props.handleRadius - props.borderWidth;
}

/**
 * @desc Translate an angle according to wheelAngle and wheelDirection
 * @param props - wheel props
 * @param angle - input angle
 */
function translateWheelAngle(angle: number, wheelAngle: number, invert?: boolean) {
  // inverted and clockwisee
  if (invert) angle = wheelAngle + angle;
  // clockwise (input handling)
  else angle = 360 - wheelAngle + angle;
  return mod(angle, 360);
}
// javascript's modulo operator doesn't produce positive numbers with negative input
// https://dev.to/maurobringolf/a-neat-trick-to-compute-modulo-of-negative-numbers-111e
const mod = (a: number, n: number) => ((a % n) + n) % n;

const TAU = Math.PI * 2;
const dist = (x: number, y: number) => Math.sqrt(x * x + y * y);

function getWheelHandlePosition(
  props: { width: number; borderWidth: number; padding: number; handleRadius: number },
  color: HsvColor
) {
  const hsv = color;
  const { cx, cy } = getWheelDimensions(props);
  const handleRange = getHandleRange(props);
  const handleAngle = (180 + translateWheelAngle(hsv.h - 90, 0, true)) * (TAU / 360);
  const handleDist = (hsv.s / 100) * handleRange;
  const direction = -1;
  return {
    x: cx + handleDist * Math.cos(handleAngle) * direction,
    y: cy + handleDist * Math.sin(handleAngle) * direction,
  };
}

/**
 * @desc Get the current wheel value from user input
 * @param props - wheel props
 * @param x - global input x position
 * @param y - global input y position
 */
function getWheelValueFromInput(
  props: { width: number; borderWidth: number; padding: number; handleRadius: number },
  x: number,
  y: number
) {
  const { cx, cy } = getWheelDimensions(props);
  const handleRange = getHandleRange(props);
  x = cx - x;
  y = cy - y;
  // Calculate the hue by converting the angle to radians
  const hue = translateWheelAngle(Math.atan2(-y, -x) * (360 / TAU), -90);
  // Find the point's distance from the center of the wheel
  // This is used to show the saturation level
  const handleDist = Math.min(dist(x, y), handleRange);
  return {
    h: Math.round(hue),
    s: Math.round((100 / handleRange) * handleDist),
  };
}

const HueSatWheelBase = ({ hsv, onChange, onChangeComplete }: Props) => {
  const handleMove = (interaction: Interaction) => {
    const { h, s } = getWheelValueFromInput(
      { width: 1, borderWidth: 0, padding: 0, handleRadius: 0.02 },
      interaction.left,
      interaction.top
    );
    // onChange({
    //   s: interaction.left * 100,
    //   v: 100 - interaction.top * 100,
    // });
    onChange({ h, s });
  };

  // const handleKey = (offset: Interaction) => {
  //   // Saturation and brightness always fit into [0, 100] range
  //   onChange({
  //     s: clamp(hsv.s + offset.left * 100, 0, 100),
  //     v: clamp(hsv.v - offset.top * 100, 0, 100),
  //   });
  // };

  const containerStyle = {
    backgroundColor: hsvToRgbString({ h: hsv.h, s: 100, v: 100 }),
  };

  const pos = getWheelHandlePosition(
    { width: 1, borderWidth: 0, padding: 0, handleRadius: 0.02 },
    hsv
  );

  return (
    <div class="huewheel mb-2" style={containerStyle}>
      <div class="satoverlay" />
      <Interactive
        onMove={handleMove}
        onMoveEnd={onChangeComplete}
        aria-label="Color"
        aria-valuetext={`Saturation ${round(hsv.s)}%, Brightness ${round(hsv.v)}%`}
      >
        <Pointer top={pos.y} left={pos.x} />
      </Interactive>
    </div>
  );
};

export const HueSatWheel = memo(HueSatWheelBase);
