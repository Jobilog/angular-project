
import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Injectable } from '@angular/core';
import { CreatedTimeAgoPipe } from './common-components/time-ago-created-at/created-time-ago.pipe';
import { ModalComponent } from './common-components/modal/modal.component';
import { CommentService } from './services/comment-service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, CreatedTimeAgoPipe, ModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

@Injectable({
  providedIn: 'root',
})
export class AppComponent implements OnInit {
  title = 'comment-section-challenge';
  currentUser: any;
  comments: any[] = [];
  replies: any[] = [];
  selectedUserReplyingTo: any;
  isEditable: boolean = false;
  isComment: boolean = false;
  isReply: boolean = false;
  isYou: boolean = false;
  currentId: number = 0;
  isModalOpen: boolean = false;
  editContent: string = '';
  newComment = '';
  newReply = '';
  editedText: string = '';
  editId: number = 0;
  editUser: string = '';
  editReplyTo: string = '';



  constructor(private commentService: CommentService,
  ) { }
//on access of page 1st to execute
  ngOnInit(): void {

    this.commentService.loadInitialData();
    this.comments = this.commentService.getComments();
    if (typeof window !== 'undefined' && !!window.localStorage) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    }

  }
  //open  delete modal
  deleteModal(id: number) {
    this.isModalOpen = true;
    this.currentId = id;
  }

  upvote(comment: any) {
    comment.score++;
  }

  downvote(comment: any) {
    if (comment == 0) {
      comment = 0;
    }
    comment.score--;
  }
  //get all replies
  replyList(commentUsername: any) {
    return this.commentService.getReplies(commentUsername);
  }

  // open reply form
  reply(comment: any) {
    this.isComment = false;
    this.isEditable = false;
    this.selectedUserReplyingTo = comment;
  }

    // open comment form
  openAddComment() {
    this.isComment = true;
    this.isEditable = false;
    this.isReply = false;
  } 

  // add a reply
  addreply() {
    this.comments = this.commentService.add(
      this.selectedUserReplyingTo.id,
      this.selectedUserReplyingTo.user.username,
      this.newReply,
      this.currentUser,
      this.comments
    );

    this.replies = this.commentService.getReplies(this.selectedUserReplyingTo.user.username);
    this.newReply = '';
    this.isReply = false;
    this.isEditable = false;
  }

  //edit reply
  editreply() {
    this.comments = this.commentService.edit(
      this.editId,
      this.editReplyTo,
      this.editedText,
      this.comments
    );

    this.replies = this.commentService.getReplies(this.editUser);
    this.editedText = '';
    this.isEditable = false;
  }

  // open edit form
  openEdit(commentId: number) {
    this.isEditable = true;
    this.isReply = false;
    this.isComment = false;
    this.editId = commentId;
    let data: any;
    let content: any;
    data = this.commentService.getUpdatedComment();
    const flatOriginal = data.flat();


    for (let currentContent of flatOriginal) {
      const editData = currentContent.replies.find((reply: any) => reply.id == commentId);

      if (editData) {
        content = editData.content;
        this.editReplyTo = editData?.replyingTo;
        this.editUser = editData.user;
      }
    }
    console.log(content)
    this.editedText = content;


  }
  //add new comments
  addComment() {
    this.comments = this.commentService.add(
      0,
      "",
      this.newComment,
      this.currentUser,
      this.comments
    );

    this.comments = this.commentService.getUpdatedComment();
    this.newComment = ''
  }

  // Delete a reply
  deleteReply(replyId: number) {

    this.comments = this.commentService.deleteReply(replyId);
    this.isModalOpen = false;

    this.comments = this.commentService.getUpdatedComment();
  }

  // Cancel the modal
  cancel() {
    this.isModalOpen = false;
  }


}
