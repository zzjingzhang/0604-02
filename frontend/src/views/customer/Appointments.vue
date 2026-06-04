<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">预约记录</h1>
    
    <div class="bg-white rounded-xl shadow-md overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">服务项目</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">预约日期</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">预约时间</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">技师</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">状态</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="apt in appointments" :key="apt.id">
            <td class="px-6 py-4">
              <div class="font-medium text-gray-800">{{ apt.service_name }}</div>
              <div class="text-sm text-gray-500">¥{{ apt.price }}</div>
            </td>
            <td class="px-6 py-4 text-gray-600">{{ apt.appointment_date }}</td>
            <td class="px-6 py-4 text-gray-600">{{ apt.appointment_time }}</td>
            <td class="px-6 py-4 text-gray-600">{{ apt.technician_name || '待分配' }}</td>
            <td class="px-6 py-4">
              <span
                class="px-3 py-1 rounded-full text-sm font-medium"
                :class="getStatusClass(apt.status)"
              >
                {{ getStatusText(apt.status) }}
              </span>
            </td>
            <td class="px-6 py-4">
              <router-link
                :to="`/customer/progress?appointmentId=${apt.id}`"
                class="text-blue-600 hover:underline"
              >
                查看进度
              </router-link>
            </td>
          </tr>
          <tr v-if="appointments.length === 0">
            <td colspan="6" class="px-6 py-12 text-center text-gray-500">
              暂无预约记录
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getMyAppointments } from '@/api/appointments';

const appointments = ref<any[]>([]);

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    processing: '维修中',
    completed: '已完成',
    cancelled: '已取消'
  };
  return texts[status] || status;
};

onMounted(async () => {
  const res: any = await getMyAppointments();
  appointments.value = res.appointments;
});
</script>
