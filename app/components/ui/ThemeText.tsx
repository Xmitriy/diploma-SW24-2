import { Text } from "react-native";
import React from "react";

interface ThemeTextType extends React.ComponentProps<typeof Text> {
  children: React.ReactNode;
  className?: string;
}

const ThemeText = ({ children, className, ...props }: ThemeTextType) => {
  const defaultClassName = "dark:text-white text-black";
  const classname = className
    ? `${className} ${defaultClassName}`
    : defaultClassName;
  return (
    <Text {...props} className={`${classname}`}>
      {children}
    </Text>
  );
};

export default ThemeText;
