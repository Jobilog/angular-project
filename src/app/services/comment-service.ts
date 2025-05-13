import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  currentUser: any;
  comments: any[] = [];
  replies: any[] = [];
  selectedUserReplyingTo: any;
  isEditable: boolean = true;
  isReply: boolean = false;
  currentId: number = 0;
  isModalOpen: boolean = false;
  editContent: string = '';
  newComment = '';

  constructor(
    private http: HttpClient,
  ) { }

  // Load initial data from localStorage
  loadInitialData() {
    if (typeof localStorage !== 'undefined') {
      this.http.get<any>('/assets/data.json').subscribe((data) => {
        localStorage.setItem('comments', JSON.stringify(data.comments));
        localStorage.setItem('currentUser', JSON.stringify(data.currentUser));
        this.comments = data.comments;
        this.currentUser = data.currentUser;

      });
    }
  }

  // Retrieve comments from localStorage
  getComments() {
    let stored: any;
    if (typeof window !== 'undefined' && !!window.localStorage) {
      stored = localStorage.getItem('comments');
      this.loadInitialData();
    }
    return stored ? JSON.parse(stored) : [];
  }

  
  getUpdatedComment(): any[] {
    const storedBase = localStorage.getItem('comments');
    const storedNew = localStorage.getItem('newcomments');

    const baseComments = storedBase ? JSON.parse(storedBase) : [];
    const newComments = storedNew ? JSON.parse(storedNew) : [];

    return this.mergeComments(baseComments, newComments);
  }
  // Get replies
  getReplies(commentUsername: string) {

    this.replies = [];

    const stored = localStorage.getItem('newcomments');
    let newComments = stored ? JSON.parse(stored) : [];
  
    const allComments = this.mergeComments(this.comments, newComments);
    const seenReplyIds = new Set();
    allComments.forEach((comment: any) => {
      if (comment?.user?.username === commentUsername && comment.replies?.length > 0) {
        this.currentId = allComments.length + comment.replies?.length;
        comment.replies?.forEach((reply: any) => {
          if (!seenReplyIds.has(reply.id)) {//it well check the id if it has been process to avoid duplicates
            seenReplyIds.add(reply.id);
            this.replies.push(reply);
          }

        });
      }
    });
    this.replies.sort((a, b) => a.id - b.id);
    return this.replies;
  }
   edit(
    parentCommentId: number,
    replyingToUsername: string,
    newComment: string,
    currentComments: any[]
  ): any[] {
    
    if (!newComment.trim() || !replyingToUsername || !Array.isArray(currentComments)) {
      if (parentCommentId != 0 && replyingToUsername != '') {
        return currentComments;
      }

    }

    const stored = localStorage.getItem('newcomments');
    let storedComments: any[] = [];
    const parsed = stored ? JSON.parse(stored) : [];
    storedComments = Array.isArray(parsed) ? parsed : [];
  
       const updatedComments = storedComments.map(comment => {
    const updatedReplies = (comment.replies || []).map((reply:any) => {
      if (reply.id === parentCommentId) {
        return {
          ...reply,
          content: newComment,
          createdAt: Date.now()
        };
      }
      return reply;
    });

    return {
      ...comment,
      replies: updatedReplies
    };
  });

  localStorage.setItem('newcomments', JSON.stringify(updatedComments));
  return updatedComments;
  }

  add(
    parentCommentId: number,
    replyingToUsername: string,
    newComment: string,
    currentUser: any,
    currentComments: any[]
  ): any[] {
    let newData: any;
    if (!newComment.trim() || !replyingToUsername || !Array.isArray(currentComments)) {
      if (parentCommentId != 0 && replyingToUsername != '') {
        return currentComments;
      }

    }

    const stored = localStorage.getItem('newcomments');
    let storedComments: any[] = [];

      const parsed = stored ? JSON.parse(stored) : [];
      storedComments = Array.isArray(parsed) ? parsed : [];
  
    const combinedComments = this.mergeComments(currentComments, storedComments);
    const nextReplyId = this.getLastReplyId(combinedComments) + 1;

    if (replyingToUsername) {
      
      newData = {
        id: nextReplyId,
        content: newComment,
        createdAt: Date.now(),
        score: 0,
        replyingTo: replyingToUsername,
        user: currentUser,
      };
    } else {
      newData = {
        id: nextReplyId,
        content: newComment,
        createdAt: Date.now(),
        score: 0,
        user: currentUser,
        isYou: true
      };

    }

    const updatedComments = combinedComments.map((comment: any) => {
       console.log(comment.id === parentCommentId)
      if (comment.id === parentCommentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newData]
        };
      }
      // for saving edit
      const edited = comment.replies.find((reply:any) => reply.id == parentCommentId);
      if (edited) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newData]
        };
      }
      
      if (parentCommentId == 0 && replyingToUsername == '') {
        return [...combinedComments, newData];
      }
      return comment;
    });
   
    localStorage.setItem('newcomments', JSON.stringify(updatedComments));
    return updatedComments;
  }

  // Delete a reply from a comment thread
  deleteReply(replyId: number) {
    const storedNew = localStorage.getItem('newcomments');
    const newDataToBedeleted = storedNew ? JSON.parse(storedNew) : [];
     let isDeleted: boolean = false;
    
    const updatedComments = newDataToBedeleted.map((comment: any) => {
      if (comment.replies?.length) {
        const filteredReplies = comment.replies.filter(
          (reply: any) => reply.id !== replyId
        );

        if(newDataToBedeleted.replies?.length !== filteredReplies.length){
            isDeleted = true;
           return { ...comment, replies: filteredReplies };
        }
       
      }

      return comment;
    });
    if(isDeleted){
      console.log('Updated comments:', updatedComments);
          localStorage.setItem('newcomments', JSON.stringify(updatedComments));
    }
     return updatedComments;
  }

  // Get the last reply ID (used to generate new reply IDs)
  getLastReplyId(allComments: any[]): number {
    let allReplies: any[] = [];

    allComments.forEach(comment => {
      if (comment.replies?.length) {
        allReplies.push(...comment.replies);
      }
    });

    const lastReply = allReplies.sort((a, b) => b.id - a.id)[0];
    return lastReply ? lastReply.id : 0;
  }

  getDataById(id: number): any[] {
    let foundReply = null;
    const storedData = localStorage.getItem('newcomments');
    if (storedData) {
      const comments = JSON.parse(storedData);
      for (const comment of comments) {
        if (comment.replies?.length) {
          const match = comment.replies.find((reply: any) => reply.id === id);
          if (match) {
            foundReply = match;
            break;
          }
        }
      }
    }
    return foundReply;
  }


  // Merges two comment arrays, avoiding duplicates by comment ID
  private mergeComments(original: any[], updates: any[]): any[] {
    const flatOriginal = original.flat();//flat() make single array when injecting another array
    const flatUpdates = updates.flat();

    const map = new Map();

    [...flatOriginal, ...flatUpdates].forEach(comment => {
      if (comment && typeof comment === 'object' && comment.id !== undefined) {
        map.set(comment.id, comment);//always use set if you don't want duplicates
      }
    });

    return Array.from(map.values());
  }

  
}
