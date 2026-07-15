import {
  BarChart2,
  Bot,
  CheckCircle,
  Eye,
  FileText,
  Lightbulb,
  Link2,
  Lock,
  MousePointerClick,
  Settings,
  Shield,
  TrendingUp,
  Unplug,
  Zap,
  type LucideProps,
} from "lucide-react";
import type { ElementType } from "react";

const ICON_MAP: Record<string, ElementType<LucideProps>> = {
  BarChart2,
  Bot,
  CheckCircle,
  Eye,
  FileText,
  Lightbulb,
  Link2,
  Lock,
  MousePointerClick,
  Settings,
  Shield,
  TrendingUp,
  Unplug,
  Zap,
};

/** Renders a lucide icon by its name string (as stored in Strapi). */
export function DynamicIcon({
  name,
  size = 24,
  className,
}: {
  name?: string;
  size?: number;
  className?: string;
}) {
  const Icon = name ? ICON_MAP[name] : undefined;
  if (!Icon) return null;
  return <Icon size={size} className={className} />;
}
