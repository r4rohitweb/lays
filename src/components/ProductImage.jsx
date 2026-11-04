export function ProductImage({ flavor, eager = false, ...props }) {
  return (
    <img
      src={`assets/${flavor.id}.png`}
      alt={`Lay’s ${flavor.name} potato chips`}
      loading={eager ? undefined : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      draggable={false}
      {...props}
    />
  );
}
