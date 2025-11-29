import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

type Course = {
  id: string;
  title: string;
  description: string;
  instructor_name: string;
  duration_hours: number;
};

type Friend = {
  friend_id: string;
  friend_username: string;
  friend_full_name: string;
  friend_avatar: string;
  friend_level: number;
  friend_xp: number;
  friend_coins: number;
  friends_since: string;
};

type DataContextType = {
  // Courses
  purchasedCourses: Course[];
  setPurchasedCourses: (courses: Course[]) => void;
  fetchPurchasedCourses: () => Promise<void>;
  coursesLoading: boolean;
  
  // Friends
  friends: Friend[];
  setFriends: (friends: Friend[]) => void;
  fetchFriends: () => Promise<void>;
  friendsLoading: boolean;
  
  // Cache management
  clearAllCache: () => void;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  
  // Courses state with localStorage persistence
  const [purchasedCourses, setPurchasedCoursesState] = useState<Course[]>(() => {
    if (!user) return [];
    const cached = localStorage.getItem(`courses-${user.id}`);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 10 * 60 * 1000) {
          return data;
        }
      } catch {}
    }
    return [];
  });
  
  const [coursesLoading, setCoursesLoading] = useState(false);
  
  // Friends state with localStorage persistence
  const [friends, setFriendsState] = useState<Friend[]>(() => {
    if (!user) return [];
    const cached = localStorage.getItem(`friends-${user.id}`);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          return data;
        }
      } catch {}
    }
    return [];
  });
  
  const [friendsLoading, setFriendsLoading] = useState(false);
  
  // Persist courses to localStorage
  const setPurchasedCourses = (courses: Course[]) => {
    setPurchasedCoursesState(courses);
    if (user) {
      localStorage.setItem(`courses-${user.id}`, JSON.stringify({
        data: courses,
        timestamp: Date.now()
      }));
    }
  };
  
  // Persist friends to localStorage
  const setFriends = (friendsList: Friend[]) => {
    setFriendsState(friendsList);
    if (user) {
      localStorage.setItem(`friends-${user.id}`, JSON.stringify({
        data: friendsList,
        timestamp: Date.now()
      }));
    }
  };
  
  // Fetch purchased courses
  const fetchPurchasedCourses = async () => {
    if (!user || coursesLoading) return;
    
    setCoursesLoading(true);
    try {
      const { data: purchased, error: purchasedError } = await supabase
        .from('purchased_courses')
        .select('course_id')
        .eq('user_id', user.id);

      if (purchasedError) throw purchasedError;

      if (purchased && purchased.length > 0) {
        const courseIds = purchased.map((p) => p.course_id);
        const { data: courses, error: coursesError } = await supabase
          .from('courses')
          .select('id, title, description, instructor_name, duration_hours')
          .in('id', courseIds);

        if (coursesError) throw coursesError;
        if (courses) {
          setPurchasedCourses(courses);
        }
      } else {
        setPurchasedCourses([]);
      }
    } catch (error) {
      console.error('Error fetching purchased courses:', error);
    } finally {
      setCoursesLoading(false);
    }
  };
  
  // Fetch friends
  const fetchFriends = async () => {
    if (!user || friendsLoading) return;
    
    setFriendsLoading(true);
    try {
      const { data, error } = await supabase
        .from('friends_with_details')
        .select('*')
        .eq('user_id', user.id)
        .order('friends_since', { ascending: false });

      if (error) throw error;
      if (data) {
        setFriends(data);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setFriendsLoading(false);
    }
  };
  
  // Clear all cache
  const clearAllCache = () => {
    if (user) {
      localStorage.removeItem(`courses-${user.id}`);
      localStorage.removeItem(`friends-${user.id}`);
      setPurchasedCoursesState([]);
      setFriendsState([]);
    }
  };
  
  // Auto-fetch on mount if cache is empty or expired - ONLY ONCE
  useEffect(() => {
    if (!user) return;
    
    let hasFetchedCourses = false;
    let hasFetchedFriends = false;
    
    // Check courses cache
    const coursesCached = localStorage.getItem(`courses-${user.id}`);
    if (coursesCached) {
      try {
        const { data, timestamp } = JSON.parse(coursesCached);
        if (Date.now() - timestamp < 10 * 60 * 1000) {
          // Cache is valid, use it
          setPurchasedCoursesState(data);
          hasFetchedCourses = true;
        }
      } catch {}
    }
    
    if (!hasFetchedCourses && purchasedCourses.length === 0) {
      fetchPurchasedCourses();
    }
    
    // Check friends cache
    const friendsCached = localStorage.getItem(`friends-${user.id}`);
    if (friendsCached) {
      try {
        const { data, timestamp } = JSON.parse(friendsCached);
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          // Cache is valid, use it
          setFriendsState(data);
          hasFetchedFriends = true;
        }
      } catch {}
    }
    
    if (!hasFetchedFriends && friends.length === 0) {
      fetchFriends();
    }
  }, []); // Empty deps - only run once on mount
  
  return (
    <DataContext.Provider
      value={{
        purchasedCourses,
        setPurchasedCourses,
        fetchPurchasedCourses,
        coursesLoading,
        friends,
        setFriends,
        fetchFriends,
        friendsLoading,
        clearAllCache,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
