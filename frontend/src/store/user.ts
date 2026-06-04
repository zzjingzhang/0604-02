import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '');
  const userInfo = ref<any>(null);

  const isLoggedIn = computed(() => !!token.value);
  const isAdmin = computed(() => userInfo.value?.role === 'admin');
  const isCustomer = computed(() => userInfo.value?.role === 'customer');

  const setToken = (newToken: string) => {
    token.value = newToken;
    localStorage.setItem('token', newToken);
  };

  const setUserInfo = (info: any) => {
    userInfo.value = info;
    localStorage.setItem('user', JSON.stringify(info));
  };

  const logout = () => {
    token.value = '';
    userInfo.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const initUser = () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      userInfo.value = JSON.parse(savedUser);
    }
  };

  return {
    token,
    userInfo,
    isLoggedIn,
    isAdmin,
    isCustomer,
    setToken,
    setUserInfo,
    logout,
    initUser
  };
});
