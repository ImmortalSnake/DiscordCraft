declare module 'discord.js' {
    interface Message {
        prompt(content: string, time?: number): Promise<Message>;
    }
}

declare module 'klasa' {
    interface Language {
        KEYWORDS: Record<string, string>;
    }

    interface KlasaMessage {
        commandPrefix: string;
    }
}

declare module 'klasa-dashboard-hooks' {
    class Route {
        public constructor(store: RouteStore, file: string[], directory: string, options?: RouteOptions): Route;
    }
}