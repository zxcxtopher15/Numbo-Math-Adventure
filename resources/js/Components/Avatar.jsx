export default function Avatar({ name, image }) {
    let url = '';

    image
        ? (url = '/images/assets/profiles/' + image)
        : (url = ` https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&font-family=Fredoka&bold=true&color=F68C8C&background=F1EFEF`);

    return <img src={url} alt={name} className="rounded-xl" />;
}
