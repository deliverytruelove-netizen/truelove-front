import { type LucideIcon } from 'lucide-react';

interface FeatureItemProps {
  icon: LucideIcon;
  text: string;
}

export function FeatureItem({ icon: Icon, text }: FeatureItemProps) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-[#f34739]" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

