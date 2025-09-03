import * as tokenCheck from './check-token';
import * as auth from './authenticate';
import * as passwordActions from './password-reset';
import * as uploadImage from './upload-public-image';
import * as getUserInfo from './get-user-info';
import * as changeUserInfo from './change-user-info';
import * as posts from './posts-actions';
import * as comments from './comment-actions';
import * as tags from './tags-actions';

export const API = {
  tokenCheck,
  auth,
  passwordActions,
  uploadImage,
  getUserInfo,
  changeUserInfo,
  posts,
  comments,
  tags,
};