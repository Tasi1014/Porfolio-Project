import ReactCountUp from 'react-countup';

// Handle potential CJS/ESM interop issues where the default export is nested
const CountUpComponent = ReactCountUp.default || ReactCountUp;

export default function CountUp({ end, suffix = "", prefix = "", duration = 2, className = "" }) {
  // easeOutCubic function equivalent for react-countup (if supported directly, or default easeOut)
  // react-countup uses useEasing prop implicitly or we can define a custom easingFn
  const easingFn = (t, b, c, d) => {
    return c * ((t = t / d - 1) * t * t + 1) + b;
  };

  return (
    <span className={className}>
      <CountUpComponent
        end={end}
        suffix={suffix}
        prefix={prefix}
        duration={duration}
        enableScrollSpy={true}
        scrollSpyOnce={true}
        scrollSpyDelay={200}
        easingFn={easingFn}
      />
    </span>
  );
}
