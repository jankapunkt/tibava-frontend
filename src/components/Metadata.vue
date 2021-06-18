<template>
    <div>
        <table width="100%" class="text-color">
        <tbody>
            <tr class="border-down">
                <th width="25%" class="text-align-left"><p>Title:</p></th>
                <th width="75%" class="text-align-left"><p>{{curMetadata["title"]}}</p></th>
            </tr>
            <tr class="border-down">
                <th width="25%" class="text-align-left"><p>Duration:</p></th>
                <th width="75%" class="text-align-left"><p>{{curMetadata["duration"]}}</p></th>
            </tr>
            <tr class="border-down">
                <th width="25%" class="text-align-left"><p>Frame Rate:</p></th>
                <th width="75%" class="text-align-left"><p>{{curMetadata["fps"]}}</p></th>
            </tr>
            <tr class="border-down">
                <th width="25%" class="text-align-left"><p>Resolution:</p></th>
                <th width="75%" class="text-align-left"><p>{{curMetadata["source_size"][0]}} x {{curMetadata["source_size"][1]}}</p></th>
            </tr>
            <tr class="border-down">
                <th width="25%" class="text-align-left"><p>Path:</p></th>
                <th width="75%" class="text-align-left"><p>{{curMetadata["path"]}}</p></th>
            </tr>
        </tbody>
    </table>
    </div>
</template>

<script>

export default {
  name: "MetadataView",
  props: ["vidMetadata"],
  data() {
        return {
            curMetadata:{ 'codec': '', 'duration': 0, 'ffmpeg_version': '', 'fps': 24.0, 'nframes': 'inf', 'path': '.mp4', 'pix_fmt': '', 'plugin': 'ffmpeg', 'size': [1280, 720], 'source_size': [1280, 720], 'title': '' },
            }
        },
  methods: {
      onPlayTimeChange() {
      }
  },
  updated:function() {
      this.curMetadata = this.vidMetadata;
  }
}
</script>


<style>
</style>
