<template>
  <div class="editor">
    <div class="editor-left" v-if="!fullScreenShow">
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
      <div class="editor-middle-content">
        <div v-if="fullScreenShow">
          <el-button
            @click="
              fullScreenShow = false;
              previewRef = false;
            "
            >退出全屏预览</el-button
          >
        </div>
        <div class="editor-middle-content-top" v-if="!fullScreenShow">
          <el-button style="width: 60px; height: 30px" @click="back"
            >后退</el-button
          >
          <el-button style="width: 60px; height: 30px" @click="reset"
            >前进</el-button
          >
          <el-button style="width: 60px; height: 30px" @click="exports"
            >导出</el-button
          >
          <el-button
            style="width: 60px; height: 30px"
            @click="outerVisible = true"
            >导入</el-button
          >
          <el-button style="width: 60px; height: 30px" @click="del"
            >删除</el-button
          >
          <el-button @click="handleData">{{
            previewRef ? "编辑" : "预览"
          }}</el-button>
          <el-button
            @click="
              fullScreenShow = true;
              previewRef = true;
            "
            >全屏展示</el-button
          >
        </div>
        <div
          class="editor-middle-content_canvas"
          :style="containerStyles"
          ref="containerRef"
          @mousedown="clearBlockFocus"
        >
          <div
            :class="
              previewRef
                ? item.focus
                  ? 'editor-block editor-block-focus editor-block-preview'
                  : 'editor-block-preview editor-block'
                : item.focus
                ? 'editor-block editor-block-focus'
                : 'editor-block'
            "
            :ref="'blockRef' + index"
            v-for="(item, index) in data.blocks"
            :key="index"
            @click.stop="selected('blockRef' + index, item)"
            @mousedown="(e) => handleMouseDown(e, item, index)"
            :style="{
              top: `${item.top}px`,
              left: `${item.left}px`,
              zIndex: `${item.zIndex}`,
              color: item.color ? item.color : 'black',
              fontSize: item.size ? `${item.size}px` : '16px',
            }"
          >
            <el-button
              :type="item.type ? item.type : 'default'"
              :size="item.size ? item.size : 'default'"
              v-if="item.key === 'button'"
            >
              {{ item.value ? item.value : "按钮" }}
            </el-button>
            <el-input
              style="width: 200px"
              v-model="item.value"
              v-if="item.key === 'input'"
              placeholder="请输入"
            ></el-input>
            <span v-if="item.key === 'text'">
              {{ item.value ? item.value : "文本" }}
            </span>
          </div>
          <div
            class="line-x"
            v-if="markLine.x !== null"
            :style="{ left: markLine.x + 'px' }"
          ></div>
          <div
            class="line-y"
            v-if="markLine.y !== null"
            :style="{ top: markLine.y + 'px' }"
          ></div>
        </div>
      </div>
    </div>
    <div class="editor-right" v-if="!fullScreenShow">
      <Operation :type="type" v-model:data="data" :item="currentItem" />
    </div>
  </div>
  <el-dialog v-model="outerVisible" title="导入JSON">
    <template #default>
      <el-input
        v-model="json"
        type="textarea"
        :autosize="{ minRows: 10, maxRows: 10 }"
      />
    </template>
    <template #footer>
      <div class="dialog-footer">
        <el-button
          @click="
            outerVisible = false;
            json = '';
          "
          >取消</el-button
        >
        <el-button @click="imports">导入</el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog v-model="exportVisible" title="导出JSON">
    <template #default>
      <el-input
        v-model="exportJson"
        type="textarea"
        :autosize="{ minRows: 10, maxRows: 10 }"
      />
    </template>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="exportVisible = false">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import "./editor.scss";
import Operation from "../packages/operation.vue";
import {
  ref,
  inject,
  computed,
  defineProps,
  watch,
  getCurrentInstance,
  nextTick,
  reactive,
} from "vue";
import { ElButton, ElInput, ElDialog, ElMessage } from "element-plus";
import { useCommands } from "../utils/useCommand";
import { events } from "../utils/event";
import full from "core-js/full";
const config = inject("config");
const fullScreenShow = ref(false);
const outerVisible = ref(false);
const exportVisible = ref(false);
const json = ref("");
const exportJson = ref("");
const containerStyles = computed(() => {
  return {
    width: data.value.container.width + "px",
    height: data.value.container.height + "px",
    overflow: "auto",
    background: "#efe6e6cc",
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
const type = ref("");
const props = defineProps({
  modelValue: {
    type: Object,
  },
});
const currentItem = ref();
let currentComponent = null;
const dragenter = (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
};
const currentRef = ref("");
const selected = (ref, item) => {
  if (previewRef.value) return;
  type.value = item.key;
  currentRef.value = ref;
  currentItem.value = item;
};
const del = () => {
  if (currentRef.value === "") {
    return ElMessage.error("请先选择一个组件");
  }
  let index = data.value.blocks.findIndex(
    (item) => item.ref === currentRef.value
  );
  if (index === -1) {
    return ElMessage.error("删除失败");
  }
  data.value.blocks.splice(index, 1);
  delete proxy.$refs[currentRef.value];
  currentRef.value = "";
  data.value.blocks.forEach((item, index) => {
    item.focus = false;
  });
};
const clearBlockFocus = () => {
  if (previewRef.value) return;
  data.value.blocks.forEach((item) => {
    item.focus = false;
  });
  selectIndex.value = -1;
};

const handleMouseDown = (e, item, index) => {
  if (previewRef.value) return;
  e.preventDefault();
  e.stopPropagation();
  if (e.ctrlKey) {
    if (focusData.value.focus.length <= 1) {
      item.focus = true;
    } else {
      item.focus = !item.focus;
    }
  } else {
    if (!item.focus) {
      clearBlockFocus();
      item.focus = true; // 清空其他人的
    } //当自己已经被选中了，再次点击还是选中状态
  }
  selectIndex.value = index;
  mousedown(e);
};

let dragState = {
  startX: 0,
  startY: 0,
  dragging: false, // 默认不是正在拖拽
};

let markLine = reactive({
  x: null,
  y: null,
});

const selectIndex = ref(-1); // 表示没有任何一个被选中

const lastSelectBlock = computed(() => data.value.blocks[selectIndex.value]); // 最后选择的元素

const mousedown = (e) => {
  const { width: BWidth, height: BHeight } = lastSelectBlock.value;

  dragState = {
    startX: e.clientX,
    startY: e.clientY, // 记录每一个选中的位置
    startLeft: lastSelectBlock.value.left,
    startTop: lastSelectBlock.value.top,
    startPos: focusData.value.focus.map(({ top, left }) => ({ top, left })),
    dragging: false,
    line: (() => {
      const { unfocused } = focusData.value; // 获取没选中的 以他们的位置做辅助线

      let lines = { x: [], y: [] };

      [
        ...unfocused,
        {
          top: 0,
          left: 0,
          width: data.value.container.width,
          height: data.value.container.height,
        },
      ].forEach((item) => {
        const { top: ATop, left: ALeft, width: AWidth, height: AHeight } = item;
        // 当此元素拖拽到和A元素top一致的时候，要显示这跟辅助线
        lines.y.push({ showTop: ATop, top: ATop });
        lines.y.push({ showTop: ATop, top: ATop - BHeight }); // 顶对底
        lines.y.push({
          showTop: ATop + AHeight / 2,
          top: ATop + AHeight / 2 - BHeight / 2,
        }); // 中对中
        lines.y.push({
          showTop: ATop + AHeight,
          top: ATop + AHeight,
        });
        lines.y.push({
          showTop: ATop + AHeight,
          top: ATop + AHeight - BHeight,
        }); // 底对顶

        lines.x.push({ showLeft: ALeft, left: ALeft });
        lines.x.push({ showLeft: ALeft + AWidth, left: ALeft + BWidth }); // 右对左
        lines.x.push({
          showLeft: ALeft + AWidth / 2,
          left: ALeft + AWidth / 2 - BWidth / 2,
        }); // 中对中
        lines.x.push({
          showLeft: ALeft + AWidth,
          left: ALeft + AWidth - BWidth,
        }); // 左对右
        lines.x.push({ showLeft: ALeft, left: ALeft - BWidth }); // 左对左
      });
      return lines;
    })(),
  };
  document.addEventListener("mousemove", mousemove);
  document.addEventListener("mouseup", mouseup);
};
const mousemove = (e) => {
  let { clientX: moveX, clientY: moveY } = e;
  if (!dragState.dragging) {
    dragState.dragging = true;
    events.emit("start"); // 触发事件就会记住当前的位置
  }

  // 计算当前元素最新的left和top 去线里面找
  // 鼠标移动后 - 鼠标移动前 + left
  let left = moveX - dragState.startX + dragState.startLeft;
  let top = moveY - dragState.startY + dragState.startTop;

  // 先计算横线 距离参照物元素还有5像素的时候 就显示这根线
  let y = null;
  let x = null;
  for (let i = 0; i < dragState.line.y.length; i++) {
    const { top: t, showTop: s } = dragState.line.y[i];
    if (Math.abs(t - top) < 5) {
      y = s;
      moveY = dragState.startY - dragState.startTop + t; // 容器距离顶部的距离 + 目标的高度
      // 实现快速和这个元素贴在一起

      break; // 找到一根后就退出循环
    }
  }
  for (let i = 0; i < dragState.line.x.length; i++) {
    const { left: l, showLeft: s } = dragState.line.x[i];
    if (Math.abs(l - left) < 5) {
      x = s;
      moveX = dragState.startX - dragState.startLeft + l; // 容器距离顶部的距离 + 目标的高度
      // 实现快速和这个元素贴在一起

      break; // 找到一根后就退出循环
    }
  }
  markLine.x = x;
  markLine.y = y;

  let durX = moveX - dragState.startX;
  let durY = moveY - dragState.startY;

  focusData.value.focus.forEach((item, index) => {
    item.top = dragState.startPos[index].top + durY;
    item.left = dragState.startPos[index].left + durX;
  });
};
const mouseup = (e) => {
  document.removeEventListener("mousemove", mousemove);
  document.removeEventListener("mouseup", mouseup);
  markLine.x = null;
  markLine.y = null;
  if (dragState.dragging) {
    events.emit("end"); // 触发事件就会记住当前的位置
  }
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
        value: "",
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
    value.blocks.forEach((item) => {
      nextTick(() => {
        if (proxy.$refs[item.ref]) {
          let { offsetWidth, offsetHeight } = proxy.$refs[item.ref][0];
          if (item.alignCenter) {
            item.left = item.left - offsetWidth / 2;
            item.top = item.top - offsetHeight / 2;
            item.alignCenter = false;
          }
          item.width = offsetWidth;
          item.height = offsetHeight;
        }
      });
    });
  },
  { deep: true }
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
  events.emit("start"); // 发布事件
};
const dragend = (e) => {
  // 移除事件监听器
  containerRef.value.removeEventListener("dragover", dragover);
  containerRef.value.removeEventListener("drop", drop);
  containerRef.value.removeEventListener("dragleave", dragleave);
  containerRef.value.removeEventListener("dragenter", dragenter);
  events.emit("end"); // 发布事件
};

const { commands } = useCommands(data);
const back = () => {
  commands.undo();
};

const reset = () => {
  commands.redo();
};

const exports = () => {
  exportVisible.value = true;
  exportJson.value = JSON.stringify(data.value.blocks);
};

const imports = () => {
  if (json.value !== "") {
    let arr = JSON.parse(JSON.stringify(data.value.blocks));
    JSON.parse(json.value).forEach((item) => {
      item.ref = "blockRef" + arr.length;
      arr.push(item);
    });
    data.value.blocks = arr;
    outerVisible.value = false;
    json.value = "";
  } else {
    ElMessage.error("填写json格式的数据");
  }
};

const previewRef = ref(false);

const handleData = () => {
  previewRef.value = !previewRef.value;
  data.value.blocks.forEach((item) => {
    item.focus = false;
  });
};
</script>
