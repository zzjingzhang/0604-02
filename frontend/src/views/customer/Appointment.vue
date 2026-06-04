<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">在线预约</h1>
    
    <div class="bg-white rounded-xl shadow-md p-6 max-w-2xl">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">选择服务项目 *</label>
          <select
            v-model="form.serviceId"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          >
            <option value="">请选择服务项目</option>
            <option v-for="service in services" :key="service.id" :value="service.id">
              {{ service.name }} - ¥{{ service.price }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">选择技师</label>
          <select
            v-model="form.technicianId"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">不指定（系统自动分配）</option>
            <option v-for="tech in technicians" :key="tech.id" :value="tech.id">
              {{ tech.name }} - {{ tech.specialty }}
            </option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">预约日期 *</label>
            <input
              v-model="form.date"
              type="date"
              :min="minDate"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">预约时间 *</label>
            <select
              v-model="form.time"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            >
              <option value="">请选择时间</option>
              <option v-for="time in timeSlots" :key="time" :value="time">
                {{ time }}
              </option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">车辆信息</label>
          <input
            v-model="form.carInfo"
            type="text"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="例如：奥迪A6L 2020款 黑色"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">问题描述</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            placeholder="请描述您的车辆问题..."
          ></textarea>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
        >
          {{ loading ? '提交中...' : '提交预约' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getServices } from '@/api/services';
import { getActiveTechnicians } from '@/api/technicians';
import { createAppointment, checkConflict } from '@/api/appointments';
import dayjs from 'dayjs';

const route = useRoute();
const router = useRouter();

const services = ref<any[]>([]);
const technicians = ref<any[]>([]);
const loading = ref(false);

const form = ref({
  serviceId: '',
  technicianId: '',
  date: '',
  time: '',
  carInfo: '',
  description: ''
});

const minDate = computed(() => dayjs().format('YYYY-MM-DD'));

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

onMounted(async () => {
  const [servicesRes, techsRes] = await Promise.all([
    getServices(),
    getActiveTechnicians()
  ]);
  services.value = (servicesRes as any).services;
  technicians.value = (techsRes as any).technicians;

  if (route.query.serviceId) {
    form.value.serviceId = route.query.serviceId as string;
  }
});

const handleSubmit = async () => {
  try {
    loading.value = true;
    
    const selectedService = services.value.find(s => s.id === Number(form.value.serviceId));
    
    const conflictData: any = {
      date: form.value.date,
      time: form.value.time,
      duration: selectedService?.duration || 60
    };
    
    if (form.value.technicianId) {
      conflictData.technicianId = Number(form.value.technicianId);
    }
    
    const conflictRes: any = await checkConflict(conflictData);
    
    if (conflictRes.hasConflict) {
      alert('该时间段已有预约，请选择其他时间');
      return;
    }

    const submitData: any = {
      serviceId: Number(form.value.serviceId),
      date: form.value.date,
      time: form.value.time,
      carInfo: form.value.carInfo,
      description: form.value.description
    };

    if (form.value.technicianId) {
      submitData.technicianId = Number(form.value.technicianId);
    }

    await createAppointment(submitData);
    alert('预约成功！');
    router.push('/customer/appointments');
  } catch (error: any) {
    alert(error.response?.data?.message || '预约失败');
  } finally {
    loading.value = false;
  }
};
</script>
