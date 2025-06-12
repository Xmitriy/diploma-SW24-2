import React from "react";
import Svg, { Defs, RadialGradient, Stop, Ellipse } from "react-native-svg";

export default function BlurEllipse({
  top = -120,
  left,
  right,
  bottom,
  size = 200,
}: {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  size?: number;
}) {
  const svgWidth = size * 3;
  const svgHeight = size * 2.75;
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;

  return (
    <Svg
      width={svgWidth}
      height={svgHeight}
      style={{
        position: "absolute",
        top: top || 0,
        left: left || 0,
        right: right || 0,
        bottom: bottom || 0,
      }}
    >
      <Defs>
        <RadialGradient
          id="grad"
          cx={centerX}
          cy={centerY}
          rx={size}
          ry={size}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#719BE3" stopOpacity="0.7" />
          <Stop offset="1" stopColor="#719BE3" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Ellipse
        cx={centerX}
        cy={centerY}
        rx={size}
        ry={size}
        fill="url(#grad)"
      />
    </Svg>
  );
}
