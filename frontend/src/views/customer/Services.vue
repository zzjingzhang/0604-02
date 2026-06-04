<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">维修项目</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="service in services"
        :key="service.id"
        class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
      >
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-xl font-semibold text-gray-800">{{ service.name }}</h3>
          <span class="text-2xl font-bold text-blue-600">¥{{ service.price }}</span>
        </div>
        <p class="text-gray-600 mb-4">{{ service.description }}</p>
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-500">预计时长：{{ service.duration }}分钟</span>
          <router-link
            :to="{ path: '/customer/appointment', query: { serviceId: service.id } }"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            立即预约
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getServices } from '@/api/services';

const services = ref<any[]>([]);

onMounted(async () => {
  const res: any = await getServices();
  services.value = res.services;
});
</script>
