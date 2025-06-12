import { StyleProp, View, ViewProps, ViewStyle } from "react-native";

type ThemeViewProps = ViewProps & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

const ThemeView = ({ children, className, ...props }: ThemeViewProps) => {
  return (
    <View
      {...props}
      className={`dark:bg-gray-900 bg-white flex-1 ${className}`}
    >
      {children}
    </View>
  );
};

export default ThemeView;
