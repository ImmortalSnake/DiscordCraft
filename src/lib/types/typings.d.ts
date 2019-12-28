declare module 'discord.js' {
    interface Message {
        prompt(content: string, time?: number): Promise<Message>;
    }
}

declare module 'klasa' {
    interface Language {
        KEYWORDS: Record<string, string>;
    }
}
