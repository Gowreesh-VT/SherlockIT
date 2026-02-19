type Listener = (announcement: { message: string; _id: string; createdAt: string }) => void;

class AnnouncementEmitter {
    private listeners: Set<Listener> = new Set();

    subscribe(listener: Listener) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    emit(announcement: { message: string; _id: string; createdAt: string }) {
        this.listeners.forEach((listener) => listener(announcement));
    }
}

const globalForEmitter = globalThis as unknown as { announcementEmitter: AnnouncementEmitter };

export const announcementEmitter =
    globalForEmitter.announcementEmitter || new AnnouncementEmitter();

globalForEmitter.announcementEmitter = announcementEmitter;
