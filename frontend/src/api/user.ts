import axios from 'axios';
import { IServerResponse } from 'src/types/api';
import { IUserInfo } from 'src/types/user.type';

/**
 * 유저 정보 API
 * @description 로그인 된 유저 정보를 가져옵니다.
 **/
export const getUserInfo = async (): Promise<IServerResponse<IUserInfo>> => {
  const { data } = await axios.get('/users/me');

  return data;
};

/**
 * 유저 동네 등록 API
 * @description 유저의 동네를 등록합니다.
 **/
export const addUserRegion = async (regionId: number) => {
  await axios.post('users/region', {
    regionId,
  });
};

/**
 * 유저 동네 삭제 API
 * @description 등록된 유저의 동네를 삭제합니다.
 **/
export const removeUserRegion = async (regionId: number) => {
  await axios.delete(`users/region/${regionId}`);
};
