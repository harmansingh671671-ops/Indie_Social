import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { readJSON, writeJSON } from '../lib/storage';

interface AppStateValue {
  savedIds: string[];
  likedIds: string[];
  followedHandles: string[];
  isSaved: (id: string) => boolean;
  isLiked: (id: string) => boolean;
  isFollowing: (handle: string) => boolean;
  toggleSave: (id: string) => boolean;
  toggleLike: (id: string) => boolean;
  toggleFollow: (handle: string) => boolean;
  resetDemoData: () => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

function usePersistedState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => readJSON<T>(key, initial));

  useEffect(() => {
    writeJSON(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = usePersistedState<string[]>('saved', []);
  const [likedIds, setLikedIds] = usePersistedState<string[]>('liked', []);
  const [followedHandles, setFollowedHandles] = usePersistedState<string[]>(
    'followed',
    [],
  );
  const toggleInList = useCallback(
    (list: string[], value: string) =>
      list.includes(value) ? list.filter((item) => item !== value) : [...list, value],
    [],
  );

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);
  const isLiked = useCallback((id: string) => likedIds.includes(id), [likedIds]);
  const isFollowing = useCallback(
    (handle: string) => followedHandles.includes(handle),
    [followedHandles],
  );

  const toggleSave = useCallback(
    (id: string) => {
      const next = !savedIds.includes(id);
      setSavedIds((current) => toggleInList(current, id));
      return next;
    },
    [savedIds, setSavedIds, toggleInList],
  );

  const toggleLike = useCallback(
    (id: string) => {
      const next = !likedIds.includes(id);
      setLikedIds((current) => toggleInList(current, id));
      return next;
    },
    [likedIds, setLikedIds, toggleInList],
  );

  const toggleFollow = useCallback(
    (handle: string) => {
      const next = !followedHandles.includes(handle);
      setFollowedHandles((current) => toggleInList(current, handle));
      return next;
    },
    [followedHandles, setFollowedHandles, toggleInList],
  );

  const resetDemoData = useCallback(() => {
    setSavedIds([]);
    setLikedIds([]);
    setFollowedHandles([]);
  }, [setSavedIds, setLikedIds, setFollowedHandles]);

  const value = useMemo<AppStateValue>(
    () => ({
      savedIds,
      likedIds,
      followedHandles,
      isSaved,
      isLiked,
      isFollowing,
      toggleSave,
      toggleLike,
      toggleFollow,
      resetDemoData,
    }),
    [
      savedIds,
      likedIds,
      followedHandles,
      isSaved,
      isLiked,
      isFollowing,
      toggleSave,
      toggleLike,
      toggleFollow,
      resetDemoData,
    ],
  );

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState(): AppStateValue {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used inside <AppStateProvider>');
  }
  return context;
}
