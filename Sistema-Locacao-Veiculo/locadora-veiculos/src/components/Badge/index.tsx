

//Propriedades do badge
interface BadgeProps {
  text: string;
  color: "success" | "danger" | "warning" | "primary" | "secondary";
}

export function Badge({ text, color }: BadgeProps) {
  return <span className={`badge text-bg-${color}`}>{text}</span>;
}


