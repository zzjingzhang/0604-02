<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">工单管理</h1>
    </div>

    <div class="bg-white rounded-xl shadow-md overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">工单ID</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">顾客</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">服务项目</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">技师</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">状态</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">进度说明</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="order in workOrders" :key="order.id">
            <td class="px-6 py-4 text-gray-800">#{{ order.id }}</td>
            <td class="px-6 py-4 font-medium text-gray-800">{{ order.username }}</td>
            <td class="px-6 py-4 text-gray-600">{{ order.service_name }}</td>
            <td class="px-6 py-4 text-gray-600">{{ order.technician_name || '待分配' }}</td>
            <td class="px-6 py-4">
              <span
                class="px-3 py-1 rounded-full text-sm font-medium"
                :class="getStatusClass(order.status)"
              >
                {{ getStatusText(order.status) }}
              </span>
            </td>
            <td class="px-6 py-4">
              <input
                v-if="order.status !== 'completed'"
                v-model="progressMap[order.id]"
                type="text"
                class="px-2 py-1 border border-gray-300 rounded text-sm w-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="进度说明"
              />
              <span v-else class="text-gray-500 text-sm">{{ order.progress || '-' }}</span>
            </td>
            <td class="px-6 py-4 space-x-2">
              <button
                v-if="order.status === 'waiting'"
                @click="startOrder(order.id)"
                class="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
              >
                开始
              </button>
              <button
                v-if="order.status === 'in_progress'"
                @click="updateOrderProgress(order.id)"
                class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
              >
                更新
              </button>
              <button
                v-if="order.status === 'in_progress'"
                @click="completeOrder(order.id)"
                class="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
              >
                完成
              </button>
            </td>
          </tr>
          <tr v-if="workOrders.length === 0">
            <td colspan="7" class="px-6 py-12 text-center text-gray-500">
              暂无工单记录
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { getAllWorkOrders, startWorkOrder, completeWorkOrder, updateWorkOrderStatus } from '@/api/workOrders';

const workOrders = ref<any[]>([]);
const progressMap = reactive<Record<number, string>>({});

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    waiting: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    waiting: '等待维修',
    in_progress: '维修中',
    completed: '已完成'
  };
  return texts[status] || status;
};

const fetchData = async () => {
  const res: any = await getAllWorkOrders();
  workOrders.value = res.workOrders;
  
  workOrders.value.forEach((order: any) => {
    progressMap[order.id] = order.progress || '';
  });
};

const startOrder = async (id: number) => {
  try {
    await startWorkOrder(id);
    await fetchData();
    alert('工单开始成功');
  } catch (error: any) {
    alert(error.response?.data?.message || '操作失败');
  }
};

const completeOrder = async (id: number) => {
  try {
    await completeWorkOrder(id);
    await fetchData();
    alert('工单完成成功');
  } catch (error: any) {
    alert(error.response?.data?.message || '操作失败');
  }
};

const updateOrderProgress = async (id: number) => {
  try {
    await updateWorkOrderStatus(id, 'in_progress', progressMap[id]);
    try {
      await fetchData();
      alert('更新成功，页面已刷新为最新进度');
    } catch (refreshError: any) {
      alert('进度更新成功，但列表刷新失败：' + (refreshError.response?.data?.message || '请手动刷新页面'));
    }
  } catch (error: any) {
    alert(error.response?.data?.message || '更新失败');
  }
};

onMounted(fetchData);
</script>
