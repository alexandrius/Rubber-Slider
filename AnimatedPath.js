import React, { useState } from "react";
import { StyleSheet, View, Dimensions, TextInput } from "react-native";
import Svg, { Path, Defs, Pattern, Rect } from "react-native-svg";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
   useAnimatedProps,
   useSharedValue,
   useAnimatedGestureHandler,
   useAnimatedStyle,
   withSpring,
   useDerivedValue,
} from "react-native-reanimated";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedText = Animated.createAnimatedComponent(TextInput);

let { height, width } = Dimensions.get("screen");
width = width - 40;
const middleH = height / 2;
const middleW = width / 2;
const knobSize = 30;

Animated.addWhitelistedNativeProps({ text: true });

export default function App() {
   const [pathType, setPathType] = useState("linear");

   const knobY = useSharedValue(middleH);
   const knobX = useSharedValue(middleW);

   const path = useDerivedValue(() => {
      if (pathType === "linear") {
         const lX1 = knobX.value - knobSize / 2;
         const lY1 = knobY.value;

         const lX2 = knobX.value + knobSize / 2;
         const lY2 = knobY.value;

         return `M 0 ${middleH} L ${lX1} ${lY1} L ${lX2} ${lY2} L ${width} ${middleH}`;
      }

      const diffY = knobY.value - middleH;
      const diffX = knobX.value - middleW;

      const qY = middleH + diffY * 2;
      const qX = middleW + diffX * 2 + knobSize / 2;

      return `M 0 ${middleH} Q ${qX} ${qY} ${width} ${middleH}`;
   });

   const pathProps = useAnimatedProps(() => {
      return {
         d: path.value,
      };
   });

   const animatedStyle = useAnimatedStyle(() => {
      return {
         transform: [
            { translateX: knobX.value - knobSize / 2 },
            { translateY: knobY.value - knobSize / 2 },
         ],
      };
   });

   const onGestureEvent = useAnimatedGestureHandler({
      onStart: (_, ctx) => {
         ctx.offsetX = knobX.value;
         ctx.offsetY = knobY.value;
      },
      onActive: (event, ctx) => {
         let nextX = ctx.offsetX + event.translationX;
         if (nextX < 0) nextX = 0;
         else if (nextX > width) nextX = width;

         knobX.value = nextX;
         knobY.value = ctx.offsetY + event.translationY;
      },
      onEnd: () => {
         knobY.value = withSpring(middleH, {
            damping: 3,
            stiffness: 150,
            mass: 0.5,
         });
      },
   });

   const percentage = useDerivedValue(() => {
      return ~~((knobX.value / width) * 100);
   });

   const animatedText = useAnimatedProps(() => {
      return {
         text: percentage.value + "",
      };
   });

   const rect1Props = useAnimatedProps(() => {
      return {
         x: -width + (knobX.value - knobSize / 2),
      };
   });

   const rect2Props = useAnimatedProps(() => {
      return {
         x: knobX.value + knobSize / 2,
      };
   });

   return (
      <View style={styles.container}>
         <View style={{ marginLeft: 20 }}>
            <Svg style={{ height, width }}>
               <Defs>
                  <Pattern
                     id="pattern"
                     width={width}
                     height={3}
                     patternUnits="userSpaceOnUse"
                  >
                     <AnimatedRect
                        animatedProps={rect1Props}
                        width={width}
                        height="3"
                        fill="#545454"
                     />
                     <AnimatedRect
                        animatedProps={rect2Props}
                        width={width}
                        height="3"
                        fill="#e6e6e6"
                     />
                  </Pattern>
               </Defs>
               <AnimatedPath
                  animatedProps={pathProps}
                  stroke="url(#pattern)"
                  strokeWidth={3}
               />
            </Svg>
            <PanGestureHandler {...{ onGestureEvent }}>
               <Animated.View style={[styles.knob, animatedStyle]} />
            </PanGestureHandler>
         </View>

         <AnimatedText
            underlineColorAndroid="transparent"
            style={styles.text}
            editable={false}
            animatedProps={animatedText}
            value={percentage.value + ""}
         />
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: "#fff",
   },
   knobContainer: {
      position: "absolute",
   },
   knob: {
      position: "absolute",
      backgroundColor: "rgba(0,0,0,0.3)",
      borderWidth: 1,
      width: knobSize,
      height: knobSize,
      borderRadius: knobSize / 2,
   },
   text: {
      position: "absolute",
      height: 40,
      color: "black",
      fontSize: 40,
      top: 50,
   },
});
