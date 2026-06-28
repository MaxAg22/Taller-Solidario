import { Heart, Monitor } from "lucide-react";

export const Logo = () => {
  return (
    <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 shadow-sm">
      <Monitor className="h-8 w-8 text-white" />
      <Heart className="absolute h-3.5 w-3.5 fill-blue-500 text-blue-500" />
    </div>
  );
};

export default Logo;
