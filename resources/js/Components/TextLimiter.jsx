export default function TextLimiter({ text, maxLength }){
    const TextLimiter = () => {
        return text.length > maxLength
            ? text.slice(0, maxLength) + '...'
            : text;
    };

    return (
        <>
            {TextLimiter(text, maxLength)}
        </>
    )
}
