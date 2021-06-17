import { HsvColor } from '../../types';
import { memo } from '../../utils/memo';
import { round } from '../../utils/round';
import { Interaction, Interactive } from './Interactive';
import { Pointer } from './Pointer';

interface Props {
  adapter: SliderAdapter;
  hsv: HsvColor;
  onChange: (newValue: { v: number }) => void;
  onChangeComplete: () => void;
}

function getSliderHandlePosition(width: number, padding: number, value: number) {
  const handleRange = width - padding * 2;
  const handleStart = padding;
  const handlePos = handleStart + value * handleRange;
  return handlePos;
}

function getSliderValueFromInput(width: number, padding: number, x: number) {
  const handleRange = width - padding * 2;
  const handleStart = padding;
  let handlePos = x - handleStart;
  // clamp handle position
  handlePos = Math.max(Math.min(handlePos, handleRange), 0);
  return handlePos / handleRange;
}

export interface SliderAdapter {
  getPos(hsv: HsvColor): number;
  setPos(v: number, hsv: HsvColor): HsvColor;

  getBackground(hsv: HsvColor): string;
}

const ColorSliderBase = ({ adapter, hsv, onChange, onChangeComplete }: Props) => {
  if (!hsv) {
    console.log(hsv);
  }
  const handleMove = (interaction: Interaction) => {
    const v = getSliderValueFromInput(1, 0.05, interaction.left);
    const hsv2 = adapter.setPos(v, hsv);
    onChange(hsv2);
  };

  const pos = adapter.getPos(hsv);
  const handlePos = getSliderHandlePosition(1, 0.05, pos);

  return (
    <div
      class="slider my-1"
      style={{
        backgroundImage: adapter.getBackground(hsv),
      }}
    >
      <Interactive
        onMove={handleMove}
        onMoveEnd={onChangeComplete}
        aria-label="Slider"
        aria-valuetext={round(hsv.v)}
      >
        <Pointer left={handlePos} />
      </Interactive>
    </div>
  );
};

export const ColorSlider = memo(ColorSliderBase);
