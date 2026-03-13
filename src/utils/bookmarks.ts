import type { Resource } from "@/types";

const BOOKMARKS_KEY = "studysphere_bookmarks_v2";

export const getBookmarks = (): Resource[] => {
    try {
        return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || "[]");
    } catch { return []; }
};

export const isBookmarked = (id: string): boolean => {
    return getBookmarks().some(b => b.id === id);
};

export const toggleBookmark = (resource: Resource): boolean => {
    const bookmarks = getBookmarks();
    const index = bookmarks.findIndex(b => b.id === resource.id);
    if (index > -1) {
        bookmarks.splice(index, 1);
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
        return false;
    } else {
        bookmarks.push(resource);
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
        return true;
    }
};
