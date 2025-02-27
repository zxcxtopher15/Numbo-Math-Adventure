export default function Avatar({ name, image, className, color = 'F68C8C', background = 'F1EFEF', rounded = false }) {
    const url = image
        ? `/images/assets/profiles/${image}`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&font-family=Fredoka&bold=true&color=${color}&background=${background}`;

    return <img src={url} alt={name} className={`${className} ${rounded ? 'rounded-full' : 'rounded-xl'}`} />;
}
