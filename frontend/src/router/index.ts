import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useUserStore } from '@/store/user';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { guest: true }
  },
  {
    path: '/customer',
    component: () => import('@/layouts/CustomerLayout.vue'),
    meta: { requiresAuth: true, role: 'customer' },
    children: [
      {
        path: '',
        redirect: '/customer/services'
      },
      {
        path: 'services',
        name: 'CustomerServices',
        component: () => import('@/views/customer/Services.vue')
      },
      {
        path: 'appointment',
        name: 'CustomerAppointment',
        component: () => import('@/views/customer/Appointment.vue')
      },
      {
        path: 'appointments',
        name: 'CustomerAppointments',
        component: () => import('@/views/customer/Appointments.vue')
      },
      {
        path: 'progress',
        name: 'CustomerProgress',
        component: () => import('@/views/customer/Progress.vue')
      }
    ]
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue')
      },
      {
        path: 'appointments',
        name: 'AdminAppointments',
        component: () => import('@/views/admin/Appointments.vue')
      },
      {
        path: 'technicians',
        name: 'AdminTechnicians',
        component: () => import('@/views/admin/Technicians.vue')
      },
      {
        path: 'services',
        name: 'AdminServices',
        component: () => import('@/views/admin/Services.vue')
      },
      {
        path: 'work-orders',
        name: 'AdminWorkOrders',
        component: () => import('@/views/admin/WorkOrders.vue')
      },
      {
        path: 'schedule',
        name: 'AdminSchedule',
        component: () => import('@/views/admin/Schedule.vue')
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore();
  userStore.initUser();

  if (to.meta.guest && userStore.isLoggedIn) {
    if (userStore.isAdmin) {
      next('/admin/dashboard');
    } else {
      next('/customer/services');
    }
    return;
  }

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login');
    return;
  }

  if (to.meta.role && to.meta.role !== userStore.userInfo?.role) {
    if (userStore.isAdmin) {
      next('/admin/dashboard');
    } else {
      next('/customer/services');
    }
    return;
  }

  next();
});

export default router;
