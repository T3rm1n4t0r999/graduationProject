// resources/js/Components/ApplicationLogo.jsx

export default function ApplicationLogo(props) {
    return (
        <svg
            {...props}
            viewBox="0 0 150 40"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="EduBot"
        >
            <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--color-primary)" />
                </linearGradient>
            </defs>

            {/* Текст */}
            <text
                x="38"
                y="29"
                fontFamily="'Poppins', -apple-system, sans-serif"
                fontWeight="700"
                fontSize="24"
                fill="url(#logoGradient)"
                letterSpacing="-0.5"
            >
                EDUBOT
            </text>
        </svg>
    );
}
