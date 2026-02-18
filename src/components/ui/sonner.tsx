import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      offset="50px"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-[#d4af37] group-[.toast]:text-white group-[.toast]:font-bold",
          cancelButton: "group-[.toast]:bg-white/10 group-[.toast]:text-white group-[.toast]:hover:bg-white/20",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
