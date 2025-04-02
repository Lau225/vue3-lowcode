import deepcopy from "deepcopy"
import { events } from "./event"
import { onUnmounted } from "vue"

export function useCommands(data) {
    const state = {
        current: -1,
        queue: [], // 存放所有的操作命令
        commands: {},// 制作命令和执行功能的映射表
        commandArray: [],//存放所有的命令
        distoryList: []
    }

    const registry = (command) => {
        state.commandArray.push(command)
        state.commands[command.name] = () => {
            const { redo, undo } = command.execute()
            redo()
            if (!command.pushQueue) {
                return
            }
            let { queue, current } = state
            if (queue.length > 0) {
                queue = queue.slice(0, current + 1) // 移除当前指令
                state.queue = queue
            }
            queue.push({ redo, undo }) // 保存指令前进和后退
            state.current = current + 1
            console.log(queue);

        }
    }

    // 注册命令
    const commands = [
        {
            name: 'redo',
            keyboard: 'ctrl+y',
            execute() {
                return {
                    redo() {
                        let item = state.queue[state.current + 1]
                        if (item) {
                            item.redo && item.redo()
                            state.current++
                        }
                    }
                }
            }
        },
        {
            name: 'undo',
            keyboard: 'ctrl+z',
            execute() {
                return {
                    redo() {
                        if (state.current === -1) {
                            return;
                        }
                        let item = state.queue[state.current]
                        if (item) {
                            item.undo && item.undo()
                            state.current--
                        }
                    }
                }
            }
        },
        {
            name: 'drag',
            pushQueue: true,
            init() {
                this.before = null
                const start = () => {
                    this.before = deepcopy(data.value.blocks)
                }
                const end = () => {
                    state.commands.drag()
                }
                events.on('start', start)
                events.on('end', end)
                return () => {
                    events.off('start')
                    events.off('end')
                }
            },
            execute() {
                let before = this.before
                let after = data.value.blocks
                return {
                    redo() {
                        data.value = { ...data.value, blocks: after }
                    },
                    undo() {
                        data.value = { ...data.value, blocks: before }
                    }
                }
            }
        }
    ]

    const keyboardEvent = (() => {
        const keyCodes = {
            90: 'z',
            89: 'y'
        }
        const init = () => {
            const onKeyDown = (e) => {
                const { ctrlKey, keyCode } = e;
                let keyString = []
                if (ctrlKey) keyString.push('ctrl')
                keyString.push(keyCodes[keyCode])
                keyString = keyString.join('+')

                state.commandArray.forEach(({ keyboard, name }) => {
                    if (!keyboard) return;
                    if (keyboard === keyString) {
                        state.commands[name]()
                        e.preventDefault()
                    }
                })
            }
            window.addEventListener('keydown', onKeyDown)
            return () => {
                window.removeEventListener('keydown', onKeyDown)
            }
        }
        return init
    })()
    // 注册所有命令
    commands.forEach(command => registry(command))
    state.distoryList.push(keyboardEvent())

    // 初始化所有命令
    state.commandArray.forEach(command => command.init && state.distoryList.push(command.init()))

    onUnmounted(() => {
        state.distoryList.forEach(destroy => destroy && destroy())
    })

    return state
}