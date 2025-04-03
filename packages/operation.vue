<template>
  <div style="margin-top: 80px">
    <div v-if="type === ''">
      <h3>容器内容</h3>
      <div class="item">
        <div class="item">宽度</div>
        <el-input v-model="container.width"></el-input>
      </div>
      <div class="item">
        <div class="item">高度</div>
        <el-input v-model="container.height"></el-input>
      </div>
    </div>
    <div v-if="type === 'text'">
      <h3>文本</h3>
      <div class="item">
        <div class="item">文本内容</div>
        <el-input v-model="text.value"></el-input>
      </div>
      <div class="item">
        <div class="item">字体颜色</div>
        <el-color-picker v-model="text.color" />
      </div>
      <div class="item">
        <div class="item">字体大小</div>
        <el-input v-model="text.size"></el-input>
      </div>
      <div class="item">
        <div class="item">视觉层级</div>
        <el-input v-model="text.zIndex"></el-input>
      </div>
    </div>
    <div v-else-if="type === 'input'">
      <h3>输入框</h3>
      <div class="item">
        <div class="item">绑定内容</div>
        <el-input v-model="input.value"></el-input>
      </div>
      <div class="item">
        <div class="item">视觉层级</div>
        <el-input v-model="input.zIndex"></el-input>
      </div>
    </div>
    <div v-else-if="type === 'button'">
      <h3>按钮</h3>
      <div class="item">
        <div class="item">
          <div class="item">按钮文字</div>
          <el-input v-model="button.value"></el-input>
        </div>
        <div class="item">按钮样式</div>
        <el-select v-model="button.type">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <div class="item">
        <div class="item">按钮大小</div>
        <el-select v-model="button.size">
          <el-option value="small">小</el-option>
          <el-option value="default">中</el-option>
          <el-option value="large">大</el-option>
        </el-select>
      </div>
      <div class="item">
        <div class="item">视觉层级</div>
        <el-input v-model="button.zIndex"></el-input>
      </div>
    </div>

    <div style="display: flex">
      <el-button type="primary" @click="save">应用</el-button>
      <el-button @click="reset">重置</el-button>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch, ref } from "vue";
import {
  ElInput,
  ElButton,
  ElMessage,
  ElColorPicker,
  ElSelect,
  ElOption,
} from "element-plus";
const container = reactive({
  width: undefined,
  height: undefined,
  zIndex: undefined,
});
const text = reactive({
  value: undefined,
  color: undefined,
  size: undefined,
  zIndex: undefined,
});
const button = reactive({
  type: "default",
  size: undefined,
  value: undefined,
  zIndex: undefined,
});
const input = reactive({
  value: "",
});
const options = ref([
  { label: "默认", value: "default" },
  { label: "主要", value: "primary" },
  { label: "成功", value: "success" },
  { label: "信息", value: "info" },
  { label: "警告", value: "warning" },
  { label: "危险", value: "danger" },
]);
const props = defineProps({
  type: String,
  data: Object,
  item: Object,
});
const data = defineModel("data");

const save = () => {
  if (props.type === "") {
    if (container.width && container.height) {
      data.value.container = container;
    } else {
      return ElMessage.error("请填写宽度或高度");
    }
  } else {
    let index = data.value.blocks.findIndex(
      (item) => item.ref === props.item.ref
    );
    if (props.type === "text") {
      for (const key in text) {
        if (text[key] !== undefined && text[key] !== "") {
          data.value.blocks[index][key] = text[key];
        }
      }
    } else if (props.type === "button") {
      for (const key in button) {
        if (button[key] !== undefined && button[key] !== "") {
          data.value.blocks[index][key] = button[key];
        }
      }
    } else if (props.type === "input") {
      for (const key in input) {
        if (input[key] !== undefined && input[key] !== "") {
          data.value.blocks[index][key] = input[key];
        }
      }
    }
  }
};
const reset = () => {};
watch(
  () => props.item,
  (newVal) => {
    if (!newVal) return;
    switch (props.type) {
      case "text":
        text.value = newVal.value;
        text.color = newVal.color;
        text.size = newVal.size;
        text.zIndex = newVal.zIndex;
        break;

      case "button":
        button.type = newVal.type;
        button.size = newVal.size;
        button.value = newVal.value;
        button.zIndex = newVal.zIndex;
        break;

      case "input":
        input.value = newVal.value;
        input.zIndex = newVal.zIndex;
        break;
    }
  },
  { immediate: true }
);
</script>

<style scoped>
:deep(.el-input__wrapper) {
  height: 37px !important;
  flex-grow: 0 !important;
  width: 230px !important;
}
:deep(.el-select__wrapper) {
  height: 37px !important;
  flex-grow: 0 !important;
  width: 250px !important;
}
.item {
  margin: 15px 0;
}
</style>
