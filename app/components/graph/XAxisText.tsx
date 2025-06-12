import React from "react";
import { Text, useFont } from "@shopify/react-native-skia";

type Props = {
  x: number;
  y: number;
  text: string;
};

const XAxisText = ({ x, y, text }: Props) => {
  const font = useFont(require("@/assets/fonts/Roboto-Regular.ttf"), 14);

  if (!font) {
    return null;
  }

  const fontSize = font.measureText(text);

  return (
    <Text
      color="#359BFB"
      font={font}
      x={x - fontSize.width / 2}
      y={y}
      text={text}
    />
  );
};

export default XAxisText;
