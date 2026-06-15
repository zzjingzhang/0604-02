<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">预约排期</h1>
      <div class="flex items-center space-x-4">
        <button
          @click="prevDay"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          上一天
        </button>
        <input
          v-model="selectedDate"
          type="date"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          @change="fetchData"
        />
        <button
          @click="nextDay"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          下一天
        </button>
      </div>
    </div>

    <div
      v-if="unassignedAppointments.length > 0"
      class="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4"
    >
      <h3 class="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
        <span class="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
        待分配技师 ({{ unassignedAppointments.length }} 个)
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div
          v-for="apt in unassignedAppointments"
          :key="apt.id"
          class="bg-white border border-yellow-300 rounded-lg p-3 text-sm"
        >
          <div class="font-medium text-gray-800">{{ apt.service_name }}</div>
          <div class="text-gray-600">顾客: {{ apt.username }}</div>
          <div class="text-gray-600">时间: {{ apt.appointment_time }}</div>
          <div class="text-gray-600">时长: {{ apt.duration }} 分钟</div>
          <span
            class="inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
          >
            {{ getStatusText(apt.status) }}
          </span>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-md p-6 overflow-x-auto">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">
        {{ selectedDate }} 技师排期表
      </h3>

      <div class="min-w-max">
        <div class="flex border-b-2 border-gray-200">
          <div
            class="w-20 flex-shrink-0 p-3 font-medium text-gray-500 text-center bg-gray-50"
          >
            时间
          </div>
          <div
            v-for="tech in technicians"
            :key="tech.id"
            class="w-44 flex-shrink-0 p-3 font-medium text-gray-700 text-center border-l border-gray-200"
          >
            <div>{{ tech.name }}</div>
            <div class="text-xs text-gray-400 font-normal">
              {{ tech.phone || "—" }}
            </div>
          </div>
        </div>

        <div
          v-for="(slot, slotIndex) in timeSlots"
          :key="slot"
          class="flex border-b border-gray-100"
        >
          <div
            class="w-20 flex-shrink-0 p-2 text-sm text-gray-500 text-right pr-3 bg-gray-50 flex items-center justify-end"
          >
            {{ slot }}
          </div>

          <div
            v-for="tech in technicians"
            :key="tech.id"
            class="w-44 flex-shrink-0 border-l border-gray-100 relative h-12"
            :class="slotIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'"
          >
            <template v-if="getAppointmentStartAtSlot(tech.id, slotIndex)">
              <div
                class="absolute left-1 right-1 top-1 bottom-1 rounded-md p-1 text-xs text-white z-10 overflow-hidden"
                :class="
                  getStatusBgClass(
                    getAppointmentStartAtSlot(tech.id, slotIndex)!.status,
                  )
                "
                :style="{
                  height: `calc(${getSlotSpan(getAppointmentStartAtSlot(tech.id, slotIndex)!)} * 2.75rem - 0.5rem)`,
                }"
              >
                <div class="font-medium truncate">
                  {{
                    getAppointmentStartAtSlot(tech.id, slotIndex)!.service_name
                  }}
                </div>
                <div class="opacity-80 truncate">
                  {{ getAppointmentStartAtSlot(tech.id, slotIndex)!.username }}
                </div>
                <div class="opacity-70 text-[10px]">
                  {{
                    getStatusText(
                      getAppointmentStartAtSlot(tech.id, slotIndex)!.status,
                    )
                  }}
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 bg-white rounded-xl shadow-md p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">状态图例</h3>
      <div class="flex flex-wrap gap-4">
        <div class="flex items-center">
          <span class="w-4 h-4 rounded bg-yellow-500 mr-2"></span>
          <span class="text-sm text-gray-600">待确认</span>
        </div>
        <div class="flex items-center">
          <span class="w-4 h-4 rounded bg-blue-500 mr-2"></span>
          <span class="text-sm text-gray-600">已确认</span>
        </div>
        <div class="flex items-center">
          <span class="w-4 h-4 rounded bg-green-500 mr-2"></span>
          <span class="text-sm text-gray-600">维修中</span>
        </div>
        <div class="flex items-center">
          <span class="w-4 h-4 rounded bg-gray-500 mr-2"></span>
          <span class="text-sm text-gray-600">已完成</span>
        </div>
        <div class="flex items-center">
          <span class="w-4 h-4 rounded bg-red-500 mr-2"></span>
          <span class="text-sm text-gray-600">已取消</span>
        </div>
        <div class="flex items-center">
          <span
            class="w-4 h-4 rounded bg-yellow-100 border-2 border-yellow-500 border-dashed mr-2"
          ></span>
          <span class="text-sm text-gray-600">待分配技师</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { getScheduleByDate } from "@/api/appointments";
import { getAllTechnicians } from "@/api/technicians";
import dayjs from "dayjs";

interface Technician {
  id: number;
  name: string;
  phone: string;
}

interface Appointment {
  id: number;
  technician_id: number | null;
  appointment_time: string;
  service_name: string;
  duration: number;
  username: string;
  status: string;
}

const selectedDate = ref(dayjs().format("YYYY-MM-DD"));
const technicians = ref<Technician[]>([]);
const appointments = ref<Appointment[]>([]);

const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];

const slotToIndex: Record<string, number> = {};
timeSlots.forEach((slot, idx) => {
  slotToIndex[slot] = idx;
});

const unassignedAppointments = computed(() => {
  return appointments.value.filter((a) => !a.technician_id);
});

const fetchData = async () => {
  const [techRes, scheduleRes]: any = await Promise.all([
    getAllTechnicians(),
    getScheduleByDate(selectedDate.value),
  ]);
  technicians.value = techRes.technicians || [];
  appointments.value = scheduleRes.appointments || [];
};

const getAppointmentStartAtSlot = (
  techId: number,
  slotIndex: number,
): Appointment | undefined => {
  return appointments.value.find((a) => {
    if (a.technician_id !== techId) return false;
    const startIdx = slotToIndex[a.appointment_time];
    return startIdx === slotIndex;
  });
};

const getSlotSpan = (apt: Appointment): number => {
  const duration = apt.duration || 60;
  const slots = Math.ceil(duration / 30);
  const startIdx = slotToIndex[apt.appointment_time];
  if (startIdx === undefined) return slots;

  const isMorning = startIdx <= 5;

  if (isMorning) {
    const maxMorningSlots = 6 - startIdx;
    return Math.min(slots, maxMorningSlots);
  } else {
    const maxAfternoonSlots = 14 - startIdx;
    return Math.min(slots, maxAfternoonSlots);
  }
};

const getStatusBgClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: "bg-yellow-500",
    confirmed: "bg-blue-500",
    processing: "bg-green-500",
    completed: "bg-gray-500",
    cancelled: "bg-red-500",
  };
  return classes[status] || "bg-gray-400";
};

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: "待确认",
    confirmed: "已确认",
    processing: "维修中",
    completed: "已完成",
    cancelled: "已取消",
  };
  return texts[status] || status;
};

const prevDay = () => {
  selectedDate.value = dayjs(selectedDate.value)
    .subtract(1, "day")
    .format("YYYY-MM-DD");
  fetchData();
};

const nextDay = () => {
  selectedDate.value = dayjs(selectedDate.value)
    .add(1, "day")
    .format("YYYY-MM-DD");
  fetchData();
};

onMounted(fetchData);
</script>
