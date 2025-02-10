export default function InputLabel({
  value,
  className = '',
  children,
  ...props
}) {
  return (
    <label
      {...props}
      className={
        `block text-sm font-medium text-gray-600 px-3 mb-4` + className
      }
    >
      {value ? value : children}
    </label>
  );
}
