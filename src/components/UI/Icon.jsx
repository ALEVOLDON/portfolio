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
    Sliders,
    ChevronLeft,
    ChevronRight,
    Volume2,
    VolumeX,
    Music,
    Waves,
    Sparkles,
    Headphones,
    Disc,
    Clock,
    RefreshCw,
    Lock,
    Sun,
    Moon,
    Home,
    User,
    BookOpen
} from 'lucide-react';

const icons = {
    home: Home,
    user: User,
    'book-open': BookOpen,
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
    x: X,
    'chevron-left': ChevronLeft,
    'chevron-right': ChevronRight,
    'volume-2': Volume2,
    'volume-x': VolumeX,
    music: Music,
    waves: Waves,
    sparkles: Sparkles,
    headphones: Headphones,
    disc: Disc,
    clock: Clock,
    'refresh-cw': RefreshCw,
    lock: Lock,
    sun: Sun,
    moon: Moon
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
