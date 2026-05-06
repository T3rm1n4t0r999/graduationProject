// resources/js/Components/ApplicationLogo.jsx

export default function ApplicationLogo(props) {
    return (
        <svg
            {...props}
            viewBox="0 0 120 40"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="EduBot"
        >
            <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="100%" stopColor="gray" />
                    <stop offset="0" stopColor="black" />
                </linearGradient>
            </defs>
            <text
                x="0"
                y="32"
                fontFamily="'Poppins', -apple-system, sans-serif"
                fontWeight="700"
                fontSize="28"
                fill="url(#logoGradient)"
                letterSpacing="-0.5"
            >
                EduBot
            </text>
        </svg>
    );
}
