import React, { useRef, useEffect } from 'react';
import * as lucide from 'lucide-react';

const Icon = ({ name, size = 24, className = "" }) => {
    const iconRef = useRef(null);

    useEffect(() => {
        if (iconRef.current) {
            const iconElement = document.createElement('i');
            iconElement.setAttribute('data-lucide', name);
            iconRef.current.innerHTML = '';
            iconRef.current.appendChild(iconElement);

            // Re-create icons on the specific element
            if (lucide.createIcons) {
                // For lucide browser script, not applicable here, we should use lucide-react components directly
                // Let's refactor this to use lucide-react dynamically
            }
        }
    }, [name, size, className]);

    // Better approach with lucide-react:
    const toPascalCase = (str) => {
        return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
    };

    const componentName = toPascalCase(name);
    const LucideIcon = lucide[componentName];

    if (!LucideIcon) {
        console.warn(`Icon ${name} not found in lucide-react`);
        return <span className={`inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }} />;
    }

    return <LucideIcon size={size} className={className} />;
};

export default Icon;
