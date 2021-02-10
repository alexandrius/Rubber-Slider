import React, { useState } from "react";
import { StyleSheet, View, Dimensions, Image } from "react-native";
import Svg, { Path, Defs, Pattern, Rect } from "react-native-svg";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
   useAnimatedProps,
   useSharedValue,
   useAnimatedGestureHandler,
   useAnimatedStyle,
   withSpring,
   useDerivedValue,
   interpolate,
   concat,
} from "react-native-reanimated";
import AnimatedText from "./AnimatedText";
import Header from "./Header";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

let { height, width } = Dimensions.get("screen");

const padding = 20;

const availableWidth = width - padding * 2;
const sliderY = height - height * 0.4;
const middleW = width / 2;
const knobSize = 22;

const pathHeight = 4;

//More fixes required for quadratic path

export default function App() {
   const [pathType, setPathType] = useState("linear");

   const knobY = useSharedValue(sliderY);
   const knobX = useSharedValue(middleW);

   const path = useDerivedValue(() => {
      if (pathType === "linear") {
         let lX1 = knobX.value - knobSize / 2;
         let lY1 = knobY.value;
         if (lX1 < padding) lX1 = padding;

         let lX2 = knobX.value + knobSize / 2;
         if (lX2 > availableWidth + padding) lX2 = availableWidth + padding;

         const lY2 = knobY.value;

         return `M ${padding} ${sliderY} L ${lX1} ${lY1} L ${lX2} ${lY2} L ${
            availableWidth + padding
         } ${sliderY}`;
      }

      const diffX = knobX.value - middleW;
      const diffY = knobY.value - sliderY;

      const qX = middleW + diffX * 2 + padding;
      const qY = sliderY + diffY * 2;

      return `M ${padding} ${sliderY} Q ${qX} ${qY} ${availableWidth} ${sliderY}`;
   });

   const pathProps = useAnimatedProps(() => {
      return {
         d: path.value,
      };
   });

   const knobStyle = useAnimatedStyle(() => {
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
         if (nextX < padding) nextX = padding;
         else if (nextX > availableWidth + padding)
            nextX = availableWidth + padding;

         knobX.value = nextX;
         knobY.value = ctx.offsetY + event.translationY;
      },
      onEnd: () => {
         knobY.value = withSpring(sliderY, {
            damping: 3,
            stiffness: 150,
            mass: 0.5,
         });
      },
   });

   const percentage = useDerivedValue(() => {
      return ~~(((knobX.value - padding) / availableWidth) * 100);
   });

   const rect1Props = useAnimatedProps(() => {
      let x = knobX.value - availableWidth - knobSize / 2;

      if (knobX.value <= padding * 2) {
         x += padding;
      }

      return {
         x,
      };
   });

   const rect2Props = useAnimatedProps(() => {
      let x = knobX.value + knobSize / 2;

      if (knobX.value >= availableWidth - padding * 2) {
         x -= padding;
      }
      return {
         x,
      };
   });

   const imageStyle = useAnimatedStyle(() => {
      return {
         transform: [
            {
               rotate:
                  interpolate(percentage.value, [0, 100], [0, 1440]) + "deg",
            },
         ],
      };
   });

   return (
      <View style={styles.container}>
         <View style={StyleSheet.absoluteFillObject}>
            <Header />
            <Animated.Image
               source={require("./assets/artist.png")}
               style={[styles.artist, imageStyle]}
            />
            
            <View style={styles.buttonContainer}>
               <Image
                  style={styles.button}
                  source={require("./assets/prev/prev.png")}
               />
               <Image
                  style={styles.button}
                  source={require("./assets/pause/pause.png")}
               />
               <Image
                  style={styles.button}
                  source={require("./assets/next/next.png")}
               />
            </View>
         </View>

         <Svg style={{ height, width }}>
            <Defs>
               <Pattern
                  id="pattern"
                  width={width}
                  height={pathHeight}
                  patternUnits="userSpaceOnUse"
               >
                  <AnimatedRect
                     animatedProps={rect1Props}
                     width={availableWidth}
                     height={pathHeight}
                     fill="#1C0452"
                  />
                  <AnimatedRect
                     animatedProps={rect2Props}
                     width={availableWidth}
                     height={pathHeight}
                     fill="#DDDDDD"
                  />
               </Pattern>
            </Defs>
            <AnimatedPath
               animatedProps={pathProps}
               stroke="url(#pattern)"
               strokeWidth={pathHeight}
               strokeLinecap="round"
            />
         </Svg>
         <PanGestureHandler {...{ onGestureEvent }}>
            <Animated.View style={[styles.knob, knobStyle]} />
         </PanGestureHandler>
         {/* <AnimatedText
            underlineColorAndroid="transparent"
            style={styles.text}
            text={percentage}
         /> */}
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: "#F7F7F8",
   },
   knobContainer: {
      position: "absolute",
   },
   knob: {
      position: "absolute",
      backgroundColor: "#1C0452",
      width: knobSize,
      height: knobSize,
      borderRadius: knobSize / 2,
      // opacity: 0,
   },
   text: {
      position: "absolute",
      height: 40,
      color: "black",
      fontSize: 40,
      top: 50,
   },
   artist: {
      width: width - 110,
      height: width - 110,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 20,
      alignSelf: "center",
   },
   buttonContainer: {
      flexDirection: "row",
      alignSelf: "center",
      marginTop: 200,
      alignItems: "center",
   },
   button: {
      marginHorizontal: 20,
   },
});
