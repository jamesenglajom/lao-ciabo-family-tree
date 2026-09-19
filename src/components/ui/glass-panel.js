export function GlassPanel({ as: Tag = "div", hover = true, className = "", children }) {
  return (
    <Tag className={`glass ${hover ? "glass-hover" : ""} rounded-3xl ${className}`}>
      {children}
    </Tag>
  );
}
