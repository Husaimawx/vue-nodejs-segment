import axios from './http';
import qs from 'qs';
import BASE from './base.js';

let base = BASE;

// 注册
export const REGISTER = params => { return axios.post(`${base}/users/register`, qs.stringify(params)); };

// 登录
export const LOGIN = params =>{ return axios.post(`${base}/users/login`,qs.stringify(params));};

// 获取用户信息
export const GET_USER_INFO = params => { return axios.get(`${base}/users/userinfo`,{params:params});};

// 退出登录
export const LOGOUT = params =>{ return axios.get(`${base}/users/logout`, {params:params});};

// 提交提问
export const SUBMIT_QUESTION = params => { return axios.post(`${base}/question/ask_question`,qs.stringify(params));};

// 问题列表
export const QUESTION_LIST = params => {return axios.get(`${base}/question/question_list`, {params:params});};

// 获取问题详情
export const QUESTION_DETAIL = params => { return axios.get(`${base}/question/question_detail`,{params:params});};

// 回答问题
export const ANSWER = params => { return axios.post(`${base}/question/answer`,qs.stringify(params));}





//===========================================================================

// 获取用户列表
export const GET_USER_LIST = params=>{ return axios.get(`${base}/users/getlist`,{params:params});};

// 提交文件
export const UPLOAD = params=> { return axios.post(`${base}/question/upload`),qs.stringify(params)};