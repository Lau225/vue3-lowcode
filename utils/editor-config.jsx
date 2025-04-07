import { ElButton, ElInput } from "element-plus";

function createEditorConfig() {
  const componentList = [];
  const componentMap = {};

  return {
    componentList,
    componentMap,
    register: (component) => {
      componentList.push(component);
      componentMap[component.key] = component;
    },
  };
}

export let registerConfig = createEditorConfig();

registerConfig.register({
  label: "文本",

  key: "text",
});

registerConfig.register({
  label: "按钮",

  key: "button",
});

registerConfig.register({
  label: "输入框",

  key: "input",
});

registerConfig.register({
  label: "下拉框",
  key: "select",
});
