export default function ApplicationLogo(props) {
  return (
    <img
      {...props}
      src={`${window.location.origin}/images/logo.png`}
      alt="Application Logo"
      width="150"
      className="h-auto"
    />
  );
}
