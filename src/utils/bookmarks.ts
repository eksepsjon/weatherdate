import type { Bookmark } from '../types/weather';

const STORAGE_KEY = 'weatherdate_bookmarks';

export function getBookmarks(): Bookmark[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBookmark(bookmark: Bookmark): void {
  const bookmarks = getBookmarks();
  const existing = bookmarks.findIndex((b) => b.id === bookmark.id);
  if (existing >= 0) {
    bookmarks[existing] = bookmark;
  } else {
    bookmarks.unshift(bookmark);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}

export function deleteBookmark(id: string): void {
  const bookmarks = getBookmarks().filter((b) => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}

export function generateBookmarkId(place: string, time: string): string {
  return `${place.toLowerCase().replace(/\s+/g, '-')}-${time}`;
}
