import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  const initialValue = Array.isArray(props.value)
    ? props.value
    : Array.isArray(props.defaultValue)
      ? props.defaultValue
      : [0];

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        // touch-none removed — it was blocking touch drag on mobile
        // touch-action is applied only on the thumb via style, not here
        "relative flex w-full select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary/50">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      {initialValue.map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          // touch-action: none on the thumb only — prevents scroll conflict
          // when the user's finger is directly on the handle
          style={{ touchAction: 'none' }}
          className="block h-7 w-7 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-md hover:scale-110 cursor-grab active:cursor-grabbing"
        />
      ))}
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
