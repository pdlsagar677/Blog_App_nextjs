// stores/useBlogStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BlogPost {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  likes: string[]; // Array of user IDs who liked the post
  comments: Comment[];
}

export interface Comment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

interface BlogState {
  posts: BlogPost[];
  addPost: (post: Omit<BlogPost, 'id' | 'createdAt' | 'likes' | 'comments'>) => void;
  updatePost: (id: string, updates: Partial<BlogPost>) => void;
  deletePost: (id: string) => void;
  addComment: (postId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  likePost: (postId: string, userId: string) => void;
  unlikePost: (postId: string, userId: string) => void;
  getPostsByAuthor: (authorId: string) => BlogPost[];
  getPostById: (id: string) => BlogPost | undefined;
  getAllPosts: () => BlogPost[];
  deleteComment: (postId: string, commentId: string) => void;
   deletePostsByAuthor: (authorId: string) => void;
}

export const useBlogStore = create<BlogState>()(
  persist(
    (set, get) => ({
      posts: [],
      
      addPost: (postData) => {
        const newPost: BlogPost = {
          ...postData,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
          likes: [],
          comments: [],
        };
        
        set((state) => ({
          posts: [newPost, ...state.posts],
        }));
      },
      
      updatePost: (id, updates) => {
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === id ? { ...post, ...updates } : post
          ),
        }));
      },
      
      deletePost: (id) => {
        set((state) => ({
          posts: state.posts.filter((post) => post.id !== id),
        }));
      },
      
      addComment: (postId, commentData) => {
        const newComment: Comment = {
          ...commentData,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === postId
              ? { ...post, comments: [...post.comments, newComment] }
              : post
          ),
        }));
      },
      
      likePost: (postId, userId) => {
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === postId && !post.likes.includes(userId)
              ? { ...post, likes: [...post.likes, userId] }
              : post
          ),
        }));
      },
      
      unlikePost: (postId, userId) => {
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === postId
              ? { ...post, likes: post.likes.filter(id => id !== userId) }
              : post
          ),
        }));
      },
      
      getPostsByAuthor: (authorId) => {
        return get().posts.filter((post) => post.authorId === authorId);
      },
      
      getPostById: (id) => {
        return get().posts.find((post) => post.id === id);
      },
      
      getAllPosts: () => {
        return get().posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },
      
      deleteComment: (postId, commentId) => {
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === postId
              ? { ...post, comments: post.comments.filter(comment => comment.id !== commentId) }
              : post
          ),
        }));
      },
        deletePostsByAuthor: (authorId: string) => {
        set((state) => ({
          posts: state.posts.filter((post) => post.authorId !== authorId),
        }));
      },
    }),
    {
      name: 'blog-storage',
    }
  )
);