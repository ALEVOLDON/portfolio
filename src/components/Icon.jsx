import React from 'react';
import * as lucide from 'lucide-react';

const toPascalCase = (value) => value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

const Icon = ({ name, size = 24, className = '' }) => {
    const componentName = toPascalCase(name);
    const LucideIcon = lucide[componentName];

    if (!LucideIcon) {
        console.warn(`Icon ${name} not found in lucide-react`);
        return <span className={`inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }} />;
    }

    return <LucideIcon size={size} className={className} />;
};

export default Icon;
