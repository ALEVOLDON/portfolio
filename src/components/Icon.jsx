import React from 'react';
import {
    ArrowUp,
    Check,
    Code,
    ExternalLink,
    Eye,
    FileCode,
    FolderGit,
    GitBranch,
    GitFork,
    Github,
    Loader,
    Loader2,
    Mail,
    Menu,
    Send,
    Star,
    Terminal,
    Twitter,
    Users,
    X,
    Sliders
} from 'lucide-react';

const icons = {
    'arrow-up': ArrowUp,
    check: Check,
    code: Code,
    'external-link': ExternalLink,
    eye: Eye,
    'file-code': FileCode,
    'folder-git': FolderGit,
    'git-branch': GitBranch,
    'git-fork': GitFork,
    github: Github,
    loader: Loader,
    'loader-2': Loader2,
    mail: Mail,
    menu: Menu,
    send: Send,
    sliders: Sliders,
    star: Star,
    terminal: Terminal,
    twitter: Twitter,
    users: Users,
    x: X
};

const Icon = ({ name, size = 24, className = '' }) => {
    const LucideIcon = icons[name];

    if (!LucideIcon) {
        console.warn(`Icon ${name} not found in lucide-react`);
        return <span className={`inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }} />;
    }

    return <LucideIcon size={size} className={className} />;
};

export default Icon;
