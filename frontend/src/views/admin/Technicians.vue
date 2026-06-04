<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">技师管理</h1>
      <button
        @click="showAddModal = true"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        添加技师
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-md overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">姓名</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">电话</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">专长</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">状态</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-600">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="tech in technicians" :key="tech.id">
            <td class="px-6 py-4 font-medium text-gray-800">{{ tech.name }}</td>
            <td class="px-6 py-4 text-gray-600">{{ tech.phone }}</td>
            <td class="px-6 py-4 text-gray-600">{{ tech.specialty }}</td>
            <td class="px-6 py-4">
              <span
                class="px-3 py-1 rounded-full text-sm font-medium"
                :class="tech.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
              >
                {{ tech.status === 'active' ? '在职' : '离职' }}
              </span>
            </td>
            <td class="px-6 py-4 space-x-2">
              <button
                @click="editTech(tech)"
                class="text-blue-600 hover:underline"
              >
                编辑
              </button>
              <button
                @click="deleteTech(tech.id)"
                class="text-red-600 hover:underline"
              >
                删除
              </button>
            </td>
          </tr>
          <tr v-if="technicians.length === 0">
            <td colspan="5" class="px-6 py-12 text-center text-gray-500">
              暂无技师记录
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 class="text-xl font-bold text-gray-800 mb-6">
          {{ showAddModal ? '添加技师' : '编辑技师' }}
        </h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">姓名</label>
            <input
              v-model="form.name"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">电话</label>
            <input
              v-model="form.phone"
              type="tel"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">专长</label>
            <input
              v-model="form.specialty"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div v-if="showEditModal">
            <label class="block text-sm font-medium text-gray-700 mb-2">状态</label>
            <select
              v-model="form.status"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="active">在职</option>
              <option value="inactive">离职</option>
            </select>
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
import { getAllTechnicians, createTechnician, updateTechnician, deleteTechnician } from '@/api/technicians';

const technicians = ref<any[]>([]);
const showAddModal = ref(false);
const showEditModal = ref(false);
const editingId = ref<number | null>(null);

const form = reactive({
  name: '',
  phone: '',
  specialty: '',
  status: 'active'
});

const fetchData = async () => {
  const res: any = await getAllTechnicians();
  technicians.value = res.technicians;
};

const resetForm = () => {
  form.name = '';
  form.phone = '';
  form.specialty = '';
  form.status = 'active';
};

const closeModal = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  editingId.value = null;
  resetForm();
};

const editTech = (tech: any) => {
  editingId.value = tech.id;
  form.name = tech.name;
  form.phone = tech.phone;
  form.specialty = tech.specialty;
  form.status = tech.status;
  showEditModal.value = true;
};

const deleteTech = async (id: number) => {
  if (!confirm('确定要删除该技师吗？')) return;
  try {
    await deleteTechnician(id);
    fetchData();
  } catch (error: any) {
    alert(error.response?.data?.message || '删除失败');
  }
};

const handleSubmit = async () => {
  try {
    if (showAddModal.value) {
      await createTechnician(form);
    } else if (showEditModal.value && editingId.value) {
      await updateTechnician(editingId.value, form);
    }
    closeModal();
    fetchData();
  } catch (error: any) {
    alert(error.response?.data?.message || '操作失败');
  }
};

onMounted(fetchData);
</script>
