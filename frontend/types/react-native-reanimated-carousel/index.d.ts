declare module "react-native-reanimated-carousel" {
  import React from "react";
  import { ViewStyle } from "react-native";
  import { PanGestureHandlerProps } from "react-native-gesture-handler";

  export interface CarouselProps<T> {
    data: T[];
    width: number;
    height: number;
    renderItem: ({ item, index }: { item: T; index: number }) => React.ReactNode;
    mode?: "horizontal-stack" | "vertical-stack" | "parallax" | "default";
    modeConfig?: Record<string, any>;
    scrollAnimationDuration?: number;
    style?: ViewStyle;
    panGestureHandlerProps?: PanGestureHandlerProps;
    loop?: boolean;
    autoPlay?: boolean;
    autoPlayInterval?: number;
    onSnapToItem?: (index: number) => void;
    defaultIndex?: number;
    enabled?: boolean;
  }

  function Carousel<T>(props: CarouselProps<T>): React.ReactElement;

  export default Carousel;
}
