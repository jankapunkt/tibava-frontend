<template>
    <div>
        <div class="text-align-left">
            <div class="w3-sidebar w3-bar-block w3-border-right" style="display:none" id="mySidebar">
                <a href="#"><img src="./../assets/userIcon.png" height="25px" width="25px"/><span>  junaid</span></a>
                <button v-on:click="w3_close()" class="w3-bar-item w3-large">Close &times;</button>
                <a href="#" class="w3-bar-item w3-button">Videos</a>
                <button class="w3-button w3-block w3-left-align" v-on:click="openSubAccordionMenu('meanuAccordion0')">
                Videos <i class="fa fa-caret-right"></i>
                </button>
                <div id="meanuAccordion0" class="w3-hide w3-white w3-card">
                    <a href="#" class="w3-bar-item w3-button" v-on:click="openModal()" >List Uploaded Videos</a>
                    <a href="#" class="w3-bar-item w3-button">Upload New Video</a>
                </div>
                <button class="w3-button w3-block w3-left-align" v-on:click="openSubAccordionMenu('meanuAccordion1')">
                Annotations <i class="fa fa-caret-right"></i>
                </button>
                <div id="meanuAccordion1" class="w3-hide w3-white w3-card">
                    <a href="#" class="w3-bar-item w3-button" v-on:click="openModal()" >Annotation Items</a>
                    <a href="#" class="w3-bar-item w3-button">Annotation Groups</a>
                </div>
                <a href="#" class="w3-bar-item w3-button">Setting</a>
                <a href="#" class="w3-bar-item w3-button">Help</a>
            </div>
            <button class="w3-button w3-xlarge" v-on:click="w3_open()">☰</button>
        </div>
        <!-- <div id="sidebarAnnotationItemsModal" class="modal">
            <div class="modal-content">
                <span class="sidebarAnnotationItemsModalClose text-align-right">&times;</span>
                <div class="container">
                    <div class="row">
                        <h4 class="text-align-left">Annotations Items</h4>
                        <table width="100%" class="text-color">
                            <tbody>
                                <tr class="border-down">
                                    <th class="text-align-center">Item #</th>
                                    <th class="text-align-left">Annotation Name</th>
                                    <th class="text-align-left">Added By</th>
                                    <th class="text-align-center">Actions</th>
                                </tr>
                                <tr class="border-down" height="40px">
                                    <th class="text-align-center">1</th>
                                    <th class="text-align-left">luminous frame</th>
                                    <th class="text-align-left">Junaid</th>
                                    <th class="text-align-center"><a href="#"><i class="fa fa-trash fa-lg red"></i></a></th>
                                </tr>
                                <tr class="border-down" height="40px">
                                    <th class="text-align-center">2</th>
                                    <th class="text-align-left">presenter face</th>
                                    <th class="text-align-left">Junaid</th>
                                    <th class="text-align-center"><a href="#"><i class="fa fa-trash fa-lg red"></i></a></th>
                                </tr>
                                <tr class="border-down" height="40px">
                                    <th class="text-align-center">3</th>
                                    <th class="text-align-left">another face</th>
                                    <th class="text-align-left">Junaid</th>
                                    <th class="text-align-center"><a href="#"><i class="fa fa-trash fa-lg red"></i></a></th>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <br/>
                    <div class="row">
                        <div class="col-sm-12">
                            <div class="form-group row">
                                <label for="title" class="col-sm-2 col-form-label">New Item</label>
                                <div class="col-sm-4">
                                    <input class="form-control" id="itemName" placeholder="Title of the video">
                                </div>
                                <div class="col-sm-4">
                                    <input class="form-control" id="user" placeholder="Title of the video">
                                </div>
                                <div class="col-sm-2">
                                    <button class="btn btn-primary">Add</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div> -->
    </div>
</template>

<script>
//import axios from "axios";

export default {
  name: "SidebarView",
  methods: {
      onPlayTimeChange() {
        console.log("the time is anchor2: ");
        //console.log(e.target.currentTime);
      },
      openModal(){
          var modal = document.getElementById("sidebarAnnotationItemsModal");
          modal.style.display = "block";
      },
      w3_open() {
        document.getElementById("mySidebar").style.display = "block";
    },
    w3_close() {
    document.getElementById("mySidebar").style.display = "none";
    },
     openSubAccordionMenu(accordionId) {
        var x = document.getElementById(accordionId);
        if (x.className.indexOf("w3-show") == -1) {
            x.className += " w3-show";
            x.previousElementSibling.className += " bg-cb-yl";
        } else { 
            x.className = x.className.replace(" w3-show", "");
            x.previousElementSibling.className = 
            x.previousElementSibling.className.replace(" bg-cb-yl", "");
        }
    }
  },
  mounted: function() {
    /* var modal = document.getElementById("sidebarAnnotationItemsModal");
    var span = document.getElementsByClassName("sidebarAnnotationItemsModalClose")[0];
    span.onclick = function() {
    modal.style.display = "none";
    }
    window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
        }
    } */
  }
}
</script>


<style>
@import 'https://www.w3schools.com/w3css/4/w3.css';
@import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
</style>
