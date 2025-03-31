import { computed, defineComponent, inject, ref } from "vue";
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

    const containerRef = ref(null);
    let currentComponent = null;
    const dragenter = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    };
    const dragleave = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "none";
    };
    const drop = (e) => {
      console.log(currentComponent);
      currentComponent = null;
    };
    const dragover = (e) => {
      e.preventDefault();
    };

    const dragstart = (e, component) => {
      console.log(containerRef.value);

      containerRef.value.addEventListener("dragover", dragover);
      containerRef.value.addEventListener("drop", drop);
      containerRef.value.addEventListener("dragleave", dragleave);
      containerRef.value.addEventListener("dragenter", dragenter);
      // e.dataTransfer.setData("component", JSON.stringify(component));
      currentComponent = component;
    };

    const test = () => {
      console.log(123456);
    };

    console.log("33");

    return () => (
      <div draggable={true} onDragStart={test}>
        123456
      </div>
      // <div class="editor" onMouseDown={test}>
      //   <div class="editor-left">
      //     {/* 实现拖拽效果 */}
      //     {config.componentList.map((component) => (
      //       <div
      //         class="editor-left-item"
      //         draggable
      //         onDrag={(e) => dragstart(e, component)}
      //       >
      //         <span>{component.label}</span>
      //         <div>{component.preview()}</div>
      //       </div>
      //     ))}
      //   </div>
      //   <div class="editor-middle">
      //     <div class="editor-middle-top">菜单</div>
      //     <div class="editor-middle-content">
      //       <div
      //         class="editor-middle-content_canvas"
      //         style={containerStyles.value}
      //         ref={containerRef}
      //       >
      //         {data.value.blocks.map((item) => {
      //           let blockStyles = {
      //             top: `${item.top}px`,
      //             left: `${item.left}px`,
      //             zIndex: `${item.zIndex}`,
      //           };
      //           const component = config.componentMap[item.key];
      //           const RenderComponent = component.render();
      //           return (
      //             <div class="editor-block" style={blockStyles}>
      //               {RenderComponent}
      //             </div>
      //           );
      //         })}
      //       </div>
      //     </div>
      //   </div>
      //   <div class="editor-right">属性控制栏目</div>
      // </div>
    );
  },
});
