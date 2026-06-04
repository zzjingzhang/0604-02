<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">预约管理</h1>
    </div>

    <div class="bg-white rounded-xl shadow-md overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">顾客</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">服务项目</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">日期时间</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">技师</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">状态</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="apt in appointments" :key="apt.id">
            <td class="px-6 py-4">
              <div class="font-medium text-gray-800">{{ apt.username }}</div>
            </td>
            <td class="px-6 py-4">
              <div class="font-medium text-gray-800">{{ apt.service_name }}</div>
              <div class="text-sm text-gray-500">¥{{ apt.price }}</div>
            </td>
            <td class="px-6 py-4 text-gray-600">
              {{ apt.appointment_date }} {{ apt.appointment_time }}
            </td>
            <td class="px-6 py-4">
              <select
                :value="apt.technician_id || ''"
                @change="handleTechnicianChange(apt.id, $event)"
                class="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">待分配</option>
                <option v-for="tech in technicians" :key="tech.id" :value="tech.id">
                  {{ tech.name }}
                </option>
              </select>
            </td>
            <td class="px-6 py-4">
              <span
                class="px-3 py-1 rounded-full text-sm font-medium"
                :class="getStatusClass(apt.status)"
              >
                {{ getStatusText(apt.status) }}
              </span>
            </td>
            <td class="px-6 py-4">
              <select
                :value="apt.status"
                @change="handleStatusChange(apt.id, $event)"
                class="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="pending">待确认</option>
                <option value="confirmed">已确认</option>
                <option value="processing">维修中</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
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
import { getAllAppointments, updateAppointmentStatus, assignTechnician as assignAppointmentTechnician } from '@/api/appointments';
import { getAllTechnicians } from '@/api/technicians';

const appointments = ref<any[]>([]);
const technicians = ref<any[]>([]);

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

const fetchData = async () => {
  const [appointmentsRes, techniciansRes] = await Promise.all([
    getAllAppointments(),
    getAllTechnicians()
  ]);
  appointments.value = (appointmentsRes as any).appointments;
  technicians.value = (techniciansRes as any).technicians;
};

const updateStatus = async (id: number, status: string) => {
  try {
    await updateAppointmentStatus(id, status);
    fetchData();
  } catch (error: any) {
    alert(error.response?.data?.message || '更新失败');
  }
};

const handleStatusChange = (id: number, event: Event) => {
  updateStatus(id, (event.target as HTMLSelectElement).value);
};

const assignTechnician = async (aptId: number, techId: string) => {
  if (!techId) return;
  try {
    await assignAppointmentTechnician(aptId, Number(techId));
    fetchData();
  } catch (error: any) {
    alert(error.response?.data?.message || '分配失败');
  }
};

const handleTechnicianChange = (aptId: number, event: Event) => {
  assignTechnician(aptId, (event.target as HTMLSelectElement).value);
};

onMounted(fetchData);
</script>
