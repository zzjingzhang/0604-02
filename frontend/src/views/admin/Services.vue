<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">服务项目管理</h1>
      <button
        @click="showAddModal = true"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        添加服务
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-md overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">服务名称</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">描述</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">价格</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">时长</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="service in services" :key="service.id">
            <td class="px-6 py-4 font-medium text-gray-800">{{ service.name }}</td>
            <td class="px-6 py-4 text-gray-600 max-w-xs truncate">{{ service.description }}</td>
            <td class="px-6 py-4 text-gray-800 font-semibold">¥{{ service.price }}</td>
            <td class="px-6 py-4 text-gray-600">{{ service.duration }}分钟</td>
            <td class="px-6 py-4 space-x-2">
              <button
                @click="editService(service)"
                class="text-blue-600 hover:underline"
              >
                编辑
              </button>
              <button
                @click="deleteServiceItem(service.id)"
                class="text-red-600 hover:underline"
              >
                删除
              </button>
            </td>
          </tr>
          <tr v-if="services.length === 0">
            <td colspan="5" class="px-6 py-12 text-center text-gray-500">
              暂无服务项目
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 class="text-xl font-bold text-gray-800 mb-6">
          {{ showAddModal ? '添加服务' : '编辑服务' }}
        </h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">服务名称</label>
            <input
              v-model="form.name"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">描述</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            ></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">价格 (元)</label>
              <input
                v-model.number="form.price"
                type="number"
                min="0"
                step="0.01"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">时长 (分钟)</label>
              <input
                v-model.number="form.duration"
                type="number"
                min="1"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
          </div>
          <div class="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {{ showAddModal ? '添加' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { getAdminServices, createService, updateService, deleteService } from '@/api/services';

const services = ref<any[]>([]);
const showAddModal = ref(false);
const showEditModal = ref(false);
const editingId = ref<number | null>(null);

const form = reactive({
  name: '',
  description: '',
  price: 0,
  duration: 30
});

const fetchData = async () => {
  const res: any = await getAdminServices();
  services.value = res.services;
};

const resetForm = () => {
  form.name = '';
  form.description = '';
  form.price = 0;
  form.duration = 30;
};

const closeModal = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  editingId.value = null;
  resetForm();
};

const editService = (service: any) => {
  editingId.value = service.id;
  form.name = service.name;
  form.description = service.description;
  form.price = service.price;
  form.duration = service.duration;
  showEditModal.value = true;
};

const deleteServiceItem = async (id: number) => {
  if (!confirm('确定要删除该服务项目吗？')) return;
  try {
    await deleteService(id);
    fetchData();
  } catch (error: any) {
    alert(error.response?.data?.message || '删除失败');
  }
};

const handleSubmit = async () => {
  try {
    if (showAddModal.value) {
      await createService(form);
    } else if (showEditModal.value && editingId.value) {
      await updateService(editingId.value, form);
    }
    closeModal();
    fetchData();
  } catch (error: any) {
    alert(error.response?.data?.message || '操作失败');
  }
};

onMounted(fetchData);
</script>
