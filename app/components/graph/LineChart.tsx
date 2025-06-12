import React, { useEffect, useState } from 'react';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { curveBasis, line, scaleLinear, scalePoint } from 'd3';
import {
  SharedValue,
  clamp,
  runOnJS,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import {
  Gesture,
  GestureDetector,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';

import XAxisText from './XAxisText';
import Cursor from './Cursor';
import Gradient from './Gradient';
import { getYForX, parse } from 'react-native-redash';

type Props = {
  chartWidth: number;
  chartHeight: number;
  chartMargin: number;
  data: DataType[];
  setSelectedDate: React.Dispatch<React.SetStateAction<string>>;
  selectedValue: SharedValue<number>;
};

const LineChart = ({
  chartHeight,
  chartMargin,
  chartWidth,
  data,
  setSelectedDate,
  selectedValue,
}: Props) => {
  const [showCursor, setShowCursor] = useState(false);
  const animationLine = useSharedValue(0);
  const animationGradient = useSharedValue({ x: 0, y: 0 });
  const cx = useSharedValue(20);
  const cy = useSharedValue(0);

  const totalValue = data.reduce((acc, cur) => acc + cur.value, 0);

  useEffect(() => {
    animationLine.value = withTiming(1, { duration: 1000 });
    animationGradient.value = withDelay(
      1000,
      withTiming({ x: 0, y: chartHeight }, { duration: 500 })
    );
    selectedValue.value = withTiming(totalValue);
  }, [animationLine, animationGradient, selectedValue, chartHeight, totalValue]);

  // x domain, range, scale
  const xDomain = data.map((d) => d.label);
  const xRange = [chartMargin, chartWidth - chartMargin];
  const x = scalePoint().domain(xDomain).range(xRange).padding(0);
  const stepX = x.step();

  // y domain, range, scale
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const y = scaleLinear().domain([min, max]).range([chartHeight, 0]);

  // Line path
  const curvedLine = line<DataType>()
    .x((d) => x(d.label)!)
    .y((d) => y(d.value))
    .curve(curveBasis)(data);

  const linePath = Skia.Path.MakeFromSVGString(curvedLine!);
  if (!linePath) return null;

  const path = parse(linePath.toSVGString());

  // Gesture handler
  const handleGestureEvent = (e: PanGestureHandlerEventPayload) => {
    'worklet';

    const index = Math.floor(e.absoluteX / stepX);
    if (index >= 0 && index < data.length) {
      const selected = data[index];

      runOnJS(setSelectedDate)(selected.date);
      selectedValue.value = withTiming(selected.value);

      const clampValue = clamp(
        Math.floor(e.absoluteX / stepX) * stepX + chartMargin,
        chartMargin,
        chartWidth - chartMargin
      );

      cx.value = clampValue;

      const yForX = getYForX(path, Math.floor(clampValue));
      if (yForX !== null) {
        cy.value = yForX;
      }
    }
  };

  const pan = Gesture.Pan()
    .onTouchesDown(() => {
      runOnJS(setShowCursor)(true);
    })
    .onTouchesUp(() => {
      runOnJS(setShowCursor)(false);
      runOnJS(setSelectedDate)('Total');
      selectedValue.value = withTiming(totalValue);
    })
    .onBegin(handleGestureEvent)
    .onChange(handleGestureEvent);

  return (
    <GestureDetector gesture={pan}>
      <Canvas style={{ width: chartWidth, height: chartHeight }}>
        <Path
          path={linePath}
          style="stroke"
          strokeWidth={4}
          color="#4C91F9"
          strokeCap="round"
          start={0}
          end={animationLine}
        />
        <Gradient
          chartHeight={chartHeight}
          chartWidth={chartWidth}
          chartMargin={chartMargin}
          animationGradient={animationGradient}
          curvedLine={curvedLine!}
        />
        {data.map((d, i) => (
          <XAxisText
            key={i}
            x={x(d.label)!}
            y={chartHeight}
            text={d.label}
          />
        ))}
        {showCursor && <Cursor cx={cx} cy={cy} chartHeight={chartHeight} />}
      </Canvas>
    </GestureDetector>
  );
};

export default LineChart;
