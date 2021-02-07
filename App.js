import React, { useRef } from "react";
import { StyleSheet, View, Dimensions, TextInput } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
   useAnimatedProps,
   useSharedValue,
   useAnimatedGestureHandler,
   useAnimatedStyle,
   withSpring,
   useDerivedValue,
   runOnJS,
} from "react-native-reanimated";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedStop = Animated.createAnimatedComponent(Stop);
const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);
const AnimatedText = Animated.createAnimatedComponent(TextInput);

const { height, width } = Dimensions.get("screen");
const middleH = height / 2;
const middleW = width / 2;
const knobSize = 30;

Animated.addWhitelistedNativeProps({ text: true });

export default function App() {
   const knobY = useSharedValue(middleH);
   const knobX = useSharedValue(middleW);

   const stop1 = useRef(null);
   const stop2 = useRef(null);

   const path = useDerivedValue(() => {
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
         knobX.value = ctx.offsetX + event.translationX;
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

   function setPercentage(percentage) {
      console.log("stop1", stop1.current);
      stop1.current?.setNativeProps({ offset: percentage + "%" });
      stop2.current?.setNativeProps({ offset: percentage + "%" });
   }

   const percentage = useDerivedValue(() => {
      const percentage = ~~((knobX.value / width) * 100) + "";
      runOnJS(setPercentage)(percentage);

      return percentage;
   });

   const animatedText = useAnimatedProps(() => {
      return {
         text: percentage.value,
      };
   });

   // const animatedOffset = useAnimatedProps(() => {
   //    const offset = percentage.value + "%";
   //    console.log("offset", offset);
   //    return {
   //       offset,
   //    };
   // });

   return (
      <View style={styles.container}>
         <Svg style={{ height, width }}>
            <Defs>
               <LinearGradient id="colors" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="rgb(255,0,0)" />
                  <Stop
                     ref={stop1}
                     offset={percentage.value + "%"}
                     stopColor="rgb(255,0,0)"
                  />
                  <Stop
                     ref={stop2}
                     offset={percentage.value + "%"}
                     stopColor="rgb(0,0,255)"
                  />
                  <Stop offset="100%" stopColor="rgb(0,0,255)" />
               </LinearGradient>
            </Defs>
            <AnimatedPath
               animatedProps={pathProps}
               stroke="url(#colors)"
               strokeWidth={3}
            />
         </Svg>
         <PanGestureHandler {...{ onGestureEvent }}>
            <Animated.View style={[styles.knob, animatedStyle]} />
         </PanGestureHandler>

         <AnimatedText
            underlineColorAndroid="transparent"
            style={styles.text}
            editable={false}
            animatedProps={animatedText}
            value={percentage.value}
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
      backgroundColor: "cyan",
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
