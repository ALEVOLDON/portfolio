import React, { createContext, useState, useContext } from 'react';

const translations = {
    en: {
        nav: {
            home: "HOME",
            about: "ABOUT",
            projects: "PROJECTS",
            contact: "CONTACT"
        },
        hero: {
            developer: "DEVELOPER",
            subtitle: "Building the future of the web.",
            viewProjects: "View Projects",
            githubProfile: "GitHub Profile"
        },
        about: {
            title: "SYSTEM ANALYTICS",
            statsTitle: "GITHUB STATS",
            totalStars: "Total Stars:",
            totalForks: "Total Forks:",
            totalRepos: "Total Repos:",
            followers: "Followers:",
            watchers: "Watchers:",
            languageMatrix: "LANGUAGE MATRIX"
        },
        projects: {
            title1: "SELECTED",
            title2: "WORKS",
            subtitle: "Exploring the repository matrix",
            all: "All",
            noDesc: "No description provided."
        },
        contact: {
            title1: "INITIATE",
            title2: "CONTACT",
            subtitle: "Open a secure channel for collaboration.",
            name: "Name",
            email: "Email",
            message: "Message",
            send: "Send Transmission",
            sending: "Transmitting...",
            successTitle: "Transmission Successful",
            successText: "Your message has been received.",
            errorTitle: "Transmission Failed",
            errorText: "Failed to send message. Please try again.",
            footer: "Built by"
        }
    },
    ru: {
        nav: {
            home: "ГЛАВНАЯ",
            about: "ОБО МНЕ",
            projects: "ПРОЕКТЫ",
            contact: "КОНТАКТЫ"
        },
        hero: {
            developer: "РАЗРАБОТЧИК",
            subtitle: "Создаю будущее веба.",
            viewProjects: "Смотреть Проекты",
            githubProfile: "Профиль GitHub"
        },
        about: {
            title: "СИСТЕМНАЯ АНАЛИТИКА",
            statsTitle: "СТАТИСТИКА GITHUB",
            totalStars: "Всего звезд:",
            totalForks: "Форки:",
            totalRepos: "Репозитории:",
            followers: "Подписчики:",
            watchers: "Наблюдатели:",
            languageMatrix: "МАТРИЦА ЯЗЫКОВ"
        },
        projects: {
            title1: "ИЗБРАННЫЕ",
            title2: "РАБОТЫ",
            subtitle: "Исследование матрицы репозиториев",
            all: "Все",
            noDesc: "Нет описания."
        },
        contact: {
            title1: "УСТАНОВИТЬ",
            title2: "СВЯЗЬ",
            subtitle: "Откройте защищенный канал для сотрудничества.",
            name: "Имя",
            email: "Email",
            message: "Сообщение",
            send: "Отправить Сообщение",
            sending: "Передача...",
            successTitle: "Сообщение Доставлено",
            successText: "Ваше сообщение успешно получено.",
            errorTitle: "Ошибка Передачи",
            errorText: "Не удалось отправить сообщение. Попробуйте еще раз.",
            footer: "Создано"
        }
    }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');

    const t = (key) => {
        const keys = key.split('.');
        let value = translations[language];
        for (const k of keys) {
            value = value?.[k];
        }
        return value || key;
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'ru' : 'en');
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
