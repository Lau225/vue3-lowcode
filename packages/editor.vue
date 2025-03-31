<template>
  <div class="editor">
    <div class="editor-left">
      <div
        v-for="(item, index) in config.componentList"
        :key="index"
        class="editor-left-item"
        draggable="true"
        @dragstart="(e) => dragstart(e, item)"
        @dragend="(e) => dragend(e)"
      >
        <span>{{ item.label }}</span>
        <el-button v-if="config.componentMap[item.key].key === 'button'">{{
          config.componentMap[item.key].label
        }}</el-button>
        <el-input
          v-if="config.componentMap[item.key].key === 'input'"
          placeholder="请输入"
        ></el-input>
        <div v-if="item.label === '文本'">文本</div>
      </div>
    </div>
    <div class="editor-middle">
      <div class="editor-middle-top">菜单</div>
      <div class="editor-middle-content">
        <div
          class="editor-middle-content_canvas"
          :style="containerStyles"
          ref="containerRef"
          @mousedown="clearBlockFocus"
        >
          <div
            :class="
              item.focus ? 'editor-block editor-block-focus' : 'editor-block'
            "
            :ref="'blockRef' + index"
            v-for="(item, index) in data.blocks"
            :key="index"
            @mousedown="(e) => handleMouseDown(e, item)"
            :style="{
              top: `${item.top}px`,
              left: `${item.left}px`,
              zIndex: `${item.zIndex}`,
            }"
          >
            <el-button v-if="config.componentMap[item.key].key === 'button'">{{
              config.componentMap[item.key].label
            }}</el-button>
            <el-input
              style="width: 200px"
              v-if="config.componentMap[item.key].key === 'input'"
              placeholder="请输入"
            ></el-input>
            <span v-if="config.componentMap[item.key].key === 'text'">{{
              config.componentMap[item.key].label
            }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="editor-right">属性控制栏目</div>
  </div>
</template>

<script setup>
import "./editor.scss";
import {
  ref,
  inject,
  computed,
  defineProps,
  watch,
  getCurrentInstance,
  nextTick,
} from "vue";
import { ElButton, ElInput } from "element-plus";
const config = inject("config");
const containerStyles = computed(() => {
  return {
    width: data.value.container.width,
    height: data.value.container.height,
    overflow: "auto",
    background: "green",
    margin: "10px 10px 10px 10px",
  };
});
let data = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});
let { proxy } = getCurrentInstance();
const emit = defineEmits(["update:modelValue"]);
const containerRef = ref(null);
const props = defineProps({
  modelValue: {
    type: Object,
  },
});
let currentComponent = null;
const dragenter = (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
};
const clearBlockFocus = () => {
  data.value.blocks.forEach((item) => {
    item.focus = false;
  });
};

const handleMouseDown = (e, item) => {
  e.preventDefault();
  e.stopPropagation();
  if (e.ctrlKey) {
    item.focus = !item.focus;
  } else {
    if (!item.focus) {
      clearBlockFocus();
      item.focus = true; // 清空其他人的
    } else {
      item.focus = false;
    }
  }
  mousedown(e);
};

let dragState = {
  startX: 0,
  startY: 0,
};

const mousemove = (e) => {
  let { clientX: moveX, clientY: moveY } = e;
  let durX = moveX - dragState.startX;
  let durY = moveY - dragState.startY;

  focusData.value.focus.forEach((item, index) => {
    item.top = dragState.startPos[index].top + durY;
    item.left = dragState.startPos[index].left + durX;
  });
};

const mousedown = (e) => {
  dragState = {
    startX: e.clientX,
    startY: e.clientY, // 记录每一个选中的位置
    startPos: focusData.value.focus.map(({ top, left }) => ({ top, left })),
  };
  document.addEventListener("mousemove", mousemove);
  document.addEventListener("mouseup", mouseup);
};

const mouseup = (e) => {
  document.removeEventListener("mousemove", mousemove);
  document.removeEventListener("mouseup", mouseup);
};
const dragleave = (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "none";
};
const drop = (e) => {
  e.preventDefault();
  let blocks = data.value.blocks;
  data.value = {
    ...data.value,
    blocks: [
      ...blocks,
      {
        // 在鼠标居中位置显示
        top: e.offsetY,
        left: e.offsetX,
        zIndex: 1,
        key: currentComponent.key,
        alignCenter: true,
        ref: "blockRef" + blocks.length,
      },
    ],
  };
  currentComponent = null;
};
const dragover = (e) => {
  e.preventDefault();
};

watch(
  () => props.modelValue,
  (value) => {
    nextTick(() => {
      value.blocks.forEach((item) => {
        if (item.alignCenter) {
          let { offsetWidth, offsetHeight } = proxy.$refs[item.ref][0];
          console.log(proxy.$refs[item.ref][0]);

          item.left = item.left - offsetWidth / 2;
          item.top = item.top - offsetHeight / 2;
          item.alignCenter = false;
        }
      });
    });
  }
);

const focusData = computed(() => {
  let focus = [];
  let unfocused = [];
  data.value.blocks.forEach((item) => {
    item.focus ? focus.push(item) : unfocused.push(item);
  });
  return {
    focus,
    unfocused,
  };
});

const dragstart = (e, component) => {
  // 只保存必要的数据，而不是整个组件对象
  currentComponent = {
    key: component.key,
    label: component.label,
    // 如果需要其他必要的数据，可以在这里添加
  };

  // 添加事件监听器
  containerRef.value.addEventListener("dragover", dragover);
  containerRef.value.addEventListener("drop", drop);
  containerRef.value.addEventListener("dragleave", dragleave);
  containerRef.value.addEventListener("dragenter", dragenter);
};
const dragend = (e) => {
  // 移除事件监听器
  containerRef.value.removeEventListener("dragover", dragover);
  containerRef.value.removeEventListener("drop", drop);
  containerRef.value.removeEventListener("dragleave", dragleave);
  containerRef.value.removeEventListener("dragenter", dragenter);
};
</script>
