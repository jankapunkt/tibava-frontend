<template>
    <div>
        <div class="container">
            <div class="row">
                <div class="col-sm-1">
                    <img class="tibava-logo" src="./../assets/tibava_4.svg" alt="TIB-AV-A" />
                </div>
                <div class="col-sm-3 text-align-left">
                    <h2 class="pd-lg-txt">TIB-AV-A</h2>
                </div>
                <div class="col-sm-8 text-align-left">
                    <h2 class="pd-tittle">TIB AV-Analytics</h2>
                </div>
            </div>
            <!-- <div class="row">
                <div class="col-sm-12">
                    <div class="search pd-search">
                        <input type="text" placeholder="Search for Videos Analysis" name="search" id="search" />
                        <button onClick={this.onSearchClick}><i class="fa fa-search"></i> Search</button>
                    </div>
                </div>
            </div> -->
        </div>
    </div>
</template>

<script>
//import axios from "axios";

export default {
  name: "HeaderView",
  methods: {
      onPlayTimeChange() {
        console.log("the time is anchor2: ");
        //console.log(e.target.currentTime);
      }
  }
}
</script>


<style>
</style>
