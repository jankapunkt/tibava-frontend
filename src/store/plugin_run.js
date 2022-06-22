import { defineStore } from 'pinia'

export const usePluginRunStore = defineStore('pluginRun', {
    state: () => {
        return {
            pluginRuns: {},
            pluginRunList: [],
        }
    },
    getters: {
        pluginRunByVideoId: (state) => {
            return (videoId) => {
                return state.pluginRunList.map(id => state.pluginRuns[id]).filter(e => e.video_id === videoId)
            }
        }
    },
    actions: {
        async list() {
            return axios
                .get(`${config.API_LOCATION}/video/list`)
                .then((res) => {
                    if (res.data.status === "ok") {
                        const entries = res.data.entries;

                        this.pluginRuns = {}
                        this.pluginRunList = []
                        entries.forEach((e, i) => {
                            this.pluginRuns[e.id] = e
                            this.pluginRunList.push(e.id)
                        });
                    }
                })
        },
    },
})