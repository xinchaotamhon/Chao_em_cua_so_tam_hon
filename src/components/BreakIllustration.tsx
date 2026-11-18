/**
 * A moving drawing for each break action.
 *
 * Drawn here rather than imported: a Lottie file or a stock animation would add a library, a
 * licence and a second visual language, while these are a few lines of SVG that use the same
 * stroke and the same đồng colour as the app mark. SMIL is used instead of CSS because the
 * animation lives next to the shape it moves.
 *
 * The motion is not decoration - each drawing shows the movement the sentence asks for, which
 * is the whole reason it exists.
 */
interface Props {
  id: string;
  size?: number;
  className?: string;
}

function NhinXa() {
  return (
    <g>
      {/* head in profile, eye open */}
      <circle cx="30" cy="56" r="18" />
      <circle cx="42" cy="51" r="3.2" fill="currentColor" stroke="none" />
      {/* the gaze travelling outward, and a hill far away */}
      <path d="M54 50 H92" strokeDasharray="4 8">
        <animate
          attributeName="stroke-dashoffset"
          values="0;-36"
          dur="1.8s"
          repeatCount="indefinite"
        />
      </path>
      <path d="M78 84 Q94 58 110 84" />
      <path d="M14 84 H110" strokeOpacity="0.5" />
    </g>
  );
}

function ChopMat() {
  return (
    <g transform="translate(60 60)">
      <g>
        <animateTransform
          attributeName="transform"
          type="scale"
          values="1 1;1 1;1 0.08;1 1;1 1"
          keyTimes="0;0.62;0.72;0.82;1"
          dur="4.2s"
          repeatCount="indefinite"
        />
        <path d="M-48 0 Q0 -32 48 0 Q0 32 -48 0 Z" />
        <circle cx="0" cy="0" r="13" />
      </g>
    </g>
  );
}

function GanXa() {
  return (
    <g>
      <path d="M10 60 Q32 43 54 60 Q32 77 10 60 Z" />
      <circle cx="32" cy="60" r="7" />
      {/* the finger, coming close and going far */}
      <circle cx="74" cy="60" r="10" fill="currentColor" stroke="none" opacity="0.9">
        <animate attributeName="cx" values="74;102;74" dur="3.4s" repeatCount="indefinite" />
        <animate attributeName="r" values="10;4.5;10" dur="3.4s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}

/**
 * A chevron outside a shoulder: the direction, with no shaft to cross the drawing.
 *
 * The first version used a full arrow here and it failed for a reason worth keeping: an arrow
 * drawn beside a curve at this size reads as part of the curve, so the two of them together
 * looked like a bracket instead of two shoulders dropping.
 */
function chevron(cx: number) {
  return (
    <g transform={`translate(${cx} 62)`}>
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 -2;0 4;0 -2"
          dur="3.2s"
          repeatCount="indefinite"
        />
        <animate attributeName="opacity" values="0.4;1;0.4" dur="3.2s" repeatCount="indefinite" />
        <path d="M-6 -3 L0 4 L6 -3" />
      </g>
    </g>
  );
}

function ThuGian() {
  return (
    <g>
      {/* One body - head, neck, shoulders and the arms they carry - so what drops is a person
          and not a curve floating on its own. */}
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0;0 4;0 0"
          dur="3.2s"
          repeatCount="indefinite"
        />
        <circle cx="60" cy="30" r="11" />
        <path d="M60 41 V48" />
        <path d="M36 60 Q48 49 60 48 Q72 49 84 60" />
        <path d="M36 60 L31 84" />
        <path d="M84 60 L89 84" />
      </g>
      {chevron(20)}
      {chevron(100)}
    </g>
  );
}

/**
 * Standing up, shown as the two states it really has: on the chair, then on the floor beside it.
 *
 * The first version moved a standing figure up and down, which put its feet through the floor
 * line for two seconds of every cycle. So the body now moves as a whole, and the legs are
 * interpolated between a short seated pair and a long standing pair - same number of segments,
 * because SMIL can only animate a `d` whose shape matches.
 */
const LEGS_SEATED = "M44 70 L38 80 M44 70 L50 80";
const LEGS_STANDING = "M44 70 L34 94 M44 70 L54 94";
const RISE_TIMES = "0;0.18;0.5;0.82;1";

function DungDay() {
  return (
    <g>
      {/* the chair: back, seat and two legs, so it reads as something to stand up from */}
      <path d="M92 58 V86" />
      <path d="M92 86 H68" />
      <path d="M72 86 V94" />
      <path d="M88 86 V94" />
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="28 14;28 14;0 0;0 0;28 14"
          keyTimes={RISE_TIMES}
          dur="4.4s"
          repeatCount="indefinite"
        />
        <path d={LEGS_SEATED}>
          <animate
            attributeName="d"
            values={`${LEGS_SEATED};${LEGS_SEATED};${LEGS_STANDING};${LEGS_STANDING};${LEGS_SEATED}`}
            keyTimes={RISE_TIMES}
            dur="4.4s"
            repeatCount="indefinite"
          />
        </path>
        <circle cx="44" cy="26" r="11" />
        <path d="M44 37 V70" />
        <path d="M44 47 L31 58 M44 47 L57 58" />
      </g>
      <path d="M14 96 H104" />
    </g>
  );
}

const DRAWINGS: Record<string, () => JSX.Element> = {
  "nhin-xa": NhinXa,
  "chop-mat": ChopMat,
  "gan-xa": GanXa,
  "thu-gian": ThuGian,
  "dung-day": DungDay,
};

export default function BreakIllustration({ id, size = 104, className = "" }: Props) {
  const Drawing = DRAWINGS[id];
  if (!Drawing) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <Drawing />
    </svg>
  );
}
