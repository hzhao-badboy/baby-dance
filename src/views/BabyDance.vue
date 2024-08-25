<template>
  <div class="baby-dance-container">
    <h1 class="title">数胎动</h1>
    <div>
      <div class="center_content">
        <div class="center_content_left">倒计时：{{ showTime }}</div>
        <div class="center_content_right">
          胎动总数：
          <div class="total_number">{{ totalCount }}</div>
        </div>
      </div>
      <div class="start-button">
        <el-button type="primary" class="record" @click="addRecord">
          <div v-if="startEnabled">
            {{ validCount }} <span class="count_unit">次</span>
          </div>
          <div v-else>开始</div>
        </el-button>
        <div class="stop">
          <el-button
            @click="stopVisible = true"
            size="default"
            round
            type="danger"
            >取消</el-button
          >
        </div>
      </div>

      <div style="margin-top: 10px">
        <span class="tip_title">1小时计数法：</span
        >孕28-30周开始，每天计数1小时。从自觉胎动开始，在1小时内，胎动1次记一次，连续胎动记一次，1小时胎动总数大于3-4次为正常，如1小时不足3次，则继续计数1小时，2小时胎动总数大于6次为正常。<br />
        <span class="tip_title">就诊提醒：</span
        >如果胎动计算异常，或自觉胎动数较平时的平均数明显减少，应<span
          class="warning"
          >立即就诊！</span
        >
      </div>
    </div>

    <el-table :data="historyData" style="width: 100%">
      <el-table-column prop="start_time" label="开始时间" />
      <el-table-column prop="end_time" label="结束时间" />
      <el-table-column prop="valid_count" label="有效次数" />
      <el-table-column prop="total_count" label="总次数" />
    </el-table>

    <el-dialog
      title="本次结果"
      v-model="successVisible"
      :before-close="countSuccess"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      center
      :show-close="false"
      custom-class="tip_dialog"
    >
      <span
        >有效胎动数：<span class="valied_count">{{ validCount }}</span></span
      >
      <template v-slot:footer>
        <span class="dialog-footer">
          <el-button type="danger" size="default" round @click="countSuccess"
            >确 定</el-button
          >
        </span>
      </template>
    </el-dialog>
    <el-dialog
      title="提示"
      v-model="stopVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      center
      custom-class="tip_dialog"
    >
      <span>确定取消本次记录吗？</span>
      <template v-slot:footer>
        <span class="dialog-footer">
          <el-button
            type="primary"
            class="cancel_btn"
            size="default"
            @click="stopVisible = false"
            round
            >取 消</el-button
          >
          <el-button type="danger" size="default" @click="stop" round
            >确 定</el-button
          >
        </span>
      </template>
    </el-dialog>

    <el-dialog title="" v-model="userDialogVisible" width="30%">
      <el-input v-model="userName" placeholder="昵称" label="昵称" clearable />
      <template #footer>
        <span>
          <el-button @click="userDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveUser">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { addToNotion } from "@/api/baby";
import Moment from "moment";
import { onMounted, ref } from "vue";

const startEnabled = ref(false);
const totalCount = ref(0);
const validCount = ref(0);
const lastClickTime = ref(null);
const timeInterval = ref(null);
const showTime = ref("00:00");
const successVisible = ref(false);
const stopVisible = ref(false);
const className = ref("");
const diffSeconds = ref(0);
const dd = ref<HistoryData>({} as HistoryData);
const historyData = ref<HistoryData[]>([]);
const userName = ref("");
const userDialogVisible = ref(false);

interface HistoryData {
  start_time: string;
  end_time: string;
  valid_count: number;
  total_count: number;
}

onMounted(() => {
  userName.value = localStorage.getItem("user_name");
  if (!userName.value) {
    userDialogVisible.value = true;
  }

  const oldRecords = localStorage.getItem("history_record");
  if (oldRecords) {
    historyData.value = JSON.parse(oldRecords) as HistoryData[];
  }

  const rec = document.getElementsByClassName("record")[0];
  // 动画结束时事件
  rec.addEventListener("webkitAnimationEnd", function () {
    className.value = "record";
  });
});

const saveUser = () => {
  localStorage.setItem("user_name", userName.value);
  userDialogVisible.value = false;
};

let data = {
  parent: {
    type: "database_id",
    database_id: "c06b9418ffad4511983e3c953433b9ff",
  },
  properties: {},
};

const countSuccess = () => {
  dd.value["end_time"] = Moment().format("YYYY-MM-DD HH:mm:ss");
  dd.value["valid_count"] = validCount.value;
  dd.value["total_count"] = totalCount.value;
  historyData.value.unshift(dd.value);
  localStorage.setItem("history_record", JSON.stringify(historyData.value));

  data.properties = {
    昵称: {
      type: "title",
      title: [
        {
          type: "text",
          text: {
            content: userName.value,
          },
        },
      ],
    },
    开始时间: {
      type: "date",
      date: {
        start: dd.value.start_time,
      },
    },
    结束时间: {
      type: "date",
      date: {
        start: dd.value.end_time,
      },
    },
    有效次数: {
      type: "number",
      number: dd.value.valid_count,
    },
    总次数: {
      type: "number",
      number: dd.value.total_count,
    },
  };

  addToNotion(data);

  successVisible.value = false;
  totalCount.value = 0;
  validCount.value = 0;
  lastClickTime.value = null;
  startEnabled.value = false;
  showTime.value = "00:00";
};

const stop = () => {
  clearInterval(timeInterval.value);
  totalCount.value = 0;
  validCount.value = 0;
  lastClickTime.value = null;
  diffSeconds.value = 0;
  startEnabled.value = false;
  showTime.value = "00:00";
  stopVisible.value = false;
};

const start = () => {
  totalCount.value = 0;
  validCount.value = 0;
  lastClickTime.value = null;
  diffSeconds.value = 3600;
  dd.value["start_time"] = Moment().format("YYYY-MM-DD HH:mm:ss");
  startEnabled.value = true;
  clearInterval(timeInterval.value);
  getSurplusTime();
  timeInterval.value = setInterval(getSurplusTime, 1000);
};

const getSurplusTime = () => {
  diffSeconds.value = diffSeconds.value - 1;

  if (diffSeconds.value !== 0) {
    let m = Math.floor(diffSeconds.value / 60);
    let s = diffSeconds.value - m * 60;
    let ss = s.toString();
    let mm = m.toString();
    if (s < 10) {
      ss = "0" + ss;
    }
    if (m < 10) {
      mm = "0" + mm;
    }
    showTime.value = mm + ":" + ss;
    console.log("aaa:", s);
  } else {
    showTime.value = "00:00";
    successVisible.value = true;
    clearInterval(timeInterval.value);
  }
};

const addRecord = () => {
  const rec = document.getElementsByClassName("record")[0];
  if (!startEnabled.value) {
    start();
  } else {
    const nowTime = Moment();
    totalCount.value += 1;
    if (lastClickTime.value == null) {
      rec.className = "record record_animation";
      validCount.value += 1;
    } else {
      const interTime = nowTime.valueOf() - lastClickTime.value;
      if (interTime >= 5 * 60 * 1000) {
        rec.className = "record record_animation";
        validCount.value += 1;
      }
    }
    lastClickTime.value = nowTime;
  }
};
</script>

<style scoped>
.start-button {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.baby-dance-container {
  padding: 3rem;
}

.tip_title {
  color: #ff8a65;
}
.warning {
  color: red;
  font-size: 1rem;
}
.instruction {
  position: fixed;
  bottom: 20px;
  left: 20px;
  color: #9e9e9e;
  font-size: 1.5rem;
}
.valied_count {
  color: #a4d465;
  font-size: 2rem;
}
.cancel_btn {
  background: #ffffff;
  color: #ff8a65;
  border-color: #ff8a65;
}
.title {
  color: violet;
}
.stop {
  margin-top: 70px;
}
.show_time {
  margin-right: 50px;
}
.center_content {
  display: flex;
  align-items: center;
  margin: 50px 0;
  font-size: 1rem;
  color: rgb(126, 34, 80);
}
.center_content_left {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.center_content_right {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.total_number {
  font-size: 2rem;
  color: rgb(16, 228, 243);
}
.count_unit {
  font-size: 1rem;
}
.record {
  display: block;
  color: #fff;
  width: 200px;
  height: 200px;
  border-radius: 100px;
  font-size: 3rem;
  background-color: rgb(243, 137, 199);
  border: 1px solid rgb(243, 137, 199);
}
.record:focus {
  background-color: rgb(243, 137, 199);
  border-color: rgb(243, 137, 199);
}
.record:hover {
  background-color: rgb(243, 137, 199);
  border-color: rgb(243, 137, 199);
}
.record_text {
  margin-top: 50px;
  font-size: 20px;
}
.record_animation {
  animation: free_download 1s linear alternate 1;
}
@keyframes free_download {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
</style>
