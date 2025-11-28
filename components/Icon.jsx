// Компонент-обертка для Lucide Icons
const { useRef, useEffect } = React;

const Icon = ({ name, size = 24, className = "" }) => {
    const iconRef = useRef(null);

    useEffect(() => {
        if (iconRef.current) {
            const iconElement = document.createElement('i');
            iconElement.setAttribute('data-lucide', name);
            iconRef.current.innerHTML = ''; 
            iconRef.current.appendChild(iconElement);
            lucide.createIcons({
                root: iconRef.current,
                nameAttr: 'data-lucide',
                attrs: {
                    width: size,
                    height: size,
                    class: className
                }
            });
        }
    }, [name, size, className]);

    return <span ref={iconRef} className="inline-flex items-center justify-center" />;
};


