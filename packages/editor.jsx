import { computed, defineComponent, inject } from "vue";
import "./editor.scss";
export default defineComponent({
  props: {
    modelValue: { type: Object },
  },
  setup(props) {
    let data = computed({
      get() {
        return props.modelValue;
      },
    });

    const containerStyles = computed(() => {
      return {
        width: data.value.container.width,
        height: data.value.container.height,
      };
    });
    const config = inject("config");

    return () => (
      <div class="editor">
        <div class="editor-left">
          {config.componentList.map((component) => (
            <div class="editor-left-item">
              <span>{component.label}</span>
              <div>{component.preview()}</div>
            </div>
          ))}
        </div>
        <div class="editor-middle">
          <div class="editor-middle-top">菜单</div>
          <div class="editor-middle-content">
            <div
              class="editor-middle-content_canvas"
              style={containerStyles.value}
            >
              {data.value.blocks.map((item) => {
                let blockStyles = {
                  top: `${item.top}px`,
                  left: `${item.left}px`,
                  zIndex: `${item.zIndex}`,
                };
                const component = config.componentMap[item.key];
                const RenderComponent = component.render();
                return (
                  <div class="editor-block" style={blockStyles}>
                    {RenderComponent}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div class="editor-right">属性控制栏目</div>
      </div>
    );
  },
});
